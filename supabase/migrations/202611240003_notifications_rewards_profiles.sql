-- Persist citizen preferences and generate notifications/rewards from database events.
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists preferences jsonb not null default '{}'::jsonb;

create or replace function public.notify_complaint_status_change()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications(user_id,title,message)
    values (
      new.citizen_id,
      case new.status
        when 'Approved' then 'Complaint approved'
        when 'Assigned' then 'Officer assigned'
        when 'In Progress' then 'Work in progress'
        when 'Resolved' then 'Complaint resolved'
        when 'Rejected' then 'Complaint update'
        else 'Complaint status updated'
      end,
      'Ticket ' || new.ticket_id || ' is now ' || new.status || '.'
    );
  end if;
  if new.status = 'Resolved' and old.status is distinct from 'Resolved' then
    insert into public.reward_ledger(citizen_id,complaint_id,amount,reason)
    values (
      new.citizen_id,
      new.id,
      case new.priority when 'Critical' then 150 when 'High' then 90 when 'Medium' then 60 else 30 end,
      'Complaint resolved'
    )
    on conflict (citizen_id,complaint_id,reason) do nothing;
    insert into public.notifications(user_id,title,message)
    values (new.citizen_id,'Civic coins earned','Coins were added for resolving ticket ' || new.ticket_id || '.');
  end if;
  return new;
end;
$$;

drop trigger if exists complaint_status_notifications on public.complaints;
create trigger complaint_status_notifications
after update of status on public.complaints
for each row execute function public.notify_complaint_status_change();

-- Citizens can update only their own editable profile fields; role remains protected.
drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update own details" on public.profiles for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_citysolver_role()
);

create policy "users delete own notifications" on public.notifications for delete to authenticated using (user_id = auth.uid());
