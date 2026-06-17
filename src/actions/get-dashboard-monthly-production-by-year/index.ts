"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { eggProductionTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

export interface MonthlyProduction {
  month: string;
  year: string;
  traysProduced: number;
  eggsLeftover: number;
  crackedEggs: number;
  feedUsed: number;
  deadBirds: number;
}

export const getDashboardMonthlyProductionByYear = protectedActionClient
  .schema(
    z.object({ year: z.number(), warehouseId: z.string().optional() }),
  )
  .action(async ({ parsedInput: { year, warehouseId } }) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const rows = await db
      .select({
        month: sql<string>`to_char(${eggProductionTable.date}, 'MM')`,
        traysProduced: sql<number>`sum(${eggProductionTable.traysProduced})::int`,
        eggsLeftover: sql<number>`sum(${eggProductionTable.eggsLeftover})::int`,
        crackedEggs: sql<number>`sum(${eggProductionTable.crackedEggs})::int`,
        feedUsed: sql<number>`sum(${eggProductionTable.feedUsed})::int`,
        deadBirds: sql<number>`sum(${eggProductionTable.deadBirds})::int`,
      })
      .from(eggProductionTable)
      .where(
        and(
          gte(eggProductionTable.date, startDate),
          lt(eggProductionTable.date, endDate),
          warehouseId
            ? eq(eggProductionTable.warehouseId, warehouseId)
            : undefined,
        ),
      )
      .groupBy(sql`to_char(${eggProductionTable.date}, 'MM')`)
      .orderBy(sql`to_char(${eggProductionTable.date}, 'MM')`);

    const monthlyProductionData: MonthlyProduction[] = rows.map((row) => ({
      month: String(Number(row.month)),
      year: String(year),
      traysProduced: row.traysProduced ?? 0,
      eggsLeftover: row.eggsLeftover ?? 0,
      crackedEggs: row.crackedEggs ?? 0,
      feedUsed: row.feedUsed ?? 0,
      deadBirds: row.deadBirds ?? 0,
    }));

    return { year: String(year), warehouseId, monthlyProductionData };
  });
