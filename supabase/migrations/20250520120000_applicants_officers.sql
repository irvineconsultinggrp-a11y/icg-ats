-- Incremental migration for existing ICG ATS schema.
-- public.officers and public.applicants already exist; add app columns, RLS policies, indexes.
-- Create the `resumes` storage bucket separately (see 20250520120001_resumes_storage.sql).

-- --- officers: extend for coffee-chat / directory ---
alter table public.officers
  add column if not exists avatar_url text,
  add column if not exists class_year int,
  add column if not exists hobbies text,
  add column if not exists calendly_link text,
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null,
  add column if not exists category text;

alter table public.officers drop constraint if exists officers_category_check;
alter table public.officers add constraint officers_category_check
  check (category is null or category in ('executive', 'director', 'consultant', 'cohort'));

create unique index if not exists officers_auth_user_id_uidx
  on public.officers (auth_user_id)
  where auth_user_id is not null;

create index if not exists officers_category_idx on public.officers (category);

-- --- applicants: auth user, application form fields, pipeline status text ---
alter table public.applicants drop constraint if exists applicants_email_key;

alter table public.applicants
  add column if not exists user_id uuid references auth.users (id) on delete cascade,
  add column if not exists position text not null default 'legacy',
  add column if not exists grad_year int,
  add column if not exists majors text,
  add column if not exists minors text,
  add column if not exists career_goals text,
  add column if not exists linkedin_url text,
  add column if not exists commitments text,
  add column if not exists info_session text,
  add column if not exists available_slots jsonb not null default '[]'::jsonb,
  add column if not exists app_status text not null default 'new',
  add column if not exists notes text not null default '',
  add column if not exists gpa text,
  add column if not exists resume_path text;

alter table public.applicants drop constraint if exists applicants_app_status_check;
alter table public.applicants add constraint applicants_app_status_check
  check (app_status in ('new', 'reviewing', 'advanced', 'rejected'));

create unique index if not exists applicants_user_id_position_uidx
  on public.applicants (user_id, position)
  where user_id is not null;

create index if not exists applicants_user_id_idx on public.applicants (user_id);
create index if not exists applicants_app_status_idx on public.applicants (app_status);
create index if not exists applicants_created_at_idx on public.applicants (created_at desc);

-- --- RLS ---
alter table public.officers enable row level security;
alter table public.applicants enable row level security;

drop policy if exists officers_select_for_officer_role on public.officers;
create policy officers_select_for_officer_role
  on public.officers for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists applicants_select_own on public.applicants;
create policy applicants_select_own
  on public.applicants for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists applicants_insert_own on public.applicants;
create policy applicants_insert_own
  on public.applicants for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists applicants_select_for_officer_role on public.applicants;
create policy applicants_select_for_officer_role
  on public.applicants for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists applicants_update_for_officer_role on public.applicants;
create policy applicants_update_for_officer_role
  on public.applicants for update
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer')
  with check ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');
