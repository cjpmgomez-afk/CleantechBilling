import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/invoices/[id] — manually set invoice status (UNPAID / PAID / VOID)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  const inv = await prisma.invoice.findUnique({ where: { id: params.id }, include: { client: true } });
  if (!inv) return NextResponse.json({ error: "not found" }, { status: 404 });
  const status = b.status;
  if (!["UNPAID", "PAID", "OVERDUE", "VOID"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  let paymentsToVoid: string[] = [];
  if (status === "PAID" && inv.status !== "PAID") {
    const existing = await prisma.payment.findFirst({ where: { invoiceId: inv.id, voided: false } });
    if (!existing) {
      await prisma.payment.create({
        data: { invoiceId: inv.id, amount: inv.amount, method: (b.method as any) ?? "CASH", refNo: b.refNo || null, receivedBy: b.receivedBy || null }
      });
    }
  } else if (status === "UNPAID" && inv.status === "PAID") {
    const unvoided = await prisma.payment.findMany({ where: { invoiceId: inv.id, voided: false } });
    paymentsToVoid = unvoided.map((p) => p.id);
    if (paymentsToVoid.length) {
      await prisma.payment.updateMany({ where: { id: { in: paymentsToVoid } }, data: { voided: true } });
    }
  }
  const updated = await prisma.invoice.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(updated);
}