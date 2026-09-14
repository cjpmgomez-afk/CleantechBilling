import "./globals.css";
import Image from "next/image";
export const metadata = {
  title: "Cleantech Billing",
  description: "ISP automated billing — Cleantech ICT Solution Inc",
  icons: { icon: "/companylogo.jpg" }
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <nav className="bg-slate-900 text-white px-4 py-3 flex items-center gap-4 text-sm">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/companylogo.jpg" alt="Cleantech" width={32} height={32} className="rounded" />
          <b>Cleantech ICT Solution Inc</b>
        </a>
        <div className="flex gap-4 ml-auto">
          <a href="/">Dashboard</a><a href="/clients">Clients</a><a href="/invoices">Invoices</a>
          <a href="/payments">Payments</a><a href="/expenses">Expenses</a><a href="/reports">Reports</a><a href="/settings">Settings</a>
        </div>
      </nav>
      <main className="p-4 max-w-6xl mx-auto">{children}</main>
    </body></html>
  );
}
