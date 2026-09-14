"use client";
import { useEffect, useState } from "react";
export default function Invoices() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/invoices").then(r => r.json()).then(setRows); }, []);
  return (<div><h1 className="text-xl font-bold mb-3">Invoices</h1>
    <div className="card overflow-auto"><table className="table">
      <thead><tr><th>Period</th><th>Client</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
      <tbody>{rows.map((i: any) => <tr key={i.id}><td>{i.period}</td><td>{i.client?.name}</td><td>₱{i.amount}</td><td>{i.dueDate.slice(0,10)}</td><td><span className="badge">{i.status}</span></td></tr>)}</tbody>
    </table></div></div>);
}
