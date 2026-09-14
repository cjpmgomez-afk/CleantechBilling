"use client";
import { useEffect, useState } from "react";
export default function Payments() {
  const [inv, setInv] = useState<any[]>([]);
  const [f, setF] = useState({ invoiceId: "", amount: "", method: "GCASH", refNo: "", receivedBy: "" });
  useEffect(() => { fetch("/api/invoices").then(r => r.json()).then(setInv); }, []);
  const save = async () => {
    await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, amount: Number(f.amount) }) });
    alert("Payment recorded, invoice marked PAID"); setF({ invoiceId: "", amount: "", method: "GCASH", refNo: "", receivedBy: "" });
  };
  return (<div><h1 className="text-xl font-bold mb-3">Record Payment (Cash / GCash / Maya)</h1>
    <div className="card grid md:grid-cols-5 gap-2">
      <select className="input" value={f.invoiceId} onChange={e => setF({ ...f, invoiceId: e.target.value })}>
        <option value="">Select invoice</option>{inv.filter((i:any)=>i.status!=="PAID").map((i:any)=><option key={i.id} value={i.id}>{i.period} — {i.client?.name} — ₱{i.amount}</option>)}
      </select>
      <input className="input" placeholder="amount" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/>
      <select className="input" value={f.method} onChange={e=>setF({...f,method:e.target.value})}><option>CASH</option><option>GCASH</option><option>MAYA</option><option>BANK</option></select>
      <input className="input" placeholder="refNo" value={f.refNo} onChange={e=>setF({...f,refNo:e.target.value})}/>
      <button className="btn" onClick={save}>Save</button>
    </div></div>);
}
