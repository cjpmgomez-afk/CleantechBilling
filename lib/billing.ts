import { prisma } from "./db";
import { currentPeriod, endOfMonth } from "./ph";

// Generate invoices for all ACTIVE clients for given period (default current month).
// Skips DISCONNECTED/SUSPENDED. Idempotent via @@unique([clientId, period]).
export async function generateBilling(period = currentPeriod()) {
  const now = new Date();
  const dueDate = process.env.DUE_DAY === "end" ? endOfMonth(now) : endOfMonth(now);
  const clients = await prisma.client.findMany({ where: { status: "ACTIVE" } });
  let created = 0, skipped = 0;
  for (const c of clients) {
    try {
      await prisma.invoice.create({ data: { clientId: c.id, period, amount: c.monthlyFee, dueDate, status: "UNPAID" } });
      created++;
    } catch { skipped++; } // duplicate
  }
  // mark overdue
  await prisma.invoice.updateMany({ where: { dueDate: { lt: now }, status: "UNPAID" }, data: { status: "OVERDUE" } });
  return { period, dueDate, created, skipped, totalActive: clients.length };
}

export async function monthStats(yyyyMM: string) {
  const [y, m] = yyyyMM.split("-").map(Number);
  const start = new Date(y, m - 1, 1), end = new Date(y, m, 1);
  const [paid, exp, billed] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: start, lt: end }, voided: false } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: start, lt: end } } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { period: yyyyMM } })
  ]);
  const collected = paid._sum.amount ?? 0, expenses = exp._sum.amount ?? 0, billedAmt = billed._sum.amount ?? 0;
  return { period: yyyyMM, billed: billedAmt, collected, expenses, net: collected - expenses };
}
