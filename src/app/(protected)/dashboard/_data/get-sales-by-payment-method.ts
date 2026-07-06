import { and, gte, lte, sql } from "drizzle-orm";

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

const parseDate = (str: string | undefined): Date | undefined => {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
};

export async function getSalesByPaymentMethod(
  from?: string,
  to?: string,
): Promise<SalesByPaymentMethod[]> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const rows = await db
    .select({
      paymentMethod: salesTable.paymentMethod,
      totalAmountInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .where(
      and(
        fromDate ? gte(salesTable.date, fromDate) : undefined,
        toDate ? lte(salesTable.date, toDate) : undefined,
      ),
    )
    .groupBy(salesTable.paymentMethod)
    .orderBy(sql`sum(${salesTable.totalAmountInCents}) desc`);

  return rows.map((row) => ({
    paymentMethod:
      PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod,
    totalAmountInCents: Number(row.totalAmountInCents ?? 0),
    salesCount: row.salesCount ?? 0,
  }));
}
