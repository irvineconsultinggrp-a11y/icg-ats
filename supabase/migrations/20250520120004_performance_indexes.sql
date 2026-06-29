-- Performance indexes for common filter + sort patterns on applicants and coffee chat requests.



create index if not exists applicants_app_status_created_at_idx

  on public.applicants (app_status, created_at desc);



create index if not exists applicants_gi_status_created_at_idx

  on public.applicants (gi_status, created_at desc)

  where app_status = 'advanced';



create index if not exists applicants_cc_status_created_at_idx

  on public.applicants (cc_status, created_at desc)

  where gi_status = 'completed';



create index if not exists applicants_decision_status_created_at_idx

  on public.applicants (decision_status, created_at desc)

  where cc_status = 'completed';



create index if not exists coffee_chat_requests_status_idx

  on public.coffee_chat_requests (status);



create index if not exists coffee_chat_requests_created_at_idx

  on public.coffee_chat_requests (created_at desc);

