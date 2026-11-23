-- CitySolver core data model. Apply in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'citizen' check (role in ('citizen','officer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  description text not null,
  location text not null,
  landmark text,
  latitude double precision not null,
  longitude double precision not null,
  image_url text,
  priority text not null default 'Medium' check (priority in ('Critical','High','Medium','Low')),
  risk_score integer not null default 50 check (risk_score between 0 and 100),
  status text not null default 'Submitted' check (status in ('Submitted','Under Review','Approved','Assigned','In Progress','Resolved','Rejected')),
  assigned_officer_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(citizen_id, complaint_id, reason)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists complaints_citizen_created_idx on public.complaints(citizen_id, created_at desc);
create index if not exists complaints_status_priority_idx on public.complaints(status, priority);
create index if not exists complaint_events_complaint_created_idx on public.complaint_events(complaint_id, created_at);

create or replace function public.handle_new_citysolver_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_citysolver_user_created on auth.users;
create trigger on_citysolver_user_created after insert on auth.users
for each row execute procedure public.handle_new_citysolver_user();

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_events enable row level security;
alter table public.reward_ledger enable row level security;
alter table public.notifications enable row level security;

create or replace function public.current_citysolver_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create policy "profiles read self or staff" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_citysolver_role() in ('officer','admin'));
create policy "profiles update self" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "citizens create own complaints" on public.complaints for insert to authenticated
with check (citizen_id = auth.uid());
create policy "citizens read own and staff read all" on public.complaints for select to authenticated
using (citizen_id = auth.uid() or public.current_citysolver_role() in ('officer','admin'));
create policy "staff update complaints" on public.complaints for update to authenticated
using (public.current_citysolver_role() in ('officer','admin'))
with check (public.current_citysolver_role() in ('officer','admin'));

create policy "complaint events visible to owner or staff" on public.complaint_events for select to authenticated
using (exists(select 1 from public.complaints c where c.id = complaint_id and (c.citizen_id = auth.uid() or public.current_citysolver_role() in ('officer','admin'))));
create policy "staff create complaint events" on public.complaint_events for insert to authenticated
with check (public.current_citysolver_role() in ('officer','admin') or actor_id = auth.uid());

create policy "citizens read own rewards" on public.reward_ledger for select to authenticated using (citizen_id = auth.uid());
create policy "staff issue rewards" on public.reward_ledger for insert to authenticated with check (public.current_citysolver_role() = 'admin');

create policy "users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "users update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Create a private storage bucket for evidence uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-evidence','complaint-evidence',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "authenticated upload evidence" on storage.objects for insert to authenticated
with check (bucket_id = 'complaint-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners and staff read evidence" on storage.objects for select to authenticated
using (bucket_id = 'complaint-evidence' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_citysolver_role() in ('officer','admin')));
