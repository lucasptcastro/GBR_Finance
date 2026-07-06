"use server";

import { and, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { salesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import type { MonthlySales } from "@/app/(protected)/dashboard/_data/get-monthly-sales-by-year";
export type { MonthlySales };

export const getDashboardMonthlySalesByYear = protectedActionClient
  .schema(z.object({ year: z.number() }))
  .action(async ({ parsedInput: { year } }) => {
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

    const monthlySalesData: MonthlySales[] = rows.map((row) => ({
      month: String(Number(row.month)),
      year: String(year),
      totalAmountInCents: Number(row.totalAmountInCents ?? 0),
      traysSold: row.traysSold ?? 0,
      salesCount: row.salesCount ?? 0,
    }));

    return { year: String(year), monthlySalesData };
  });
