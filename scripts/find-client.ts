import { prisma } from "../lib/db";
import { sendSMS, disconnectNoticeSMS } from "../lib/sms";

async function main() {
  const q = process.argv[2] || "Eddie Maun";
  const client = await prisma.client.findFirst({
    where: { name: { contains: q } },
    include: { invoices: { orderBy: { dueDate: "asc" }, take: 5 } }
  });
  if (!client) { console.log("No client found matching:", q); process.exit(1); }
  console.log("Found:", JSON.stringify({ name: client.name, phone: client.phone, fee: client.monthlyFee, status: client.status }));
  console.log("Invoices:", JSON.stringify(client.invoices.map((i: any) => ({ period: i.period, amount: i.amount, status: i.status, due: i.dueDate.toISOString().slice(0, 10) }))));
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED", e); process.exit(1); });