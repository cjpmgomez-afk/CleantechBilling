export default function Settings() {
  return (<div><h1 className="text-xl font-bold mb-3">Settings</h1><div className="card text-sm space-y-1">
    <p><b>ISP:</b> Cleantech ICT Solution Inc — {process.env.ISP_CONTACT ?? "09291199933"}</p>
    <p><b>SMS_PROVIDER:</b> textbee (free 300/mo, 50/day). Set TEXTBEE_API_KEY in Vercel env. Fallback SEMAPHORE_API_KEY optional.</p>
    <p><b>Email:</b> set RESEND_API_KEY + EMAIL_FROM.</p>
    <p><b>Cron:</b> /api/cron/billing (28th) + /api/cron/reminders (daily). Protect with CRON_SECRET.</p>
    <p><b>TextBee setup (5 min):</b> 1) spare Android + UNLI SIM 2) install TextBee app 3) textbee.dev → API key → paste in Vercel 4) test: /api/cron/reminders?secret=xxx&limit=1</p>
  </div></div>);
}
