import { prisma } from "../lib/db";
import { sendSMS, billingSMS } from "../lib/sms";

async function main() {
  const client = await prisma.client.findFirst({
    where: { name: { contains: "Jonathan" } },
    include: { invoices: { where: { status: { in: ["UNPAID", "OVERDUE"] } }, take: 1 } }
  });
  if (!client) { console.log("No client found"); process.exit(1); }
  const inv = client.invoices[0];
  if (!inv) { console.log("No unpaid invoice for " + client.name); process.exit(1); }
  const due = inv.dueDate.toISOString().slice(0, 10);
  const msg = billingSMS(client.name, client.speed ?? "plan", inv.amount, inv.period, due);
  console.log("Message:", msg);
  console.log("Phone:", client.phone);
  const r = await sendSMS(client.phone, msg);
  console.log("Result:", JSON.stringify(r));
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED", e); process.exit(1); });
