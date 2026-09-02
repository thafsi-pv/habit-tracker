# Shared Habit Tracker (MVP)

A mobile-first shared habit tracker with WhatsApp (Baileys) daily reports.

```
habit-tracker/
├── backend/    NestJS + Prisma + PostgreSQL API
└── frontend/   React + Vite + Tailwind + shadcn-style UI
```

## Quick start

1. **Database**: have a Postgres instance reachable (local, Docker, or hosted).
2. **Backend**: see `backend/README.md` — install, configure `.env`, run
   migrations, seed, start on port 3000.
3. **Frontend**: see `frontend/README.md` — install, configure `.env`, start
   on port 5173.
4. Log in with the seeded accounts (`thafsi@example.com` / `naju@example.com`,
   password `password123`) or sign up fresh.

## What's implemented

- Email/password + Google OAuth auth, HTTP-only cookies, refresh rotation
- Trackers, MASTER/MEMBER roles, tracker membership, personal-tracker
  onboarding flow
- Habits + subtasks (master-managed), per-user daily completion
  (member-managed, own data only)
- Dashboard, daily/weekly/monthly progress, streak calculation
  (timezone-aware)
- Email-token invitation flow with expiry and email-match enforcement
- WhatsApp via a provider-abstraction (`WhatsAppProvider` interface) backed
  by Baileys today, swappable for the Meta Cloud API later without touching
  business logic; sessions persist in Postgres (encrypted) so they survive
  restarts; QR/status pushed over WebSocket
- Daily WhatsApp report via `@nestjs/schedule`, with a `NotificationLog` for
  retry/audit
- Authorization is enforced entirely server-side via a single
  `AuthorizationService` — the client's role/tracker/user hints are never
  trusted

## What's stubbed / needs your input before production

- **Email delivery** for invitations logs to console
  (`backend/src/invitations/email.service.ts`) — wire up a real provider.
- **Google OAuth credentials** and **WhatsApp session encryption key** must
  be set in `backend/.env` (see `.env.example`).
- **Verification**: this was built in a sandboxed environment with no
  network access, so `npm install`, `prisma migrate`, builds, lint, and
  tests have **not** been run against real dependency versions. Run the
  verification commands in each package's README locally and paste back
  any errors — dependency version mismatches (Baileys/Nest/Prisma APIs
  shift between minor versions) are the most likely source of issues.
- **UI primitives** are hand-authored to match shadcn/ui's conventions
  rather than pulled from the shadcn CLI/registry (no network access) — see
  `frontend/README.md`.
- No automated tests exist yet for invitations, WhatsApp, or the full
  auth flow — only `AuthorizationService` and the habit-completion
  roll-up logic have unit tests as a starting example.
