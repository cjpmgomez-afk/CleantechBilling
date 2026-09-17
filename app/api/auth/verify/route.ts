import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normPH } from "@/lib/ph";
import { safeEqual, sha256Hex, signToken, SESSION_COOKIE, STEPUP_COOKIE, SESSION_HOURS, STEPUP_HOURS, OTP_MAX_ATTEMPTS } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Step 2: verify the OTP code. On success issue 24h session + 72h step-up cookies.
export async function POST(req: Request) {
  const secret = process.env.APP_PASSWORD;
  if (!secret) return NextResponse.json({ error: "APP_PASSWORD not configured" }, { status: 500 });
  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "enter the 6-digit code" }, { status: 400 });
  }
  const phone = normPH(process.env.ISP_CONTACT);
  if (!phone) return NextResponse.json({ error: "ISP_CONTACT not configured" }, { status: 500 });
  const now = Date.now();
  const otp = await prisma.otpRequest.findFirst({ where: { phone, consumedAt: null, expiresAt: { gt: new Date(now) } }, orderBy: { createdAt: "desc" } });
  if (!otp) return NextResponse.json({ error: "no active code — request a new one" }, { status: 410 });
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpRequest.update({ where: { id: otp.id }, data: { consumedAt: new Date(now) } });
    return NextResponse.json({ error: "too many wrong tries — request a new code" }, { status: 410 });
  }
  if (!safeEqual(await sha256Hex(code), otp.codeHash)) {
    await prisma.otpRequest.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } });
    return NextResponse.json({ error: "wrong code" }, { status: 401 });
  }
  await prisma.otpRequest.update({ where: { id: otp.id }, data: { consumedAt: new Date(now) } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await signToken("session", now, secret), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_HOURS * 3600 });
  res.cookies.set(STEPUP_COOKIE, await signToken("stepup", now, secret), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: STEPUP_HOURS * 3600 });
  return res;
}