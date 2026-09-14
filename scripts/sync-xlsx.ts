import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/db";
import { parseClientWorkbook, mapRow } from "../lib/import";

async function main() {
  const p = path.resolve(process.cwd(), "..", "client.xlsx");
  const rows = parseClientWorkbook(fs.readFileSync(p));
  console.log(JSON.stringify({ file: p, rows: rows.length, headers: Object.keys((rows[0] as any) ?? {}) }));
  let added = 0, updated = 0, skipped = 0;
  const stillMissing: string[] = [];
  for (const r of rows) {
    const m = mapRow(r as any);
    if (!m.name || !m.monthlyFee) { skipped++; continue; }
    const existing = await prisma.client.findFirst({ where: { name: m.name } });
    if (!existing) {
      await prisma.client.create({
        data: {
          name: m.name, pppoeProfile: m.pppoeProfile || null, speed: m.speed || null,
          monthlyFee: m.monthlyFee,
          installedAt: m.installedAt && !isNaN(+m.installedAt) ? m.installedAt : null,
          phone: m.phone || null, email: m.email || null, address: m.address || null, status: "ACTIVE"
        }
      });
      added++;
      if (!m.phone) stillMissing.push(m.name);
      continue;
    }
    const patch: any = {};
    if (m.phone && m.phone !== existing.phone) patch.phone = m.phone;
    if (m.email && m.email !== existing.email) patch.email = m.email;
    if (m.address && m.address !== existing.address) patch.address = m.address;
    if (m.pppoeProfile && m.pppoeProfile !== existing.pppoeProfile) patch.pppoeProfile = m.pppoeProfile;
    if (m.speed && m.speed !== existing.speed) patch.speed = m.speed;
    if (m.monthlyFee && m.monthlyFee !== existing.monthlyFee) patch.monthlyFee = m.monthlyFee;
    if (Object.keys(patch).length) { await prisma.client.update({ where: { id: existing.id }, data: patch }); updated++; }
    const cur = { ...existing, ...patch };
    if (!cur.phone && !cur.email) stillMissing.push(m.name);
  }
  console.log(JSON.stringify({ added, updated, skipped, stillMissingTotal: stillMissing.length, stillMissing: stillMissing.slice(0, 20) }));
}
main().then(() => process.exit(0)).catch((e) => { console.error("SYNC_FAILED", e); process.exit(1); });
