import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSMS, billingSMS } from "@/lib/sms";
import { sendEmail, billingHTML } from "@/lib/email";
import { checkCronAuth } from "@/lib/cron-auth";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GAP_DAYS = Number(process.env.REMINDER_GAP_DAYS ?? 7); // don't re-text same invoice more than once per week

// Daily sweep: remind UNPAID/OVERDUE invoices for ACTIVE clients (any period, so
// overdue last-month bills still get nudged). Dedupes per invoice via NotificationLog.
export async function GET(req: Request) {
  const denied = checkCronAuth(req);
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period"); // optional filter, else any
  const limit = Number(searchParams.get("limit") ?? 50);
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["UNPAID", "OVERDUE"] },
      client: { status: "ACTIVE" },
      ...(period ? { period } : {})
    },
    include: { client: true },
    orderBy: { dueDate: "asc" },
    take: limit
  });
  let sent = 0, failed = 0, skipped = 0;
  for (const inv of invoices) {
    const c = inv.client;
    const due = inv.dueDate.toISOString().slice(0, 10);
    // skip if we already texted this invoice within GAP_DAYS
    const last = await prisma.notificationLog.findFirst({
      where: { invoiceId: inv.id, channel: "SMS", status: "SENT" },
      orderBy: { createdAt: "desc" }
    });
    if (last && Date.now() - +last.createdAt < GAP_DAYS * 86400000) { skipped++; continue; }

    const msg = billingSMS(c.name, c.speed ?? "plan", inv.amount, inv.period, due);
    const sms = await sendSMS(c.phone, msg);
    await prisma.notificationLog.create({ data: {
      clientId: c.id, invoiceId: inv.id, channel: "SMS", provider: sms.provider,
      message: msg, status: sms.ok ? "SENT" : (sms.error?.includes("missing") ? "SKIPPED" : "FAILED"), error: sms.error ?? null
    }});
    if (c.email && process.env.RESEND_API_KEY) {
      const em = await sendEmail(c.email, `Cleantech Billing ${inv.period} — ₱${inv.amount}`, billingHTML(c.name, c.speed ?? "plan", inv.amount, inv.period, due));
      await prisma.notificationLog.create({ data: {
        clientId: c.id, invoiceId: inv.id, channel: "EMAIL", provider: "resend",
        message: `to ${c.email}`, status: em.ok ? "SENT" : "FAILED", error: (em as any).error ?? null
      }});
    }
    sms.ok ? sent++ : failed++;
  }
  return NextResponse.json({ period: period ?? "any", sent, failed, skipped, total: invoices.length, gapDays: GAP_DAYS });
}