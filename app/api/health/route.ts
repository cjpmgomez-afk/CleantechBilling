import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Diagnostics: visit /api/health to see DB status + which env vars are set.
// NEVER returns secret values, only true/false presence flags.
export const dynamic = "force-dynamic";
export async function GET() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    CRON_SECRET: !!process.env.CRON_SECRET,
    ISP_NAME: !!process.env.ISP_NAME,
    SMS_PROVIDER: process.env.SMS_PROVIDER ?? "(unset)",
    TEXTBEE_API_KEY: !!process.env.TEXTBEE_API_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
    const clients = await prisma.client.count();
    return NextResponse.json({ db: "up", clients, env });
  } catch (e: any) {
    const lines = String(e?.message ?? e).split("\n").map((s: string) => s.trim()).filter(Boolean);
    return NextResponse.json({ db: "down", error: lines.slice(0, 3).join(" | ").slice(0, 500), env }, { status: 500 });
  }
}
