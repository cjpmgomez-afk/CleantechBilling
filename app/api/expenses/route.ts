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
