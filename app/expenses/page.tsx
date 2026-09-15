"use client";
import { useEffect, useState } from "react";
const cats = ["Fiber", "Internet Payment", "Salary", "Equipment", "Rent", "Load", "Others"];
export default function Expenses() {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ category: "Fiber", amount: "", notes: "" });
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const load = () => fetch("/api/expenses").then(r => r.json()).then(setRows);
  useEffect(()=>{load();},[]);
  const save = async () => { await fetch("/api/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...f,amount:Number(f.amount)})}); setF({category:"Fiber",amount:"",notes:""}); load(); };
  const startEdit = (e:any) => { setEditing(e); setEditForm({ category: e.category, amount: String(e.amount), notes: e.notes ?? "", date: e.date.slice(0,10) }); };
  const saveEdit = async () => { await fetch("/api/expenses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ id: editing.id, ...editForm, amount: Number(editForm.amount) })}); setEditing(null); load(); };
  const del = async (e:any) => { if (!confirm("Delete this expense?")) return; await fetch(`/api/expenses?id=${e.id}`,{method:"DELETE"}); load(); };
  return (<div><h1 className="text-xl font-bold mb-3">Expenses</h1>
    <div className="card grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
      <select className="input" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select>
      <input className="input" placeholder="amount" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/>
      <input className="input" placeholder="notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
      <button className="btn" onClick={save}>Add</button>
    </div>
    {editing && (
      <div className="card mb-3 border-blue-400 border">
        <div className="flex items-center justify-between mb-2"><b className="text-sm">Editing expense</b><button className="badge" onClick={() => setEditing(null)}>Cancel</button></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input className="input" type="date" value={editForm.date} onChange={e=>setEditForm({...editForm,date:e.target.value})}/>
          <select className="input" value={editForm.category} onChange={e=>setEditForm({...editForm,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select>
          <input className="input" placeholder="amount" value={editForm.amount} onChange={e=>setEditForm({...editForm,amount:e.target.value})}/>
          <button className="btn" onClick={saveEdit}>Save</button>
          <input className="input sm:col-span-3" placeholder="notes" value={editForm.notes} onChange={e=>setEditForm({...editForm,notes:e.target.value})}/>
        </div>
      </div>
    )}
    <div className="card overflow-auto"><table className="table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Notes</th><th>Action</th></tr></thead>
    <tbody>{rows.map((e:any)=><tr key={e.id}>
      <td>{e.date.slice(0,10)}</td><td>{e.category}</td><td>₱{e.amount}</td><td>{e.notes}</td>
      <td className="whitespace-nowrap"><button className="badge" onClick={()=>startEdit(e)}>Edit</button> <button className="badge" onClick={()=>del(e)}>Delete</button></td>
    </tr>)}</tbody></table></div></div>);
}