-- Private bucket for applicant resumes (uploaded via service role on the server).
insert into storage.buckets (id, name, public, file_size_limit)
values ('resumes', 'resumes', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;
