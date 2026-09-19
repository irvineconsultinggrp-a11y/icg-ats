-- Recruitment restructure: replace the Group Interview with two individual rounds and a
-- BBQ social. Round 1 reuses the existing gi_* columns (it is the first individual round);
-- Round 2 and the BBQ social get new columns.

alter table public.applicants
  add column if not exists r2_status text not null default 'pending',
  add column if not exists r2_score int,
  add column if not exists r2_notes text not null default '',
  add column if not exists social_status text not null default 'pending';

alter table public.applicants drop constraint if exists applicants_r2_status_check;
alter table public.applicants add constraint applicants_r2_status_check
  check (r2_status in ('pending', 'scheduled', 'completed', 'rejected'));

alter table public.applicants drop constraint if exists applicants_social_status_check;
alter table public.applicants add constraint applicants_social_status_check
  check (social_status in ('pending', 'accepted', 'rejected'));

create index if not exists applicants_r2_status_idx on public.applicants (r2_status);
create index if not exists applicants_social_status_idx on public.applicants (social_status);

-- Pipeline gates for the new stages:
--   round-1   : app_status = 'advanced'      (unchanged from the old group interview)
--   round-2   : gi_status  = 'completed'
--   bbq-social: social_status = 'accepted'
--   decisions : social_status = 'accepted'
create index if not exists applicants_r2_status_created_at_idx
  on public.applicants (r2_status, created_at desc)
  where gi_status = 'completed';

create index if not exists applicants_social_status_created_at_idx
  on public.applicants (social_status, created_at desc);
