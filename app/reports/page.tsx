import { monthStats } from "@/lib/billing";
import { currentPeriod } from "@/lib/ph";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function Reports({ searchParams }: { searchParams: { period?: string } }) {
  const period = searchParams.period ?? currentPeriod();
  const s = await monthStats(period).catch(() => ({ billed: 0, collected: 0, expenses: 0, net: 0 }));
  return (<div><h1 className="text-xl font-bold mb-3">Net Sales — {period}</h1>
    <form className="card mb-3 flex gap-2"><input name="period" defaultValue={period} className="input" placeholder="YYYY-MM"/><button className="btn">View</button></form>
    <div className="grid md:grid-cols-4 gap-3">
      {[["Billed",s.billed],["Collected",s.collected],["Expenses",s.expenses],["Net (Collected-Expenses)",s.net]].map(([k,v]:any)=><div key={k} className="card"><div className="text-xs">{k}</div><div className="text-xl font-bold">₱{v.toLocaleString()}</div></div>)}
    </div></div>);
}
