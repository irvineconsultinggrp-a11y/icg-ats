-- Per-applicant coffee-chat notes "folder": many notes, one authored by each officer.
-- Replaces the single shared applicants.cc_notes text field with attributed, timestamped notes.

create table if not exists public.applicant_notes (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants (id) on delete cascade,
  author_user_id uuid references auth.users (id) on delete set null,
  author_name text not null default '',
  title text not null default '',
  body_html text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applicant_notes_applicant_idx
  on public.applicant_notes (applicant_id, updated_at desc);

create index if not exists applicant_notes_author_idx
  on public.applicant_notes (author_user_id);

alter table public.applicant_notes enable row level security;

-- Any officer can read every applicant's notes folder.
drop policy if exists applicant_notes_select_officer on public.applicant_notes;
create policy applicant_notes_select_officer
  on public.applicant_notes for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

-- Officers can create notes, but only authored as themselves.
drop policy if exists applicant_notes_insert_officer on public.applicant_notes;
create policy applicant_notes_insert_officer
  on public.applicant_notes for insert
  to authenticated
  with check (
    (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer'
    and author_user_id = auth.uid()
  );

-- Only the author can edit their own note.
drop policy if exists applicant_notes_update_author on public.applicant_notes;
create policy applicant_notes_update_author
  on public.applicant_notes for update
  to authenticated
  using (
    (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer'
    and author_user_id = auth.uid()
  )
  with check (
    (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer'
    and author_user_id = auth.uid()
  );

-- Only the author can delete their own note.
drop policy if exists applicant_notes_delete_author on public.applicant_notes;
create policy applicant_notes_delete_author
  on public.applicant_notes for delete
  to authenticated
  using (
    (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer'
    and author_user_id = auth.uid()
  );
