import { prisma } from "../lib/db";
import { normPH } from "../lib/ph";
async function main() {
  const all = await prisma.client.findMany({ select: { name: true, phone: true } });
  const groups = new Map<string, string[]>();
  let invalid = 0;
  for (const c of all) {
    const n = normPH(c.phone);
    if (!n) { invalid++; continue; }
    const k = n;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(c.name);
  }
  console.log(JSON.stringify({
    total: all.length,
    distinctNumbers: groups.size,
    invalidPhones: invalid,
    dupes: Array.from(groups.entries()).filter(([, v]) => v.length > 1).map(([k, v]) => ({ phone: k, count: v.length, sample: v.slice(0, 3) }))
  }));
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED", e); process.exit(1); });
