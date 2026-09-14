"use client";
import { useEffect, useState } from "react";
export default function Invoices() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => fetch("/api/invoices").then(r => r.json()).then(setRows);
  useEffect(() => { load(); }, []);
  const setStatus = async (i: any, status: string) => {
    await fetch(`/api/invoices/${i.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };
  return (<div><h1 className="text-xl font-bold mb-3">Invoices</h1>
    <p className="text-xs text-slate-500 mb-3">Tip: marking an invoice PAID auto-records the payment under Payments; setting it back to UNPAID voids that payment.</p>
    <div className="card overflow-auto"><table className="table">
      <thead><tr><th>Period</th><th>Client</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
      <tbody>{rows.map((i: any) => <tr key={i.id}><td>{i.period}</td><td>{i.client?.name}</td><td>₱{i.amount}</td><td>{i.dueDate.slice(0,10)}</td><td>
        <select className="input !w-auto !py-1" value={i.status} onChange={e => setStatus(i, e.target.value)}>
          <option value="UNPAID">UNPAID</option><option value="PAID">PAID</option><option value="OVERDUE">OVERDUE</option><option value="VOID">VOID</option>
        </select>
      </td></tr>)}</tbody>
    </table></div></div>);
}
