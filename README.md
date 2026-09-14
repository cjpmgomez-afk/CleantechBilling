# Cleantech ICT Solution Inc — Automated ISP Billing
Contact: 09291199933 | Billing: end-of-month, due end-of-month | Payments: Cash/GCash/Maya (manual)

## Quick start (local, needs Node 20)
1. `cp .env.example .env` — fill DATABASE_URL (Neon free), CRON_SECRET, TEXTBEE_API_KEY, RESEND_API_KEY
2. `npm install` → `npx prisma db push` → `npm run db:seed` → `npm run dev`
3. Import `../client.xlsx` via Clients page → add Mobile column for SMS
4. Test: `GET /api/cron/billing?secret=xxx&period=2026-09` then `GET /api/cron/reminders?secret=xxx&limit=1`

## Deploy to Vercel (free)
1. Push `cleantech-billing/` to GitHub. Vercel → New Project → import.
2. Env vars: DATABASE_URL, CRON_SECRET, ISP_NAME, ISP_CONTACT=09291199933, SMS_PROVIDER=textbee, TEXTBEE_API_KEY, RESEND_API_KEY, EMAIL_FROM.
3. Build command: `prisma generate && prisma migrate deploy && next build` (or `prisma db push` for MVP).
4. Crons auto-enabled via vercel.json: billing 28th, reminders daily. Manual run from Settings URLs.
5. Free SMS (TextBee, 300/mo): spare Android + UNLI SIM → install TextBee app → textbee.dev API key → Vercel env. Upgrade later to smsgate self-host (unlimited) or Semaphore fallback.

## Improve next
- Phase 2: status toggle UI, receipt print, overdue list, customer portal /pay/:token with GCash receipt upload.
- Phase 3: PayMongo/Xendit links, MikroTik auto-disable, Viber/Messenger backup channel.
