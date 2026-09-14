import { NextResponse } from "next/server";
import { generateBilling } from "@/lib/billing";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET && process.env.CRON_SECRET)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const period = searchParams.get("period") ?? undefined;
  return NextResponse.json(await generateBilling(period));
}
