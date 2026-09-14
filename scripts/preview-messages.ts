import { disconnectNoticeSMS, billingSMS } from "../lib/sms";
console.log("REMINDER:");
console.log(billingSMS("Juan Dela Cruz", "100", 999, "2026-09", "2026-09-30"));
console.log("");
console.log("DISCONNECT NOTICE:");
console.log(disconnectNoticeSMS("Juan Dela Cruz", 999, "2026-09"));