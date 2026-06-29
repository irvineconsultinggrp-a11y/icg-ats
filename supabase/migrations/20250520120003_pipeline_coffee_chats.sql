-- Recruitment pipeline stage fields on applicants + coffee chat requests.

alter table public.applicants
  add column if not exists gi_status text not null default 'pending',
  add column if not exists gi_session_id text,
  add column if not exists gi_score int,
  add column if not exists gi_notes text not null default '',
  add column if not exists cc_status text not null default 'pending',
  add column if not exists cc_scheduled_date text,
  add column if not exists cc_scheduled_time text,
  add column if not exists cc_assigned_officer_id uuid references public.officers (id) on delete set null,
  add column if not exists cc_assigned_officer_name text,
  add column if not exists cc_score int,
  add column if not exists cc_notes text not null default '',
  add column if not exists decision_status text not null default 'pending',
  add column if not exists decision_notes text not null default '',
  add column if not exists updated_at timestamptz default now();

alter table public.applicants drop constraint if exists applicants_gi_status_check;
alter table public.applicants add constraint applicants_gi_status_check
  check (gi_status in ('pending', 'scheduled', 'completed', 'rejected'));

alter table public.applicants drop constraint if exists applicants_cc_status_check;
alter table public.applicants add constraint applicants_cc_status_check
  check (cc_status in ('pending', 'scheduled', 'completed', 'rejected'));

alter table public.applicants drop constraint if exists applicants_decision_status_check;
alter table public.applicants add constraint applicants_decision_status_check
  check (decision_status in ('pending', 'accepted', 'rejected'));

create index if not exists applicants_gi_status_idx on public.applicants (gi_status);
create index if not exists applicants_cc_status_idx on public.applicants (cc_status);
create index if not exists applicants_decision_status_idx on public.applicants (decision_status);

-- Applicant-initiated coffee chat requests
create table if not exists public.coffee_chat_requests (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references auth.users (id) on delete cascade,
  applicant_id uuid references public.applicants (id) on delete set null,
  officer_id uuid not null references public.officers (id) on delete cascade,
  status text not null default 'pending',
  message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coffee_chat_requests_status_check
    check (status in ('pending', 'accepted', 'declined', 'completed', 'canceled'))
);

create unique index if not exists coffee_chat_requests_pending_uidx
  on public.coffee_chat_requests (applicant_user_id, officer_id)
  where status = 'pending';

create index if not exists coffee_chat_requests_officer_idx
  on public.coffee_chat_requests (officer_id);

create index if not exists coffee_chat_requests_applicant_user_idx
  on public.coffee_chat_requests (applicant_user_id);

alter table public.coffee_chat_requests enable row level security;

drop policy if exists coffee_chat_requests_select_own on public.coffee_chat_requests;
create policy coffee_chat_requests_select_own
  on public.coffee_chat_requests for select
  to authenticated
  using (applicant_user_id = auth.uid());

drop policy if exists coffee_chat_requests_insert_own on public.coffee_chat_requests;
create policy coffee_chat_requests_insert_own
  on public.coffee_chat_requests for insert
  to authenticated
  with check (applicant_user_id = auth.uid());

drop policy if exists coffee_chat_requests_select_officer on public.coffee_chat_requests;
create policy coffee_chat_requests_select_officer
  on public.coffee_chat_requests for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists coffee_chat_requests_update_officer on public.coffee_chat_requests;
create policy coffee_chat_requests_update_officer
  on public.coffee_chat_requests for update
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer')
  with check ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

-- Applicants can browse officer directory (name, role, calendly, avatar only)
drop policy if exists officers_select_for_applicant_directory on public.officers;
create policy officers_select_for_applicant_directory
  on public.officers for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'applicant');
