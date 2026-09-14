import { prisma } from "@/lib/db";
import { monthStats } from "@/lib/billing";
import { currentPeriod } from "@/lib/ph";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function Page() {
  const period = currentPeriod();
  const [active, disc, overdue, stats] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.client.count({ where: { status: "DISCONNECTED" } }),
    prisma.invoice.count({ where: { period, status: "OVERDUE" } }),
    monthStats(period).catch(() => ({ billed: 0, collected: 0, expenses: 0, net: 0 }))
  ]);
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
