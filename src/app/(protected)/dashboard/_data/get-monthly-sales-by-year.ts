import { and, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface MonthlySales {
  month: string;
  year: string;
  totalAmountInCents: number;
  traysSold: number;
  salesCount: number;
}

export async function getMonthlySalesByYear(
  year: number,
): Promise<MonthlySales[]> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const rows = await db
    .select({
      month: sql<string>`to_char(${salesTable.date}, 'MM')`,
      totalAmountInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
      traysSold: sql<number>`sum(${salesTable.traysSold})::int`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .where(
      and(
        gte(salesTable.date, startDate),
        lt(salesTable.date, endDate),
      ),
    )
    .groupBy(sql`to_char(${salesTable.date}, 'MM')`)
    .orderBy(sql`to_char(${salesTable.date}, 'MM')`);

  return rows.map((row) => ({
    month: String(Number(row.month)),
    year: String(year),
    totalAmountInCents: Number(row.totalAmountInCents ?? 0),
    traysSold: row.traysSold ?? 0,
    salesCount: row.salesCount ?? 0,
  }));
}
