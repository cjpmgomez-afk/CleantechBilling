# AGENT.md — Cleantech Billing (AI agent operating guide)

## Project
Next.js 14 + Prisma + Neon Postgres ISP billing for Cleantech ICT Solution Inc (09291199933).
End-of-month fixed billing. Manual Cash/GCash/Maya recording. Free-first SMS (TextBee/smsgate), Resend email. Vercel Cron.

## Repo map
- `prisma/schema.prisma`: Client (name, phone, pppoeProfile, speed, monthlyFee, status ACTIVE/SUSPENDED/DISCONNECTED), Plan, Invoice (@@unique clientId+period), Payment, Expense, NotificationLog
- `lib/`: db.ts, ph.ts (normPH +639, peso, period), sms.ts (textbee→smsgate→semaphore fallback), email.ts (Resend), billing.ts (generateBilling, monthStats), import.ts (client.xlsx mapper)
- `app/api/`: clients, invoices, payments, expenses, import, health, cron/billing (28th), cron/reminders (daily, limit=50 for TextBee free)
- `app/`: page (dashboard KPIs + Net), clients (add + import), invoices, payments, expenses, reports (?period=YYYY-MM), settings

## Sheet contract (client.xlsx)
Input cols: `Client Name | PPPoE Profile | Speed | Amount | Date Install` + optional `Mobile | Email | Address | Status`. Missing phone/email → invoice created but notif SKIPPED + listed in missingContact.

## Conventions
- Money = integer pesos. Period = YYYY-MM. Due = endOfMonth. DISCONNECTED/SUSPENDED skipped in billing.
- SMS copy via billingSMS() only; never hardcode ISP name/number — use ISP_NAME/ISP_CONTACT env.
- TextBee free limits: 50/day, 300/mo → cron reminders default limit=50, any period (overdue carry-over included).
- Reminders dedupe: skip invoice if last SENT SMS within REMINDER_GAP_DAYS (default 7). Env REMINDER_GAP_DAYS tunes it.
- All cron routes accept ?secret=CRON_SECRET OR Vercel `Authorization: Bearer <CRON_SECRET>` (lib/cron-auth). Log every send to NotificationLog (SENT/FAILED/SKIPPED).
- Net sales = SUM payments(paidAt in month, not voided) − SUM expenses(date in month).

## Tasks agents may do — DONE vs NEXT
- DONE: PATCH /api/clients/[id] + Disconnect/Activate button in Clients UI; force-dynamic on / and /reports; /api/health diagnostics; monthly reminders (billing 28th, reminders daily w/ 7-day gap dedupe); TextBee test-SMS action in Settings.
- NEXT: receipt print view, overdue CSV export, /pay/[token] portal; do NOT add router auto-cut without explicit approval.

## Verification — PASSED 2026-09-14 (Node v24.19.0, npm 11.17.0)
`npm install (142 pkgs) + prisma validate OK + tsc --noEmit OK + npm run build OK (17 routes)`. PH normalize tested: 09291199933 → +639291199933.
Neon live: `prisma db push OK (7.75s) + db:seed OK (plans) + build OK + generateBilling('2026-09') live OK (0 active, expected pre-import) + monthStats OK`. CRON_SECRET generated in .env (copy to Vercel, never commit .env).

## Verification (needs Node 20 + DATABASE_URL)
`npm install && npx tsc --noEmit && npx prisma validate && npm run build`
Manual: seed → import sample xlsx → GET cron/billing → GET cron/reminders&limit=1 → check NotificationLog → record payment → check Reports net.

## Vercel env required
DATABASE_URL, CRON_SECRET, ISP_NAME, ISP_CONTACT, SMS_PROVIDER, TEXTBEE_API_KEY (+TEXTBEE_DEVICE_ID opt), SMSGATE_URL/USER/PASS opt, SEMAPHORE_API_KEY opt, RESEND_API_KEY, EMAIL_FROM.
