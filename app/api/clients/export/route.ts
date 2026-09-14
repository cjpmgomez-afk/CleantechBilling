import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
const XLSX = require("xlsx");

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { plan: true }
  });
  const rows = clients.map((c: any) => ({
    "Client Name": c.name,
    "Mobile": c.phone ?? "",
    "Email": c.email ?? "",
    "Address": c.address ?? "",
    "PPPoE Profile": c.pppoeProfile ?? "",
    "Speed (Mbps)": c.speed ?? "",
    "Monthly Fee": c.monthlyFee,
    "Status": c.status,
    "Date Install": c.installedAt ? c.installedAt.toISOString().slice(0, 10) : ""
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Clients");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}