import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface CustomerCreditSummary {
  customerId: string;
  customerName: string;
  totalOwedInCents: number;
  totalPaidInCents: number;
  remainingInCents: number;
  salesCount: number;
  pendingSales: {
    id: string;
    invoiceNumber: number;
    date: Date;
    traysSold: number;
    totalAmountInCents: number;
    paidAmountInCents: number;
    status: string;
    warehouseName: string;
  }[];
}

export async function getCustomersCredit(): Promise<CustomerCreditSummary[]> {
  const pendingSales = await db.query.salesTable.findMany({
    where: (table, { and, eq, ne }) =>
      and(
        eq(table.paymentMethod, "crediary"),
        ne(table.status, "paid"),
      ),
    with: {
      customer: { columns: { id: true, name: true } },
      warehouse: { columns: { name: true } },
      payments: { columns: { amountInCents: true } },
    },
    orderBy: (t, { asc }) => [asc(t.date)],
  });

  const grouped = new Map<string, CustomerCreditSummary>();

  for (const sale of pendingSales) {
    if (!sale.customer) continue;

    const paidAmountInCents = sale.payments.reduce(
      (sum, p) => sum + p.amountInCents,
      0,
    );
    const remainingInCents = sale.totalAmountInCents - paidAmountInCents;

    const existing = grouped.get(sale.customer.id);

    if (existing) {
      existing.totalOwedInCents += sale.totalAmountInCents;
      existing.totalPaidInCents += paidAmountInCents;
      existing.remainingInCents += remainingInCents;
      existing.salesCount += 1;
      existing.pendingSales.push({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        date: sale.date,
        traysSold: sale.traysSold,
        totalAmountInCents: sale.totalAmountInCents,
        paidAmountInCents,
        status: sale.status,
        warehouseName: sale.warehouse.name,
      });
    } else {
      grouped.set(sale.customer.id, {
        customerId: sale.customer.id,
        customerName: sale.customer.name,
        totalOwedInCents: sale.totalAmountInCents,
        totalPaidInCents: paidAmountInCents,
        remainingInCents,
        salesCount: 1,
        pendingSales: [
          {
            id: sale.id,
            invoiceNumber: sale.invoiceNumber,
            date: sale.date,
            traysSold: sale.traysSold,
            totalAmountInCents: sale.totalAmountInCents,
            paidAmountInCents,
            status: sale.status,
            warehouseName: sale.warehouse.name,
          },
        ],
      });
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.remainingInCents - a.remainingInCents,
  );
}
