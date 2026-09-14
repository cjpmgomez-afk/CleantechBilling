// PH helpers: normalize 09xx / 639xx -> +639xx, period utils.
export function normPH(mobile?: string | null): string | null {
  if (!mobile) return null;
  let d = mobile.replace(/\D/g, "");
  if (d.startsWith("63")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length !== 10 || !d.startsWith("9")) return null;
  return `+63${d}`;
}
export function currentPeriod(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function endOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}
export function peso(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}
