import { sql } from "drizzle-orm";

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

export async function getSalesByStatus(): Promise<SalesByStatus[]> {
  const rows = await db
    .select({
      status: salesTable.status,
      totalAmountInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .groupBy(salesTable.status)
    .orderBy(sql`count(*) desc`);

  return rows.map((row) => ({
    status: row.status,
    label: STATUS_LABELS[row.status] ?? row.status,
    totalAmountInCents: Number(row.totalAmountInCents ?? 0),
    salesCount: row.salesCount ?? 0,
  }));
}
