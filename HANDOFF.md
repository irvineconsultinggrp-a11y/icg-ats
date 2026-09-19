# ICG ATS — Team Handoff (Fall 2026)

**Single source of truth (GitHub):** https://github.com/irvineconsultinggrp-tech/icgats  
**Branch:** `main`  
**Design reference:** [ATS-Wireframes (Figma)](https://www.figma.com/design/iuOWOZ1fpXmAxxuxWRglNT/ATS-Wireframes?node-id=0-1)

**Stack:** Next.js 16 (App Router) · React 19 · Supabase (Auth, Postgres, RLS, Storage) · Tailwind v4

---

## 1. What this app is

Two portals for Irvine Consulting Group recruitment:

| Portal | Who | Main jobs |
|--------|-----|-----------|
| **Applicant** | Candidates | Apply (Information + Availability), browse coffee chat directory, book chats via Calendly |
| **Officer** | Recruitment team | Review apps, pipeline stages, notes, scores, decisions |

Auth: Supabase. Role in JWT `app_metadata.role` → `applicant` | `officer`.

---

## 2. Clone & run locally

```bash
git clone https://github.com/irvineconsultinggrp-tech/icgats.git
cd icgats
cp .env.example .env.local   # fill Supabase keys (see README.md)
npm install
npm run dev
```

Open http://localhost:3000

---

## 3. Environment variables (`.env.local`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only: resumes, officer signup, notes, admin queries |
| `OFFICER_SIGNUP_CODE` | For officer signup | Shared code at `/officer/signup` |
| `NEXT_PUBLIC_COFFEE_CHAT_CALENDLY_URL` | For Chat button | **Option A:** one club Calendly for all members |
| `NEXT_PUBLIC_SITE_URL` | Production | OAuth / password-reset redirects |
| `NEXT_PUBLIC_REQUIRE_UCI_EMAIL` | Optional | `true` = applicant signup @uci.edu only |
| `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` / `SECRET` | Optional | Post-application webhook |

Never commit `.env.local`.

---

## 4. Supabase migrations (run in order)

Run each file in Supabase SQL Editor (`supabase/migrations/`):

1. `20250520120000_applicants_officers.sql`
2. `20250520120001_resumes_storage.sql` (+ create `resumes` bucket in dashboard)
3. `20250520120002_applicants_update_own.sql`
4. `20250520120003_pipeline_coffee_chats.sql`
5. `20250520120004_performance_indexes.sql`
6. `20250520120005_applicant_notes.sql`
7. `20250520120006_individual_rounds_social.sql` — **Round 2 + BBQ columns**

Officers: set `app_metadata.role = officer` in Supabase Auth, or use `/officer/signup` with invite code.

---

## 5. Fall 2026 recruitment timeline (product dates)

W0 Monday = **September 21, 2026**

| Milestone | Date | Where in code |
|-----------|------|----------------|
| Applications open | Mon **9/21/2026** | `lib/positions.ts` (`junior-associate`) |
| Applications due | Wed **9/30/2026** | same |
| Round 1 interviews | Sat **10/3/2026** | `lib/group-interview/sessions.ts` |
| Round 2 interviews | Sun **10/4/2026** | same |
| BBQ social | Sun **10/4/2026** (ops) | officer `/bbq-social` |

Applying is enforced: not before open date, not after close (see `canApplyToPosition` in `lib/positions.ts`).

---

## 6. Recruitment pipeline (officer)

**Order (current product):**

```
Applications → Coffee Chats → Round 1 → Round 2 → BBQ Social → Decisions
```

| Stage | Route | DB / notes |
|-------|-------|------------|
| Applications | `/officer/dashboard/applications` | `app_status`: new / reviewing / advanced / rejected. Advance → **Coffee Chats** |
| Coffee Chats | `/officer/dashboard/coffee-chats` | `cc_*` fields; shared **NotesFolder** per applicant |
| Round 1 | `/officer/dashboard/round-1` | Uses legacy **`gi_*`** columns (ex–group interview) |
| Round 2 | `/officer/dashboard/round-2` | **`r2_*`** columns (migration 20006) |
| BBQ Social | `/officer/dashboard/bbq-social` | **`social_status`** |
| Decisions | `/officer/dashboard/decisions` | `decision_status` |

Shared UI: `app/officer/dashboard/_components/RoundBoard.tsx` for R1/R2.

**Removed:** `/officer/dashboard/group-interview` (do not link to it).

Applicant **Availability** on apply form: slots on **Oct 3 & Oct 4** only (`GROUP_INTERVIEW_DAYS`).

---

## 7. Applicant flows

| Route | Purpose |
|-------|---------|
| `/` | Applicant vs Officer entry |
| `/applicant/signup`, `/login`, `/forgot-password` | Auth |
| `/applicant/dashboard` | Positions list |
| `/applicant/dashboard/apply/[id]` | **2 tabs:** Information · Availability |
| `/applicant/dashboard/coffee-chats` | Member grid + Learn More modal + **Chat** → Calendly |

### Application form (current)

**Information tab:** name, email, grad year, phone, majors/minors, LinkedIn, commitments (shortened copy), info session, resume.

**Removed from UI:** career goals question (DB column `career_goals` may still exist).

**Availability tab:** R1/R2 interview slot picker.

### Coffee chats

- **Static directory:** `lib/officers/directory-members.ts` (24 members, headshots in `public/images/headshots/`)
- **Chat:** `resolveCoffeeChatCalendlyUrl()` — per-member `calendly` optional; else `NEXT_PUBLIC_COFFEE_CHAT_CALENDLY_URL`
- **Card UX:** click photo + name/role opens profile modal; **Chat** opens Calendly (or “not set up yet” toast)
- API `/api/officers/directory` + `coffee_chat_requests` exist but directory display is **static file** for now

---

## 8. Officer auth

- Login: `/officer/login`
- Self-signup: `/officer/signup` + `OFFICER_SIGNUP_CODE` → `POST /api/auth/officer-signup`
- Account menu: `OfficerAccountMenu.tsx`

---

## 9. API routes (summary)

| Route | Role |
|-------|------|
| `GET/POST /api/applicants` | List/create applications |
| `GET/PATCH /api/applicants/[id]` | Single applicant |
| `GET /api/applicants/mine?position=` | Applicant’s application + `canEdit` |
| `GET /api/applicants/stats` | Officer dashboard counts |
| `GET/POST /api/applicants/[id]/notes` | Per-applicant notes |
| `GET /api/officers/directory` | Officer rows for applicants |
| `GET/POST /api/coffee-chat-requests` | Optional in-app requests |
| `POST /api/auth/ensure-role` | Applicant role on login |

---

## 10. Key files map

```
lib/positions.ts              — open/close dates, canApply
lib/group-interview/sessions.ts — interview slot labels (Oct 3–4)
lib/officers/directory-members.ts — coffee chat cards data
lib/applicants/stages.ts      — pipeline fetch/patch helpers
lib/applicants/form.ts        — multipart application parse
app/applicant/dashboard/apply/[id]/page.tsx
app/applicant/dashboard/coffee-chats/page.tsx
app/officer/dashboard/_components/RoundBoard.tsx
app/api/applicants/stats/route.ts
supabase/migrations/
README.md                     — setup steps (keep in sync with this doc)
```

---

## 11. Git state (as of last handoff update)

**On GitHub `main`:** through commit `487c714` (rounds + BBQ pipeline, no group interview page).

**Local-only (not pushed yet)** — commit before treating GitHub as fully current:

- Application form: **Information + Availability** only (no career goals)
- Coffee chat: **clickable card** (name/photo → modal)
- Dates: open **9/21**, availability **Oct 3–4**, open-date enforcement

```bash
git status   # expect changes in apply page, coffee-chats, positions, sessions
git add -A && git reset -- .cursor/
git commit -m "..."
git push origin main
```

---

## 12. Production / replace old ATS site

1. Connect host (e.g. Vercel) to **`irvineconsultinggrp-tech/icgats`**, branch **`main`**.
2. Set all env vars from section 3.
3. Run migrations 1–7 on **production** Supabase (or same project you use today).
4. Add production URL to Supabase Auth redirect URLs (`/auth/callback`).
5. Cut over domain from old ATS repo when smoke-tested.

---

## 13. Still to do / nice-to-haves

| Priority | Item |
|----------|------|
| High | Push unpushed local commits (section 11) |
| High | Set `NEXT_PUBLIC_COFFEE_CHAT_CALENDLY_URL` in prod |
| High | Confirm migration **20006** on remote DB |
| Medium | Seed `officers` table OR keep updating `directory-members.ts` from club spreadsheet |
| Medium | Calendly custom question: “Which member do you want to meet?” |
| Medium | Officer inbox UI for `coffee_chat_requests` (API exists) |
| Low | Filter button on coffee chats (UI only) |
| Low | Dashboard “Opens” copy vs `canApplyToPosition` (before 9/21) |

---

## 14. New chat / new machine — paste this

```
Project: ICG ATS — https://github.com/irvineconsultinggrp-tech/icgats (main)
Read HANDOFF.md and README.md in repo root.

Pipeline: Applications → Coffee Chats → Round 1 (gi_*) → Round 2 (r2_*) → BBQ Social → Decisions.
Apply form: Information + Availability. Coffee chats: lib/officers/directory-members.ts + Calendly Chat.
Fall 2026: apps open 9/21, due 9/30, R1 Oct 3, R2 Oct 4.
Check git status for unpushed local work before assuming GitHub is complete.
```

---

## 15. Club data collection (coffee chat directory)

Per member for `directory-members.ts` (or Supabase `officers`):

- Full name, role, category (Executive / Director / Member)
- Major, grad year, bio, interests (comma-separated)
- Headshot (`public/images/headshots/First Last.png`)
- **No per-person Calendly** if using shared club link

---

*Update this file when pipeline, dates, or deploy target change.*
