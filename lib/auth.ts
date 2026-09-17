// Password + SMS OTP gate. Edge-safe: WebCrypto only, no Node imports
// (imported by both middleware (Edge) and API routes (Node)).
export const SESSION_COOKIE = "ct_session";
export const STEPUP_COOKIE = "ct_stepup";
export const SESSION_HOURS = 24;
export const STEPUP_HOURS = 72;
export const OTP_TTL_MIN = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_PER_HOUR = 3;

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

// Constant-time string compare (Edge-safe; no timingSafeEqual on Edge).
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signToken(kind: "session" | "stepup", issuedAtMs: number, secret: string): Promise<string> {
  const payload = `v1.${kind}.${issuedAtMs}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(payload));
  return `${payload}.${b64urlEncode(new Uint8Array(sig))}`;
}

// Returns issuedAtMs if valid and within maxAgeHours, else null.
export async function verifyToken(token: string, kind: "session" | "stepup", maxAgeHours: number, secret: string): Promise<number | null> {
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1" || parts[1] !== kind) return null;
  const issuedAt = Number(parts[2]);
  if (!Number.isFinite(issuedAt)) return null;
  const payload = parts.slice(0, 3).join(".");
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(payload));
  if (!safeEqual(b64urlEncode(new Uint8Array(sig)), parts[3])) return null;
  if (Date.now() - issuedAt > maxAgeHours * 3600000) return null;
  return issuedAt;
}

export async function sha256Hex(s: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  let out = "";
  for (let i = 0; i < d.length; i++) out += d[i].toString(16).padStart(2, "0");
  return out;
}

export function randomOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000)); // 6 digits, no leading zero
}

export function otpMessage(code: string): string {
  const isp = process.env.ISP_NAME ?? "Cleantech ICT Solution Inc";
  return `${isp}: your login code is ${code}. Valid for ${OTP_TTL_MIN} minutes. Do not share it.`;
}
