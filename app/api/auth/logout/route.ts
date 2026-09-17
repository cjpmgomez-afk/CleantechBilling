import { NextResponse } from "next/server";
import { SESSION_COOKIE, STEPUP_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(STEPUP_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}