-- Officer hosting a room for a specific Round 1 time block (one name per room × time).

create table if not exists public.interview_room_hosts (
  slot_key text primary key,
  officer_name text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists interview_room_hosts_updated_idx
  on public.interview_room_hosts (updated_at desc);

alter table public.interview_room_hosts enable row level security;

drop policy if exists interview_room_hosts_select_officer on public.interview_room_hosts;
create policy interview_room_hosts_select_officer
  on public.interview_room_hosts for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists interview_room_hosts_upsert_officer on public.interview_room_hosts;
create policy interview_room_hosts_insert_officer
  on public.interview_room_hosts for insert
  to authenticated
  with check ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists interview_room_hosts_update_officer on public.interview_room_hosts;
create policy interview_room_hosts_update_officer
  on public.interview_room_hosts for update
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer')
  with check ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists interview_room_hosts_delete_officer on public.interview_room_hosts;
create policy interview_room_hosts_delete_officer
  on public.interview_room_hosts for delete
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');
