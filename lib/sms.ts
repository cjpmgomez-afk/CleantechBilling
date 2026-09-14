// Free-first SMS abstraction.
// PROVIDER=textbee (friendly, free 300/mo) | smsgate (free unlimited self-host) | semaphore (paid fallback) | disabled
import { normPH } from "./ph";

export type SmsResult = { ok: boolean; provider: string; id?: string; error?: string };

async function viaTextBee(to: string, message: string): Promise<SmsResult> {
  const key = process.env.TEXTBEE_API_KEY!;
  const device = process.env.TEXTBEE_DEVICE_ID;
  const res = await fetch("https://api.textbee.dev/api/v1/gateway/send-sms", {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ recipients: [to], message, ...(device ? { deviceId: device } : {}) })
  });
  if (!res.ok) return { ok: false, provider: "textbee", error: await res.text() };
  return { ok: true, provider: "textbee" };
}

async function viaSmsGate(to: string, message: string): Promise<SmsResult> {
  const base = process.env.SMSGATE_URL!.replace(/\/$/, "");
  const u = process.env.SMSGATE_USERNAME!, p = process.env.SMSGATE_PASSWORD!;
  const res = await fetch(`${base}/3rdparty/v1/messages`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${u}:${p}`).toString("base64"), "Content-Type": "application/json" },
    body: JSON.stringify({ textMessage: { text: message }, phoneNumbers: [to] })
  });
  if (!res.ok) return { ok: false, provider: "smsgate", error: await res.text() };
  return { ok: true, provider: "smsgate" };
}

async function viaSemaphore(to: string, message: string): Promise<SmsResult> {
  const params = new URLSearchParams({
    apikey: process.env.SEMAPHORE_API_KEY!,
    number: to.replace("+", ""),
    message,
    ...(process.env.SEMAPHORE_SENDERNAME ? { sendername: process.env.SEMAPHORE_SENDERNAME } : {})
  });
  const res = await fetch("https://api.semaphore.co/api/v4/messages", { method: "POST", body: params });
  if (!res.ok) return { ok: false, provider: "semaphore", error: await res.text() };
  return { ok: true, provider: "semaphore" };
}

export async function sendSMS(rawTo: string | null | undefined, message: string): Promise<SmsResult> {
  const to = normPH(rawTo);
  if (!to) return { ok: false, provider: "none", error: "missing/invalid mobile" };
  const primary = process.env.SMS_PROVIDER ?? "textbee";
  try {
    if (primary === "textbee" && process.env.TEXTBEE_API_KEY) return await viaTextBee(to, message);
    if (primary === "smsgate" && process.env.SMSGATE_URL) return await viaSmsGate(to, message);
    if (primary === "semaphore" && process.env.SEMAPHORE_API_KEY) return await viaSemaphore(to, message);
    if (primary === "disabled") return { ok: false, provider: "disabled", error: "SMS disabled" };
    // auto-fallback: try textbee -> smsgate -> semaphore whichever configured
    if (process.env.TEXTBEE_API_KEY) {
      const r = await viaTextBee(to, message);
      if (r.ok) return r;
    }
    if (process.env.SEMAPHORE_API_KEY) return await viaSemaphore(to, message);
    return { ok: false, provider: primary, error: "no SMS provider configured" };
  } catch (e: any) {
    // last-resort paid fallback if primary failed and semaphore configured
    if (primary !== "semaphore" && process.env.SEMAPHORE_API_KEY) {
      try { return await viaSemaphore(to, message); } catch {}
    }
    return { ok: false, provider: primary, error: String(e?.message ?? e) };
  }
}

export function billingSMS(name: string, speed: string, amount: number, period: string, due: string): string {
  const isp = process.env.ISP_NAME ?? "Cleantech ICT Solution Inc";
  const contact = process.env.ISP_CONTACT ?? "09291199933";
  return `${isp}: Hi ${name}, your ${speed} bill ₱${amount} for ${period} due ${due}. Pay cash/GCash or call ${contact}. Reply PAID + ref. Thank you!`;
}
