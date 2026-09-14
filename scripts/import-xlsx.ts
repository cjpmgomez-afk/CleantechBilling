import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/db";
import { parseClientWorkbook, mapRow } from "../lib/import";

async function main() {
  const p = path.resolve(process.cwd(), "..", "client.xlsx");
  if (!fs.existsSync(p)) throw new Error("client.xlsx not found at " + p);
  const rows = parseClientWorkbook(fs.readFileSync(p));
  let added = 0, skipped = 0;
  const missing: string[] = [];
  for (const r of rows) {
    const m = mapRow(r as any);
    if (!m.name || !m.monthlyFee) { skipped++; continue; }
    const exists = await prisma.client.findFirst({ where: { name: m.name, pppoeProfile: m.pppoeProfile || undefined } });
    if (exists) { skipped++; continue; }
    await prisma.client.create({
      data: {
        name: m.name, pppoeProfile: m.pppoeProfile || null, speed: m.speed || null,
        monthlyFee: m.monthlyFee,
        installedAt: m.installedAt && !isNaN(+m.installedAt) ? m.installedAt : null,
        phone: m.phone || null, email: m.email || null, address: m.address || null, status: "ACTIVE"
      }
    });
    added++;
    if (!m.phone && !m.email) missing.push(m.name);
  }
  console.log(JSON.stringify({ file: p, rows: rows.length, added, skipped, missingContact: missing.slice(0, 20), missingTotal: missing.length }));
}
main().then(() => process.exit(0)).catch((e) => { console.error("IMPORT_FAILED", e); process.exit(1); });
