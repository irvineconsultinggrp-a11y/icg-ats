-- Allow applicants to update their own application rows (deadline enforced in API).
drop policy if exists applicants_update_own on public.applicants;
create policy applicants_update_own
  on public.applicants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
