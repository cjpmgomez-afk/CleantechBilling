import { prisma } from "@/lib/db";
import { monthStats } from "@/lib/billing";
import { currentPeriod } from "@/lib/ph";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function Page() {
  const period = currentPeriod();
  let data: { active: number; disc: number; overdue: number; stats: { billed: number; collected: number; expenses: number; net: number } } | null = null;
  let dbError: string | null = null;
  try {
    const [active, disc, overdue, stats] = await Promise.all([
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.client.count({ where: { status: "DISCONNECTED" } }),
      prisma.invoice.count({ where: { period, status: "OVERDUE" } }),
      monthStats(period)
    ]);
    data = { active, disc, overdue, stats };
  } catch (e: any) {
    dbError = String(e?.message ?? e).split("\n")[0];
  }
  if (!data) {
    return (<div>
      <h1 className="text-xl font-bold mb-3">Dashboard — {period}</h1>
      <div className="card text-sm">
        <b>Database not connected.</b>
        <p className="mt-1">The app cannot reach Postgres. Checklist:</p>
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Vercel → Project → Settings → Environment Variables → <b>DATABASE_URL</b> must be set for <b>Production</b> (your Neon pooled connection string).</li>
          <li>After adding/changing env vars: Deployments → ⋯ → <b>Redeploy</b> (env changes need a redeploy).</li>
          <li>Tables must exist: run <b>npx prisma db push</b> once from your computer with the same DATABASE_URL.</li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">Technical detail: {dbError ?? "unknown error"}</p>
      </div>
    </div>);
  }
  const { active, disc, overdue, stats } = data;
  const cards = [
    ["Active clients", active], ["Disconnected", disc], ["Overdue (" + period + ")", overdue],
    ["Billed", "₱" + stats.billed.toLocaleString()], ["Collected", "₱" + stats.collected.toLocaleString()],
    ["Expenses", "₱" + stats.expenses.toLocaleString()], ["Net sales", "₱" + stats.net.toLocaleString()]
  ];
  return (<div>
    <h1 className="text-xl font-bold mb-3">Dashboard — {period}</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(([k, v]) => <div key={k} className="card"><div className="text-xs text-slate-500">{k}</div><div className="text-xl font-bold">{v}</div></div>)}
    </div>
    <div className="card mt-4 text-sm">
      <b>End-of-month flow:</b> 28th auto-generate invoices → 30th/31st auto SMS+email via TextBee (free) → staff records Cash/GCash/Maya in Payments → Net = Collected − Expenses.
      Contact: {process.env.ISP_CONTACT ?? "09291199933"}
    </div>
  </div>);
}
