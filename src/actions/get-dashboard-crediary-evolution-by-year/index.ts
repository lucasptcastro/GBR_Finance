"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { salesTable, salePaymentsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

export type { MonthlyCrediaryEvolution } from "@/app/(protected)/dashboard/_data/get-crediary-evolution-by-year";

export const getDashboardCrediaryEvolutionByYear = protectedActionClient
  .schema(z.object({ year: z.number() }))
  .action(async ({ parsedInput: { year } }) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const [grantedRows, receivedRows] = await Promise.all([
      db
        .select({
          month: sql<string>`to_char(${salesTable.date}, 'MM')`,
          grantedInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
        })
        .from(salesTable)
        .where(
          and(
            eq(salesTable.paymentMethod, "crediary"),
            gte(salesTable.date, startDate),
            lt(salesTable.date, endDate),
          ),
        )
        .groupBy(sql`to_char(${salesTable.date}, 'MM')`)
        .orderBy(sql`to_char(${salesTable.date}, 'MM')`),

      db
        .select({
          month: sql<string>`to_char(${salePaymentsTable.paymentDate}, 'MM')`,
          receivedInCents: sql<number>`sum(${salePaymentsTable.amountInCents})::bigint`,
        })
        .from(salePaymentsTable)
        .innerJoin(salesTable, eq(salePaymentsTable.saleId, salesTable.id))
        .where(
          and(
            eq(salesTable.paymentMethod, "crediary"),
            gte(salePaymentsTable.paymentDate, startDate),
            lt(salePaymentsTable.paymentDate, endDate),
          ),
        )
        .groupBy(sql`to_char(${salePaymentsTable.paymentDate}, 'MM')`)
        .orderBy(sql`to_char(${salePaymentsTable.paymentDate}, 'MM')`),
    ]);

    const grantedMap = new Map(
      grantedRows.map((r) => [String(Number(r.month)), Number(r.grantedInCents ?? 0)]),
    );
    const receivedMap = new Map(
      receivedRows.map((r) => [String(Number(r.month)), Number(r.receivedInCents ?? 0)]),
    );

    const evolutionData = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1);
      return {
        month,
        year: String(year),
        grantedInCents: grantedMap.get(month) ?? 0,
        receivedInCents: receivedMap.get(month) ?? 0,
      };
    });

    return { year: String(year), evolutionData };
  });
