import { prisma } from "../lib/db";
async function main() {
  const plans: Array<[string, number]> = [["30Mbps", 799], ["50Mbps", 999], ["100Mbps", 1499]];
  for (const [name, price] of plans) {
    await prisma.plan.upsert({ where: { name }, update: {}, create: { name, price } });
  }
  console.log("seed ok: plans");
}
main().finally(() => process.exit(0));
