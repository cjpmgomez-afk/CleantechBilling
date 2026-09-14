import { prisma } from "../lib/db";
import { sendSMS, billingSMS } from "../lib/sms";

async function main() {
  const name = process.argv[2] || "Ederico Labao";
  const client = await prisma.client.findFirst({
    where: { name: { contains: name } },
    include: { invoices: { where: { status: { in: ["UNPAID", "OVERDUE"] } }, take: 1 } }
  });
  if (!client) { console.log("No client found matching:", name); process.exit(1); }
  console.log("Found:", JSON.stringify({ name: client.name, phone: client.phone, speed: client.speed, fee: client.monthlyFee, status: client.status }));
  const inv = client.invoices[0];
  if (!inv) { console.log("No unpaid invoice for " + client.name); process.exit(1); }
  const due = inv.dueDate.toISOString().slice(0, 10);
  const msg = billingSMS(client.name, client.speed ?? "plan", inv.amount, inv.period, due);
  console.log("Message:", msg);
  const r = await sendSMS(client.phone, msg);
  console.log("Result:", JSON.stringify(r));
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED", e); process.exit(1); });
