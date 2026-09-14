import { NextResponse } from "next/server";

// Vercel Cron automatically sends: Authorization: Bearer <CRON_SECRET>
// Manual testing still works via: ?secret=<CRON_SECRET>
export function checkCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null; // no secret configured -> allow (dev)
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") === secret) return null;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
