import { prisma } from "../lib/db";
async function main() {
  const clients = await prisma.client.count();
  const active = await prisma.client.count({ where: { status: "ACTIVE" } });
  const disconnected = await prisma.client.count({ where: { status: "DISCONNECTED" } });
  const missingPhone = await prisma.client.count({ where: { OR: [{ phone: null }, { phone: "" }] } });
  const invoices = await prisma.invoice.count();
  const payments = await prisma.payment.count();
  const expenses = await prisma.expense.count();
  const sample = await prisma.client.findMany({ take: 3, select: { name: true, phone: true, speed: true, monthlyFee: true, status: true } });
  console.log(JSON.stringify({ clients, active, disconnected, missingPhone, invoices, payments, expenses, sample }));
}
main().then(() => process.exit(0)).catch((e) => { console.error("CHECK_FAILED", e); process.exit(1); });
