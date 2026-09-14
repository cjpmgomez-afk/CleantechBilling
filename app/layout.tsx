import "./globals.css";
export const metadata = { title: "Cleantech Billing", description: "ISP automated billing" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <nav className="bg-slate-900 text-white px-4 py-3 flex gap-4 text-sm">
        <b>Cleantech ICT Solution Inc</b>
        <a href="/">Dashboard</a><a href="/clients">Clients</a><a href="/invoices">Invoices</a>
        <a href="/payments">Payments</a><a href="/expenses">Expenses</a><a href="/reports">Reports</a><a href="/settings">Settings</a>
      </nav>
      <main className="p-4 max-w-6xl mx-auto">{children}</main>
    </body></html>
  );
}
