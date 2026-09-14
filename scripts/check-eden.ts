import { prisma } from "../lib/db";
async function main() {
  const c = await prisma.client.findFirst({ where: { name: { contains: "Ederico" } }, include: { invoices: { orderBy: { period: "desc" }, take: 5 } } });
  if (!c) { console.log("not found"); process.exit(1); }
  console.log(JSON.stringify(c.invoices.map((i: any) => ({ period: i.period, amount: i.amount, status: i.status, due: i.dueDate.toISOString().slice(0, 10) }))));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });