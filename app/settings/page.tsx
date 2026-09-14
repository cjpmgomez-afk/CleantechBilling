import SmsTest from "@/components/SmsTest";
export default function Settings() {
  return (<div><h1 className="text-xl font-bold mb-3">Settings</h1><div className="card text-sm space-y-1">
    <p><b>ISP:</b> Cleantech ICT Solution Inc — {process.env.ISP_CONTACT ?? "09291199933"}</p>
    <p><b>Billing schedule:</b> cron <code>/api/cron/billing</code> runs <b>every 28th 8:00 AM</b> — creates invoices for all ACTIVE clients, due end-of-month.</p>
    <p><b>Reminder schedule:</b> cron <code>/api/cron/reminders</code> runs <b>daily 1:00 AM</b> — texts+emails UNPAID/OVERDUE invoices. Dedupes so each client gets a nudge at most every <b>{process.env.REMINDER_GAP_DAYS ?? 7} days</b> until paid. Overdue bills from previous months keep getting reminders too.</p>
    <p><b>SMS:</b> textbee (free 300/mo, 50/day) via TEXTBEE_API_KEY. Fallback SEMAPHORE_API_KEY optional.</p>
    <p><b>Email:</b> set RESEND_API_KEY + EMAIL_FROM.</p>
    <p><b>Manual runs (any time):</b> add <code>?secret=YOUR_CRON_SECRET&limit=25</code> to either cron URL.</p>
  </div>
  <SmsTest />
  </div>);
}