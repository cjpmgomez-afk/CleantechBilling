import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSMS, billingSMS } from "@/lib/sms";
import { sendEmail, billingHTML } from "@/lib/email";

// Daily: send billing SMS+email for UNPAID/OVERDUE of current period. Batch 50/day safe for TextBee free.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET && process.env.CRON_SECRET)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const period = searchParams.get("period") ?? `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
  const limit = Number(searchParams.get("limit") ?? 50);
  const invoices = await prisma.invoice.findMany({
    where: { period, status: { in: ["UNPAID", "OVERDUE"] } },
    include: { client: true }, take: limit
  });
  let sent = 0, failed = 0, skipped = 0;
  for (const inv of invoices) {
    const c = inv.client;
    if (c.status !== "ACTIVE") { skipped++; continue; }
    const due = inv.dueDate.toISOString().slice(0, 10);
    const msg = billingSMS(c.name, c.speed ?? "plan", inv.amount, period, due);
    const sms = await sendSMS(c.phone, msg);
    await prisma.notificationLog.create({ data: {
      clientId: c.id, invoiceId: inv.id, channel: "SMS", provider: sms.provider,
      message: msg, status: sms.ok ? "SENT" : (sms.error?.includes("missing") ? "SKIPPED" : "FAILED"), error: sms.error ?? null
    }});
    if (c.email && process.env.RESEND_API_KEY) {
      const em = await sendEmail(c.email, `Cleantech Billing ${period} — ₱${inv.amount}`, billingHTML(c.name, c.speed ?? "plan", inv.amount, period, due));
      await prisma.notificationLog.create({ data: {
        clientId: c.id, invoiceId: inv.id, channel: "EMAIL", provider: "resend",
        message: `to ${c.email}`, status: em.ok ? "SENT" : "FAILED", error: (em as any).error ?? null
      }});
    }
    sms.ok ? sent++ : failed++;
  }
  return NextResponse.json({ period, sent, failed, skipped, total: invoices.length });
}
