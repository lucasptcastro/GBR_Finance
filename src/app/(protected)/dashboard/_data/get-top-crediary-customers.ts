import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface TopCrediaryCustomer {
  customerId: string;
  customerName: string;
  remainingInCents: number;
}

export async function getTopCrediaryCustomers(
  limit = 10,
): Promise<TopCrediaryCustomer[]> {
  const pendingSales = await db.query.salesTable.findMany({
    where: (table, { and, eq, ne }) =>
      and(eq(table.paymentMethod, "crediary"), ne(table.status, "paid")),
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
