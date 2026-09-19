-- Traffic-light rating on each officer's coffee chat note (green / yellow / red).

alter table public.applicant_notes
  add column if not exists signal text;

alter table public.applicant_notes drop constraint if exists applicant_notes_signal_check;
alter table public.applicant_notes add constraint applicant_notes_signal_check
  check (signal is null or signal in ('green', 'yellow', 'red'));

create index if not exists applicant_notes_applicant_signal_idx
  on public.applicant_notes (applicant_id, signal)
  where signal is not null;
