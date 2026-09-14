import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, include: { plan: true } });
  return NextResponse.json(clients);
}
export async function POST(req: Request) {
  const b = await req.json();
  const c = await prisma.client.create({ data: {
    name: b.name, phone: b.phone || null, email: b.email || null, address: b.address || null,
    pppoeProfile: b.pppoeProfile || null, speed: b.speed || null,
    monthlyFee: Number(b.monthlyFee || 0),
    installedAt: b.installedAt ? new Date(b.installedAt) : null,
    status: b.status ?? "ACTIVE"
  }});
  return NextResponse.json(c);
}
