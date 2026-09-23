-- Log each successful interview schedule email (Round 1 / Round 2 / BBQ).

create table if not exists public.interview_schedule_email_sends (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants (id) on delete cascade,
  campaign text not null check (campaign in ('round-1', 'round-2', 'bbq')),
  assignment_id text,
  schedule_date text,
  time_block text,
  room text,
  sent_at timestamptz not null default now(),
  sent_by uuid,
  resend_message_id text
);

create index if not exists interview_schedule_email_sends_applicant_idx
  on public.interview_schedule_email_sends (applicant_id, campaign, sent_at desc);

alter table public.interview_schedule_email_sends enable row level security;

drop policy if exists interview_schedule_email_sends_select_officer on public.interview_schedule_email_sends;
create policy interview_schedule_email_sends_select_officer
  on public.interview_schedule_email_sends for select
  to authenticated
  using ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');

drop policy if exists interview_schedule_email_sends_insert_officer on public.interview_schedule_email_sends;
create policy interview_schedule_email_sends_insert_officer
  on public.interview_schedule_email_sends for insert
  to authenticated
  with check ((coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'officer');
