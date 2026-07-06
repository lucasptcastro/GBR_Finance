import { and, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface SalesByStatus {
  status: string;
  label: string;
  totalAmountInCents: number;
  salesCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  partially_paid: "Parcialmente Pago",
  pending: "Pendente",
};

const parseDate = (str: string | undefined): Date | undefined => {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
};

export async function getSalesByStatus(
  from?: string,
  to?: string,
): Promise<SalesByStatus[]> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const rows = await db
    .select({
      status: salesTable.status,
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
    .groupBy(salesTable.status)
    .orderBy(sql`count(*) desc`);

  return rows.map((row) => ({
    status: row.status,
    label: STATUS_LABELS[row.status] ?? row.status,
    totalAmountInCents: Number(row.totalAmountInCents ?? 0),
    salesCount: row.salesCount ?? 0,
  }));
}
