import { NextResponse } from "next/server";
import { generateBilling } from "@/lib/billing";
import { checkCronAuth } from "@/lib/cron-auth";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(req: Request) {
  const denied = checkCronAuth(req);
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? undefined;
  return NextResponse.json(await generateBilling(period));
}
