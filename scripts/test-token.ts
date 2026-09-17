import { signToken, verifyToken } from "../lib/auth";
async function main() {
  const secret = "test-secret-123";
  const now = Date.now();
  const s = await signToken("stepup", now, secret);
  console.log("token:", s);
  console.log("verify fresh:", await verifyToken(s, "stepup", 72, secret));
  console.log("verify wrong kind:", await verifyToken(s, "session", 24, secret));
  console.log("verify wrong secret:", await verifyToken(s, "stepup", 72, "nope"));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });