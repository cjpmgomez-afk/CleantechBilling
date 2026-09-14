import { sendSMS } from "../lib/sms";
async function main() {
  const r = await sendSMS("09291199933", "Cleantech ICT test message. If you got this, your free TextBee SMS is LIVE!");
  console.log(JSON.stringify(r));
}
main().then(() => process.exit(0)).catch((e) => { console.error("TEST_FAILED", e); process.exit(1); });