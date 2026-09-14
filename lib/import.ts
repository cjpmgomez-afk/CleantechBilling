import * as XLSX from "xlsx";

// Parse your client.xlsx: Client Name | PPPoE Profile | Speed | Amount | Date Install (+ optional Mobile/Email/Address/Status)
export type Row = Record<string, any>;
export function parseClientWorkbook(buf: Buffer) {
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
}
export function mapRow(r: Row) {
  const pick = (...ks: string[]) => { for (const k of ks) { const v = r[k] ?? r[k.toLowerCase()] ?? r[k.toUpperCase()]; if (v !== "" && v !== undefined) return String(v).trim(); } return ""; };
  return {
    name: pick("Client Name", "name", "Client"),
    pppoeProfile: pick("PPPoE Profile", "PPPoE", "Profile"),
    speed: pick("Speed", "Plan"),
    monthlyFee: Number(pick("Amount", "Fee", "Price") || 0),
    installedAt: r["Date Install"] ? new Date(r["Date Install"]) : null,
    phone: pick("Mobile", "Phone", "Contact", "Cellphone"),
    email: pick("Email", "E-mail"),
    address: pick("Address", "Barangay", "Location")
  };
}
