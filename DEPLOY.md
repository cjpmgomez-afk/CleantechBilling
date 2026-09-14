# Deploy to GitHub + Vercel (Cleantech Billing)

Repo is committed locally on `master` (commit `ISP billing v1`). `.env` is gitignored — secrets never pushed.

## 1. Push to GitHub (needs your GitHub login)
```bash
cd cleantech-billing
gh auth login   # or: create repo on github.com/new, then:
git remote add origin https://github.com/YOUR_USER/cleantech-billing.git
git branch -M main
git push -u origin main
```
No `gh` CLI? Install: `winget install GitHub.cli`, or push via GitHub Desktop.

## 2. Vercel project (needs your Vercel login)
1. vercel.com → Add New → Project → Import `cleantech-billing` repo.
2. Framework: Next.js (auto). Build command default (`npm run build`).
3. Add Environment Variables (copy VALUES from your local `cleantech-billing/.env`):
   - DATABASE_URL, CRON_SECRET, ISP_NAME, ISP_CONTACT, DUE_DAY
   - SMS_PROVIDER, TEXTBEE_API_KEY, TEXTBEE_DEVICE_ID (optional)
   - SEMAPHORE_API_KEY (optional fallback), SEMAPHORE_SENDERNAME
   - RESEND_API_KEY, EMAIL_FROM
4. Deploy. First deploy: run once against Neon (tables already pushed from local).
5. Crons auto-enabled from `vercel.json`: billing 28th, reminders daily.

## 3. After deploy
- Test: `https://YOUR_APP.vercel.app/api/cron/billing?secret=YOUR_CRON&limit=1` (use CRON_SECRET value, keep secret).
- Import clients via Clients page if more `client.xlsx` updates come.
- Add Mobile numbers — 23/23 currently missing, so SMS will SKIP until numbers are added.

## 4. Keys you still need (free)
- TextBee: spare Android + UNLI SIM → install TextBee app → textbee.dev → API key → paste as TEXTBEE_API_KEY.
- Resend: resend.com/signup → API Keys → paste as RESEND_API_KEY, set EMAIL_FROM.
