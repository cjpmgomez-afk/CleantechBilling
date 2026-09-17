import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE, SESSION_HOURS } from "./lib/auth";

const PUBLIC_PREFIXES = ["/login", "/api/auth/", "/api/health", "/api/cron/"];
const PUBLIC_EXACT = new Set(["/manifest.webmanifest", "/sw.js", "/favicon.ico"]);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (
    PUBLIC_EXACT.has(path) ||
    PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p)) ||
    path.startsWith("/_next/") ||
    /\.(png|jpg|jpeg|svg|ico|webmanifest)$/.test(path)
  ) {
    return NextResponse.next();
  }
  const secret = process.env.APP_PASSWORD;
  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const valid = secret ? await verifyToken(token, "session", SESSION_HOURS, secret) : null;
  if (valid) return NextResponse.next();
  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};