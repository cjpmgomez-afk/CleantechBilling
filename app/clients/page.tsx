"use client";
import { useEffect, useState } from "react";
const empty = { name: "", phone: "", email: "", speed: "", monthlyFee: "", pppoeProfile: "", address: "" };
export default function Clients() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState(empty);
  const load = () => fetch("/api/clients").then(r => r.json()).then(setRows);
  useEffect(() => { load(); }, []);
  const add = async () => {
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, monthlyFee: Number(form.monthlyFee) }) });
    setForm({ ...empty }); load();
  };
  const toggle = async (c: any) => {
    const next = c.status === "ACTIVE" ? "DISCONNECTED" : "ACTIVE";
    const reason = next === "DISCONNECTED" ? prompt("Disconnect reason?", "non-payment") ?? "manual disconnect" : undefined;
    await fetch(`/api/clients/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next, disconnectReason: reason }) });
    load();
  };
  const startEdit = (c: any) => {
    setEditing(c);
    setEditForm({ name: c.name ?? "", phone: c.phone ?? "", email: c.email ?? "", speed: c.speed ?? "", monthlyFee: String(c.monthlyFee ?? ""), pppoeProfile: c.pppoeProfile ?? "", address: c.address ?? "" });
  };
  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`/api/clients/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editForm, monthlyFee: Number(editForm.monthlyFee) }) });
    setEditing(null); load();
  };
  const imp = async (f: File) => {
    const fd = new FormData(); fd.append("file", f);
    const r = await fetch("/api/import", { method: "POST", body: fd }).then(r => r.json());
    alert(`Added ${r.added}, skipped ${r.skipped}. Missing contact: ${r.missingContact?.slice(0,5).join(", ")}`);
    load();
  };
  const del = async (c: any) => {
    if (!confirm(`Delete ${c.name} permanently? This removes their invoices, payments and notification history.`)) return;
    await fetch(`/api/clients/${c.id}`, { method: "DELETE" });
    load();
  };
  return (<div>
    <h1 className="text-xl font-bold mb-3">Clients (add anytime)</h1>
    <div className="card mb-3 grid md:grid-cols-4 gap-2">
      {(["name","phone","email","speed","monthlyFee","pppoeProfile","address"] as const).map(k =>
        <input key={k} className="input" placeholder={k} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}
      <button className="btn" onClick={add}>+ Add Customer</button>
      <label className="btn text-center cursor-pointer">Import client.xlsx<input type="file" hidden accept=".xlsx" onChange={e => e.target.files && imp(e.target.files[0])} /></label>
    </div>
    {editing && (
      <div className="card mb-3 border-blue-400 border">
        <div className="flex items-center justify-between mb-2"><b className="text-sm">Editing: {editing.name}</b><button className="badge" onClick={() => setEditing(null)}>Cancel</button></div>
        <div className="grid md:grid-cols-4 gap-2">
          {(["name","phone","email","speed","monthlyFee","pppoeProfile","address"] as const).map(k =>
            <input key={k} className="input" placeholder={k} value={(editForm as any)[k]} onChange={e => setEditForm({ ...editForm, [k]: e.target.value })} />)}
          <button className="btn" onClick={saveEdit}>Save</button>
        </div>
      </div>
    )}
    <div className="card overflow-auto"><table className="table">
      <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>PPPoE</th><th>Speed</th><th>Fee</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map((c: any) => <tr key={c.id}>
        <td>{c.name}</td><td>{c.phone ?? "—"}</td><td>{c.email ?? "—"}</td><td>{c.pppoeProfile ?? "—"}</td><td>{c.speed ?? "—"}</td><td>₱{c.monthlyFee}</td><td><span className="badge">{c.status}</span></td>
        <td className="whitespace-nowrap"><button className="badge" onClick={() => startEdit(c)}>Edit</button> <button className="badge" onClick={() => toggle(c)}>{c.status === "ACTIVE" ? "Disconnect" : "Activate"}</button> <button className="badge" onClick={() => del(c)}>Delete</button></td>
      </tr>)}</tbody>
    </table></div>
    <p className="text-xs text-slate-500 mt-2">Tip: add Mobile (+639xx) to enable free SMS. Disconnected clients are auto-skipped in billing.</p>
  </div>);
}
