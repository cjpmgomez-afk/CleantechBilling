import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function POST(req: Request) {
  const b = await req.json(); // {invoiceId, amount, method, refNo, receivedBy}
  const pay = await prisma.payment.create({ data: {
    invoiceId: b.invoiceId, amount: Number(b.amount),
    method: b.method ?? "CASH", refNo: b.refNo || null, receivedBy: b.receivedBy || null
  }});
  await prisma.invoice.update({ where: { id: b.invoiceId }, data: { status: "PAID" } });
  return NextResponse.json(pay);
}
