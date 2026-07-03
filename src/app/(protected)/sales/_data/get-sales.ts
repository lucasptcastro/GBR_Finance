import { desc } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export type SaleWithRelations = typeof salesTable.$inferSelect & {
  customer: { id: string; name: string } | null;
  warehouse: { id: string; name: string };
  bankAccount: { id: string; name: string; color: string } | null;
  payments: {
    id: string;
    amountInCents: number;
    paymentDate: Date;
    paymentMethod: string;
    notes: string | null;
    bankAccountId: string | null;
  }[];
};

export async function getSales(): Promise<SaleWithRelations[]> {
  const sales = await db.query.salesTable.findMany({
    with: {
      customer: {
        columns: { id: true, name: true },
      },
      warehouse: {
        columns: { id: true, name: true },
      },
      bankAccount: {
        columns: { id: true, name: true, color: true },
      },
      payments: {
        columns: {
          id: true,
          amountInCents: true,
          paymentDate: true,
          paymentMethod: true,
          notes: true,
          bankAccountId: true,
        },
        orderBy: (p, { asc }) => [asc(p.paymentDate)],
      },
    },
    orderBy: [desc(salesTable.date), desc(salesTable.invoiceNumber)],
  });

  return sales as SaleWithRelations[];
}
