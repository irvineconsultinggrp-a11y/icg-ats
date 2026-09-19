# ICG ATS — Recruitment Portal

Applicant tracking system for Irvine Consulting Group. Applicants apply and track their
status; officers manage the recruitment pipeline (Applications → Coffee Chats → Round 1 →
Round 2 → BBQ Social → Decisions), log per-applicant notes, and make offers.

**Stack:** Next.js 16 (App Router) · React 19 · Supabase (Auth, Postgres + RLS, Storage) · Tailwind v4.

---

## 1. Environment variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in the values from your
[Supabase project](https://supabase.com/dashboard) (Project Settings → API).

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Public (anon/publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only. Resume uploads, role assignment, officer signup, notes. **Never expose to the client.** |
| `OFFICER_SIGNUP_CODE` | ▲ | Shared invite code for officer self-signup at `/officer/signup`. Leave blank to disable self-signup. |
| `NEXT_PUBLIC_REQUIRE_UCI_EMAIL` | – | `true` restricts applicant signup to `@uci.edu`. Default `false`. |
| `NEXT_PUBLIC_SITE_URL` | – | Site origin for OAuth / password-reset redirects. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_COFFEE_CHAT_CALENDLY_URL` | – | Default Calendly link for the applicant "Chat" button (per-officer links can override). |
| `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` / `GOOGLE_APPS_SCRIPT_SECRET` | – | Optional webhook fired after a new application. |

The app fails fast with a clear message if the required Supabase vars are missing.

## 2. Database setup

Run the SQL files in [`supabase/migrations`](supabase/migrations) **in filename order** in
the Supabase SQL Editor (Dashboard → SQL Editor → New query):

1. `20250520120000_applicants_officers.sql` — core tables, columns, RLS
2. `20250520120001_resumes_storage.sql` — private `resumes` storage bucket
3. `20250520120002_applicants_update_own.sql`
4. `20250520120003_pipeline_coffee_chats.sql` — pipeline fields + coffee-chat requests
5. `20250520120004_performance_indexes.sql`
6. `20250520120005_applicant_notes.sql` — per-applicant notes folder
7. `20250520120006_individual_rounds_social.sql` — Round 2 + BBQ Social pipeline columns

Every migration is idempotent, so re-running is safe.

## 3. Accounts & roles

Auth uses `app_metadata.role` (`applicant` | `officer`), enforced by middleware and RLS.

- **Applicants** self-assign the `applicant` role automatically on signup/login.
- **Officers** — two options:
  - **Invite code (recommended):** set `OFFICER_SIGNUP_CODE`, share the code + the
    `/officer/signup` link. Accounts are created with officer role and email pre-confirmed.
  - **Manual:** Dashboard → Authentication → Users → set `app_metadata.role` to `officer`.

## 4. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Entry points: `/applicant/login`,
`/officer/login`.

```bash
npm run build   # production build
npm run lint    # eslint
```

## 5. Deploy (Vercel)

1. Import the repo into Vercel.
2. Add every variable from section 1 in Project → Settings → Environment Variables
   (keep `SUPABASE_SERVICE_ROLE_KEY` and `OFFICER_SIGNUP_CODE` server-side only).
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL and add `<site>/auth/callback` to
   Supabase → Authentication → URL Configuration → Redirect URLs.
4. Deploy.

## Recruitment pipeline

**Applications → Coffee Chats → Round 1 → Round 2 → BBQ Social → Decisions.** Round 1
reuses the legacy `gi_*` columns (formerly group interview). Coffee Chats is an early
data-collection stage: any officer can open an applicant and keep their own attributed,
rich-text note in that applicant's shared notes folder.
