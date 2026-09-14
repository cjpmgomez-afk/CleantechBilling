import { Resend } from "resend";

export async function sendEmail(to: string | null | undefined, subject: string, html: string) {
  if (!to) return { ok: false, error: "missing email" };
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY missing" };
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: process.env.EMAIL_FROM!, to, subject, html });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}

export function billingHTML(name: string, speed: string, amount: number, period: string, due: string) {
  const isp = process.env.ISP_NAME ?? "Cleantech ICT Solution Inc";
  const contact = process.env.ISP_CONTACT ?? "09291199933";
  return `<div style="font-family:sans-serif"><h2>${isp} — Billing ${period}</h2><p>Hi ${name},</p><p>Plan <b>${speed}</b> — Amount due <b>₱${amount}</b><br/>Due date: <b>${due}</b></p><p>Pay via cash / GCash / Maya. Contact ${contact}.</p></div>`;
}
