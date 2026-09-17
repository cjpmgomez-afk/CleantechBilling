import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendSMS } from "@/lib/sms";
import { normPH } from "@/lib/ph";
import { safeEqual, randomOtp, sha256Hex, otpMessage, signToken, verifyToken, SESSION_COOKIE, STEPUP_COOKIE, SESSION_HOURS, STEPUP_HOURS, OTP_TTL_MIN, OTP_MAX_PER_HOUR } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Step 1: verify APP_PASSWORD. If a valid 72h step-up cookie exists, renew the
// 24h session immediately; otherwise issue a fresh OTP by SMS to the admin number.
export async function POST(req: NextRequest) {
  const secret = process.env.APP_PASSWORD;
  if (!secret) return NextResponse.json({ error: "APP_PASSWORD not configured" }, { status: 500 });
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !safeEqual(password, secret)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  const now = Date.now();
  // Password-only mode (OTP temporarily disabled via OTP_ENABLED=false):
  // issue both cookies straight away, no SMS.
  if (process.env.OTP_ENABLED === "false") {
    const res = NextResponse.json({ ok: true, step: "logged-in" });
    res.cookies.set(SESSION_COOKIE, await signToken("session", now, secret), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_HOURS * 3600 });
    res.cookies.set(STEPUP_COOKIE, await signToken("stepup", now, secret), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: STEPUP_HOURS * 3600 });
    return res;
  }
  const stepUp = await verifyToken(req.cookies.get(STEPUP_COOKIE)?.value ?? "", "stepup", STEPUP_HOURS, secret);
  if (stepUp) {
    const res = NextResponse.json({ ok: true, step: "logged-in" });
    res.cookies.set(SESSION_COOKIE, await signToken("session", now, secret), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_HOURS * 3600 });
    return res;
  }

  const phone = normPH(process.env.ISP_CONTACT);
  if (!phone) return NextResponse.json({ error: "ISP_CONTACT not configured" }, { status: 500 });
  const hourAgo = new Date(now - 3600000);
  const recent = await prisma.otpRequest.count({ where: { phone, createdAt: { gte: hourAgo } } });
  if (recent >= OTP_MAX_PER_HOUR) return NextResponse.json({ error: "too many codes requested, try later" }, { status: 429 });
  const latest = await prisma.otpRequest.findFirst({ where: { phone, consumedAt: null, expiresAt: { gt: new Date(now) } }, orderBy: { createdAt: "desc" } });
  if (latest && now - +latest.createdAt < 60000) return NextResponse.json({ error: "code just sent, wait a minute" }, { status: 429 });

  const code = randomOtp();
  await prisma.otpRequest.create({ data: { phone, codeHash: await sha256Hex(code), expiresAt: new Date(now + OTP_TTL_MIN * 60000) } });
  const sms = await sendSMS(phone, otpMessage(code));
  if (!sms.ok) return NextResponse.json({ error: "SMS failed: " + (sms.error ?? "unknown") }, { status: 502 });
  return NextResponse.json({ ok: true, step: "otp" });
}