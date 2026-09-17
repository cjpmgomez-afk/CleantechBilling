# AGENT.md — Cleantech Billing (AI agent operating guide)

## Project
Next.js 14 (App Router, `app/`) + TS + Tailwind + Prisma + Neon Postgres. ISP billing for Cleantech ICT Solution Inc.
Flow: 28th auto-generate invoices (due end-of-month) → daily SMS/email reminders → disconnect-notice SMS on the 5th for past-due → staff records payments (Cash/GCash/Maya) → Net = Collected − Expenses. Deploy: GitHub `main` → Vercel (auto-redeploy; crons in `vercel.json`).

## Windows dev-environment quirks (do not skip)
- PowerShell blocks `npm.ps1`/`npx.ps1`. **Always** prefix: `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")` in the SAME command that calls npm/npx/git/tsx.
- `tsx` does **not** auto-load `.env` → run scripts as `npx tsx --env-file=.env scripts/foo.ts`. Node is v24; `package.json` build = `prisma generate && next build`.
- "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" printed after a successful tsx script is a harmless Windows/uv exit quirk — ignore it.

## Commands
- Change dir: use `workdir` param of the shell tool, never `cd`.
- `npx tsc --noEmit` then `npm run build` before committing. Verify with `git status/diff`; commit only when asked; push on `main`.
- Prisma schema edits → `npx prisma validate` then push via `npm run db:push` (uses DATABASE_URL from `.env`).

## Repo map
- `prisma/schema.prisma`: Client (status ACTIVE/SUSPENDED/DISCONNECTED/PENDING), Plan, Invoice (@@unique [clientId, period], status UNPAID/PAID/OVERDUE/VOID), Payment (voided flag), Expense, NotificationLog. DB currently on Neon.
- `lib/`: db.ts, ph.ts (`normPH` 09xx→+639xx), sms.ts (textbee→smsgate→semaphore fallback; `billingSMS` + `disconnectNoticeSMS`), email.ts (Resend), billing.ts (`generateBilling` idempotent via unique constraint, only ACTIVE clients; `monthStats`), import.ts (xlsx mapper; header alias matching).
- `app/api/`: clients (+ `[id]` PATCH/DELETE, + `clients/export` xlsx), invoices (+ `[id]` PATCH), payments, expenses (GET/POST/PATCH/DELETE all in one route), import, health, auth/start|verify|logout, cron/billing, cron/reminders.
- `app/`: page (dashboard), clients (add/import/inline-edit/delete/export), invoices (status dropdown), payments (record), expenses (add/edit/delete), reports (`?period=YYYY-MM`), settings (schedule + test-SMS via server action `settings/actions.ts`).
- `scripts/` (tsx, run with `--env-file=.env`): import-xlsx, sync-xlsx (idempotent re-import), check, check-phones, test-sms, sample-jonathan, send-to-client "Name" (billing SMS to one client), disconnect-sample "Name" (disconnect SMS to one client), preview-messages, find-client.

## Conventions & side-effects (verify before assuming)
- Money = int pesos. Period = YYYY-MM. Due = endOfMonth. DISCONNECTED/SUSPENDED skipped in billing.
- **PATCH `/api/invoices/[id]`**: status PAID auto-creates an unvoided Payment for invoice amount (method CASH unless passed); reverting to UNPAID **voids** all its payments. This keeps Reports Net consistent — Net = Σ(payments paidAt in month, not voided) − Σ(expenses date in month).
- **reminders cron** runs daily 1AM UTC; decides by **server date**: on the day==DISCONNECT_NOTICE_DAY (default 5) it sends `disconnectNoticeSMS` only to past-due invoices (OVERDUE, or UNPAID with dueDate < start of current month); other days it sends `billingSMS` to UNPAID/OVERDUE. Dedupe: skip when last SENT SMS is within REMINDER_GAP_DAYS (7); on notice-day also require `last.message === msg`. limit=50 (TextBee free 50/day, 300/mo).
- SMS copy comes ONLY from `billingSMS()`/`disconnectNoticeSMS()` — never hardcode ISP name/number; use ISP_NAME/ISP_CONTACT env (DISCONNECT_DAY env default "10" is the date named in the notice).
- Cron auth: `?secret=CRON_SECRET` OR `Authorization: Bearer <CRON_SECRET>` (lib/cron-auth). Every send is logged to NotificationLog (SENT/FAILED/SKIPPED).
- **Auth gate (APP_PASSWORD)**: `middleware.ts` redirects all pages/APIs to `/login` unless `ct_session` cookie valid. Public: `/login`, `/api/auth/*`, `/api/health`, `/api/cron/*`, manifest/sw/icons, `/_next/*`. Login = password (step 1) → 6-digit SMS OTP to ISP_CONTACT (step 2, `OtpRequest` table: SHA-256 hash only, 10-min TTL, 5 attempts, max 3 codes/hr, 60s resend gap). Cookies are HMAC-SHA256 (`lib/auth.ts`, Edge-safe WebCrypto only — no Node imports): `ct_session` 24h, `ct_stepup` 72h. Password alone renews session while step-up valid; after 72h a fresh OTP is required. `secure:true` cookies — test auth over real (non-localhost) hosts or pass Cookie headers manually; PS5.1 IWR can't set Cookie headers (protected) — use curl.exe with `-b` jar / `-d @file` (inline `-d` quoting mangles).

## Sheet contract (client.xlsx — source of truth for imports)
Input cols: `Client Name | PPPoE Profile | Speed | Amount | Date Install` + optional `Mobile | Email | Address | Status`. Re-import with sync-xlsx.ts updates phone/email/fee/speed idempotently. Missing phone → invoice created but SMS SKIPPED + listed in missingContact.

## Data state (live, Sep 2026)
~24 clients; only 23 had 2026-09 invoices because some clients were added after the billing run — `generateBilling('2026-09')` is idempotent, so re-run it to backfill new clients. Ederico Labao is the example of this (had 0 invoices until re-run).

## Vercel env (must be set in Vercel, never commit `.env`)
DATABASE_URL, CRON_SECRET, ISP_NAME, ISP_CONTACT, APP_PASSWORD, SMS_PROVIDER, TEXTBEE_API_KEY (+TEXTBEE_DEVICE_ID=6aa7ef1e5625abc6b20c0f71 opt), SMSGATE_URL/USER/PASS opt, SEMAPHORE_API_KEY opt, RESEND_API_KEY, EMAIL_FROM. `.env` local holds CRON_SECRET + TEXTBEE_API_KEY + APP_PASSWORD (gitignored). `/api/health` reports which env vars are present (no secrets).

## Tasks — DONE vs NEXT
- DONE: billing + reminders + disconnect-notice crons; invoice status dropdown; expense edit/delete; client inline edit + delete + xlsx export; PWA (app/manifest.ts, public/sw.js, icons, apple meta); logo in navbar/favicon; mobile-responsive nav/tables.
- NEXT (ask user first): receipt print view, overdue CSV export, `/pay/[token]` public portal. **Do NOT** auto-disconnect clients on the 10th (or anywhere) without explicit approval.