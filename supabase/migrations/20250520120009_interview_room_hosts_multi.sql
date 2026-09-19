-- Up to 4 hosting officers per room × time block.

alter table public.interview_room_hosts
  add column if not exists officer_names text[] not null default '{}';

update public.interview_room_hosts
set officer_names = case
  when coalesce(trim(officer_name), '') <> '' then array[trim(officer_name)]
  else '{}'::text[]
end
where officer_names = '{}'::text[]
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'interview_room_hosts'
      and column_name = 'officer_name'
  );

alter table public.interview_room_hosts drop column if exists officer_name;
