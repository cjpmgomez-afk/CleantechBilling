import { prisma } from "../lib/db";
import { sendSMS, disconnectNoticeSMS } from "../lib/sms";

async function main() {
  const q = process.argv[2] || "Eddie Maun";
  const client = await prisma.client.findFirst({
    where: { name: { contains: q } },
    include: { invoices: { where: { status: { in: ["UNPAID", "OVERDUE"] } }, take: 1, orderBy: { dueDate: "asc" } } }
  });
  if (!client) { console.log("No client found matching:", q); process.exit(1); }
  console.log("Found:", JSON.stringify({ name: client.name, phone: client.phone, fee: client.monthlyFee, status: client.status }));
  const inv = client.invoices[0];
  if (!inv) { console.log("No unpaid/overdue invoice for " + client.name); process.exit(1); }
  console.log("Invoice:", JSON.stringify({ period: inv.period, amount: inv.amount, status: inv.status, due: inv.dueDate.toISOString().slice(0, 10) }));
  const msg = disconnectNoticeSMS(client.name, inv.amount, inv.period);
  console.log("Message:", msg);
  const r = await sendSMS(client.phone, msg);
  console.log("Result:", JSON.stringify(r));
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED", e); process.exit(1); });