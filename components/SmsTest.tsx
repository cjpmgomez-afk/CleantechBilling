"use client";
import { useState } from "react";
import { sendTestSms } from "@/app/settings/actions";
export default function SmsTest() {
  const [to, setTo] = useState("09291199933");
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true); setOut(null);
    try {
      const r = await sendTestSms(to, msg);
      setOut(r.ok ? `Sent via ${r.provider}. Check the phone.` : `Failed via ${r.provider}: ${r.error}`);
    } catch (e: any) { setOut("Error: " + String(e?.message ?? e)); }
    setBusy(false);
  };
  return (<div className="card mt-3">
    <b>Test free SMS (TextBee)</b>
    <div className="flex gap-2 mt-2">
      <input className="input" value={to} onChange={e => setTo(e.target.value)} placeholder="09xxxxxxxxx" />
      <input className="input" value={msg} onChange={e => setMsg(e.target.value)} placeholder="optional message" />
      <button className="btn" onClick={send} disabled={busy}>{busy ? "Sending…" : "Send test"}</button>
    </div>
    {out && <p className="text-sm mt-2">{out}</p>}
    <p className="text-xs text-slate-500 mt-1">Needs TEXTBEE_API_KEY in env + gateway phone online. Without a key you will see “no SMS provider configured”.</p>
  </div>);
}
