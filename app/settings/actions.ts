"use server";
import { sendSMS } from "@/lib/sms";

// Sends a one-off test SMS via the configured provider (TextBee free).
// Runs server-side so API keys never leave the server.
export async function sendTestSms(to: string, message: string) {
  const msg = message?.trim() || `Cleantech ICT test message. If you got this, free SMS is working! (${new Date().toISOString().slice(0, 16)})`;
  const r = await sendSMS(to, msg);
  return { ok: r.ok, provider: r.provider, error: r.error ?? null };
}
