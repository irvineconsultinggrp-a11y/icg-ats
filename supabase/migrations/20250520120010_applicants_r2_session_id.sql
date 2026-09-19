-- Round 2 interview room/time assignment (Round 1 uses gi_session_id).

alter table public.applicants
  add column if not exists r2_session_id text;
