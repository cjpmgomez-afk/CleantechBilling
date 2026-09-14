"use client";
import { useEffect, useState } from "react";
export default function Expenses() {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ category: "Fiber", amount: "", notes: "" });
  const load = () => fetch("/api/expenses").then(r => r.json()).then(setRows);
  useEffect(()=>{load();},[]);
  const save = async () => { await fetch("/api/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...f,amount:Number(f.amount)})}); setF({category:"Fiber",amount:"",notes:""}); load(); };
  return (<div><h1 className="text-xl font-bold mb-3">Expenses</h1>
    <div className="card flex gap-2 mb-3">
      <select className="input" value={f.category} onChange={e=>setF({...f,category:e.target.value})}><option>Fiber</option><option>Salary</option><option>Equipment</option><option>Rent</option><option>Load</option><option>Others</option></select>
      <input className="input" placeholder="amount" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/>
      <input className="input" placeholder="notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
      <button className="btn" onClick={save}>Add</button>
    </div>
    <div className="card"><table className="table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead>
    <tbody>{rows.map((e:any)=><tr key={e.id}><td>{e.date.slice(0,10)}</td><td>{e.category}</td><td>₱{e.amount}</td><td>{e.notes}</td></tr>)}</tbody></table></div></div>);
}
