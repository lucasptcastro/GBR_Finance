import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface TopCrediaryCustomer {
  customerId: string;
  customerName: string;
  remainingInCents: number;
}

const parseDate = (str: string | undefined): Date | undefined => {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
};

export async function getTopCrediaryCustomers(
  limit = 10,
  from?: string,
  to?: string,
): Promise<TopCrediaryCustomer[]> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const pendingSales = await db.query.salesTable.findMany({
    where: (table, { and, eq, ne, gte, lte }) =>
      and(
        eq(table.paymentMethod, "crediary"),
        ne(table.status, "paid"),
        fromDate ? gte(table.date, fromDate) : undefined,
        toDate ? lte(table.date, toDate) : undefined,
      ),
    with: {
      customer: { columns: { id: true, name: true } },
      payments: { columns: { amountInCents: true } },
    },
  });

  const grouped = new Map<
    string,
    { customerName: string; remainingInCents: number }
  >();

  for (const sale of pendingSales) {
    if (!sale.customer) continue;
    const paid = sale.payments.reduce((sum, p) => sum + p.amountInCents, 0);
    const remaining = sale.totalAmountInCents - paid;
    const existing = grouped.get(sale.customer.id);
    if (existing) {
      existing.remainingInCents += remaining;
    } else {
      grouped.set(sale.customer.id, {
        customerName: sale.customer.name,
        remainingInCents: remaining,
      });
    }
  }

  return Array.from(grouped.entries())
    .map(([customerId, data]) => ({ customerId, ...data }))
    .sort((a, b) => b.remainingInCents - a.remainingInCents)
    .slice(0, limit);
}
