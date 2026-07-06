import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface TopBuyingCustomer {
  customerId: string;
  customerName: string;
  totalAmountInCents: number;
  salesCount: number;
}

export async function getTopBuyingCustomers(
  limit = 10,
): Promise<TopBuyingCustomer[]> {
  const allSales = await db.query.salesTable.findMany({
    with: {
      customer: { columns: { id: true, name: true } },
    },
  });

  const grouped = new Map<
    string,
    { customerName: string; totalAmountInCents: number; salesCount: number }
  >();

  for (const sale of allSales) {
    if (!sale.customer) continue;
    const existing = grouped.get(sale.customer.id);
    if (existing) {
      existing.totalAmountInCents += sale.totalAmountInCents;
      existing.salesCount += 1;
    } else {
      grouped.set(sale.customer.id, {
        customerName: sale.customer.name,
        totalAmountInCents: sale.totalAmountInCents,
        salesCount: 1,
      });
    }
  }

  return Array.from(grouped.entries())
    .map(([customerId, data]) => ({ customerId, ...data }))
    .sort((a, b) => b.totalAmountInCents - a.totalAmountInCents)
    .slice(0, limit);
}
