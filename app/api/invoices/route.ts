import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? undefined;
  const inv = await prisma.invoice.findMany({ where: period ? { period } : {}, include: { client: true }, orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json(inv);
}
