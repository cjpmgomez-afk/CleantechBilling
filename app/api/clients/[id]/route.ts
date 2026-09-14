import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/clients/[id] — edit client, toggle Active/Disconnected/Suspended
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  const data: any = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.phone !== undefined) data.phone = b.phone || null;
  if (b.email !== undefined) data.email = b.email || null;
  if (b.address !== undefined) data.address = b.address || null;
  if (b.pppoeProfile !== undefined) data.pppoeProfile = b.pppoeProfile || null;
  if (b.speed !== undefined) data.speed = b.speed || null;
  if (b.monthlyFee !== undefined) data.monthlyFee = Number(b.monthlyFee);
  if (b.status !== undefined) {
    data.status = b.status;
    if (b.status === "DISCONNECTED") {
      data.disconnectedAt = new Date();
      data.disconnectReason = b.disconnectReason || "manual disconnect";
    } else {
      data.disconnectedAt = null;
      data.disconnectReason = null;
    }
  }
  if (b.disconnectReason !== undefined && !b.status) data.disconnectReason = b.disconnectReason;
  if (b.notes !== undefined) data.notes = b.notes;
  const c = await prisma.client.update({ where: { id: params.id }, data });
  return NextResponse.json(c);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
