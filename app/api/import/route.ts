import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseClientWorkbook, mapRow } from "@/lib/import";
export async function POST(req: Request) {
  const fd = await req.formData();
  const f = fd.get("file") as File | null;
  if (!f) return NextResponse.json({ error: "no file" }, { status: 400 });
  const rows = parseClientWorkbook(Buffer.from(await f.arrayBuffer()));
  let added = 0, skipped = 0; const missing: string[] = [];
  for (const r of rows) {
    const m = mapRow(r as any);
    if (!m.name || !m.monthlyFee) { skipped++; continue; }
    const exists = await prisma.client.findFirst({ where: { name: m.name, pppoeProfile: m.pppoeProfile || undefined } });
    if (exists) { skipped++; continue; }
    await prisma.client.create({ data: {
      name: m.name, pppoeProfile: m.pppoeProfile || null, speed: m.speed || null,
      monthlyFee: m.monthlyFee, installedAt: m.installedAt && !isNaN(+m.installedAt) ? m.installedAt : null,
      phone: m.phone || null, email: m.email || null, address: m.address || null, status: "ACTIVE"
    }});
    added++;
    if (!m.phone && !m.email) missing.push(m.name);
  }
  return NextResponse.json({ added, skipped, missingContact: missing });
}
