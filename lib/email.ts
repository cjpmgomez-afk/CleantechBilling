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
  return `<div style="font-family:sans-serif"><h2>${isp} — Billing ${period}</h2><p>Hi ${name},</p><p>Amount due: <b>₱${amount}</b><br/>Due date: <b>${due}</b> (end of month)<br/>Grace period until: <b>5th of next month</b></p><p>Pay via cash / GCash / Maya. Contact ${contact}.</p></div>`;
}

export function disconnectHTML(name: string, amount: number, period: string) {
  const isp = process.env.ISP_NAME ?? "Cleantech ICT Solution Inc";
  const contact = process.env.ISP_CONTACT ?? "09291199933";
  const day = process.env.DISCONNECT_DAY ?? "10";
  return `<div style="font-family:sans-serif"><h2>${isp} — Disconnection Notice</h2><p>Hi ${name},</p><p>Your <b>₱${amount}</b> bill for <b>${period}</b> is still unpaid.</p><p>We did not receive any payment (cash / GCash / Maya). Please settle your balance now to avoid <b>disconnection on the ${day}th of the month</b>.</p><p>Contact ${contact}.</p></div>`;
}
