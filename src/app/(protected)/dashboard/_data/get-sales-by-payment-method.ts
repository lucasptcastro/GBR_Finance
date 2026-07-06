import { sql } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface SalesByPaymentMethod {
  paymentMethod: string;
  totalAmountInCents: number;
  salesCount: number;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  bank_slip: "Boleto",
  crediary: "Crediário",
};

export async function getSalesByPaymentMethod(): Promise<
  SalesByPaymentMethod[]
> {
  const rows = await db
    .select({
      paymentMethod: salesTable.paymentMethod,
      totalAmountInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .groupBy(salesTable.paymentMethod)
    .orderBy(sql`sum(${salesTable.totalAmountInCents}) desc`);

  return rows.map((row) => ({
    paymentMethod: PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod,
    totalAmountInCents: Number(row.totalAmountInCents ?? 0),
    salesCount: row.salesCount ?? 0,
  }));
}
