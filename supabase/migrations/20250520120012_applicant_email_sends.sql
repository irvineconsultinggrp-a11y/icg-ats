-- Log officer / system transactional emails (rejections, offers, coffee chat, etc.)

create table if not exists public.applicant_email_sends (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants (id) on delete cascade,
  template_id text not null,
  sent_at timestamptz not null default now(),
  sent_by uuid,
  provider_message_id text
);

create index if not exists applicant_email_sends_applicant_idx
  on public.applicant_email_sends (applicant_id, template_id, sent_at desc);

alter table public.applicant_email_sends enable row level security;

drop policy if exists applicant_email_sends_select_officer on public.applicant_email_sends;
create policy applicant_email_sends_select_officer
  on public.applicant_email_sends for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists applicant_email_sends_insert_officer on public.applicant_email_sends;
create policy applicant_email_sends_insert_officer
  on public.applicant_email_sends for insert
  to authenticated
  with check ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');
