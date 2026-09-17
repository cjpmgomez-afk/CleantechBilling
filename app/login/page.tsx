"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"password" | "otp">("password");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true); setMsg("");
    const r = await fetch("/api/auth/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).then(r => r.json());
    setBusy(false);
    if (r.error) { setMsg(r.error); return; }
    if (r.step === "logged-in") { router.push("/"); return; }
    setStep("otp"); setMsg("Code sent by SMS — enter it below.");
  };
  const verify = async () => {
    setBusy(true); setMsg("");
    const r = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }).then(r => r.json());
    setBusy(false);
    if (r.error) { setMsg(r.error); return; }
    router.push("/");
  };
  return (<div className="max-w-sm mx-auto mt-16">
    <h1 className="text-xl font-bold mb-1 text-center">Cleantech ICT Solution Inc</h1>
    <p className="text-xs text-slate-500 mb-4 text-center">Staff login — session lasts 24 hours.</p>
    <div className="card space-y-2">
      {step === "password" ? (<>
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && start()} />
        <button className="btn w-full" disabled={busy} onClick={start}>{busy ? "..." : "Continue"}</button>
      </>) : (<>
        <input className="input text-center tracking-widest" maxLength={6} inputMode="numeric" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && verify()} />
        <button className="btn w-full" disabled={busy} onClick={verify}>{busy ? "..." : "Log in"}</button>
        <button className="badge w-full" onClick={() => { setStep("password"); setCode(""); setMsg(""); }}>Back</button>
      </>)}
      {msg && <p className="text-xs text-center text-slate-600">{msg}</p>}
    </div>
  </div>);
}