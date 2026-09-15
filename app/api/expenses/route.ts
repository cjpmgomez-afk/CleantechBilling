import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  return NextResponse.json(await prisma.expense.findMany({ orderBy: { date: "desc" }, take: 500 }));
}
export async function POST(req: Request) {
  const b = await req.json();
  return NextResponse.json(await prisma.expense.create({ data: {
    date: b.date ? new Date(b.date) : new Date(), category: b.category ?? "Others",
    amount: Number(b.amount), notes: b.notes || null
  }}));
}
export async function PATCH(req: Request) {
  const b = await req.json();
  const { id, ...data } = b;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (data.amount !== undefined) data.amount = Number(data.amount);
  if (data.date) data.date = new Date(data.date);
  return NextResponse.json(await prisma.expense.update({ where: { id }, data }));
}
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}