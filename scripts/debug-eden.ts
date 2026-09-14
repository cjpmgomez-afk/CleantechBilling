import { prisma } from "../lib/db";
async function main() {
  const clients = await prisma.client.findMany({ select: { id: true, name: true, createdAt: true } });
  const invs = await prisma.invoice.count();
  for (const c of clients) {
    if (c.name.toLowerCase().includes("ederico")) {
      console.log("EDERICO:", JSON.stringify(c));
    }
  }
  console.log("total clients:", clients.length, "total invoices:", invs);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });