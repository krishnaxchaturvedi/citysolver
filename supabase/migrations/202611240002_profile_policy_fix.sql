-- Remove the recursive profile update policy from the initial migration.
-- Profile role changes must be performed by a trusted project administrator.
drop policy if exists "profiles update self" on public.profiles;

create policy "profiles update own details without role changes"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = public.current_citysolver_role());
