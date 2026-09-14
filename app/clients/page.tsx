"use client";
import { useEffect, useState } from "react";
export default function Clients() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", speed: "", monthlyFee: "", pppoeProfile: "" });
  const load = () => fetch("/api/clients").then(r => r.json()).then(setRows);
  useEffect(() => { load(); }, []);
  const add = async () => {
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, monthlyFee: Number(form.monthlyFee) }) });
    setForm({ name: "", phone: "", email: "", speed: "", monthlyFee: "", pppoeProfile: "" }); load();
  };
  const toggle = async (c: any) => {
    const next = c.status === "ACTIVE" ? "DISCONNECTED" : "ACTIVE";
    const reason = next === "DISCONNECTED" ? prompt("Disconnect reason?", "non-payment") ?? "manual disconnect" : undefined;
    await fetch(`/api/clients/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next, disconnectReason: reason }) });
    load();
  };
  const edit = async (c: any) => {
    const phone = prompt("Mobile (+639xx) for " + c.name, c.phone ?? "");
    if (phone === null) return;
    const email = prompt("Email for " + c.name, c.email ?? "");
    if (email === null) return;
    const speed = prompt("Speed/plan for " + c.name, c.speed ?? "");
    if (speed === null) return;
    const fee = prompt("Monthly fee (number) for " + c.name, String(c.monthlyFee));
    if (fee === null) return;
    await fetch(`/api/clients/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, email, speed, monthlyFee: Number(fee) }) });
    load();
  };
  const imp = async (f: File) => {
    const fd = new FormData(); fd.append("file", f);
    const r = await fetch("/api/import", { method: "POST", body: fd }).then(r => r.json());
    alert(`Added ${r.added}, skipped ${r.skipped}. Missing contact: ${r.missingContact?.slice(0,5).join(", ")}`);
    load();
  };
  return (<div>
    <h1 className="text-xl font-bold mb-3">Clients (add anytime)</h1>
    <div className="card mb-3 grid md:grid-cols-6 gap-2">
      {(["name","phone","email","speed","monthlyFee","pppoeProfile"] as const).map(k =>
        <input key={k} className="input" placeholder={k} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}
      <button className="btn" onClick={add}>+ Add Customer</button>
      <label className="btn text-center cursor-pointer">Import client.xlsx<input type="file" hidden accept=".xlsx" onChange={e => e.target.files && imp(e.target.files[0])} /></label>
    </div>
    <div className="card overflow-auto"><table className="table">
      <thead><tr><th>Name</th><th>Mobile</th><th>PPPoE</th><th>Speed</th><th>Fee</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map((c: any) => <tr key={c.id}><td>{c.name}</td><td>{c.phone ?? "—"}</td><td>{c.pppoeProfile ?? "—"}</td><td>{c.speed ?? "—"}</td><td>₱{c.monthlyFee}</td><td><span className="badge">{c.status}</span></td><td><button className="badge" onClick={() => edit(c)}>Edit</button> <button className="badge" onClick={() => toggle(c)}>{c.status === "ACTIVE" ? "Disconnect" : "Activate"}</button></td></tr>)}</tbody>
    </table></div>
    <p className="text-xs text-slate-500 mt-2">Tip: add Mobile (+639xx) to enable free SMS. Disconnected clients are auto-skipped in billing.</p>
  </div>);
}
