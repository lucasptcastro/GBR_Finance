import { and, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { eggProductionTable } from "@/db/schema";

const EGGS_PER_TRAY = 30;

export interface ProductionSummary {
  totalTrays: number;
  totalEggs: number;
  eggsLeftover: number;
  crackedEggs: number;
  feedUsed: number;
  deadBirds: number;
}

export async function getProductionSummaryByDateRange(
  from?: string,
  to?: string,
): Promise<ProductionSummary> {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const fromDate = from ? new Date(from) : defaultFrom;
  const toDate = to ? new Date(to) : defaultTo;

  const resolvedFrom = isNaN(fromDate.getTime()) ? defaultFrom : fromDate;
  const resolvedTo = isNaN(toDate.getTime()) ? defaultTo : toDate;

  const [row] = await db
    .select({
      totalTrays: sql<number>`coalesce(sum(${eggProductionTable.traysProduced}), 0)::int`,
      eggsLeftover: sql<number>`coalesce(sum(${eggProductionTable.eggsLeftover}), 0)::int`,
      crackedEggs: sql<number>`coalesce(sum(${eggProductionTable.crackedEggs}), 0)::int`,
      feedUsed: sql<number>`coalesce(sum(${eggProductionTable.feedUsed}), 0)::int`,
      deadBirds: sql<number>`coalesce(sum(${eggProductionTable.deadBirds}), 0)::int`,
    })
    .from(eggProductionTable)
    .where(
      and(
        gte(eggProductionTable.date, resolvedFrom),
        lte(eggProductionTable.date, resolvedTo),
      ),
    );

  const totalTrays = row?.totalTrays ?? 0;

  return {
    totalTrays,
    totalEggs: totalTrays * EGGS_PER_TRAY,
    eggsLeftover: row?.eggsLeftover ?? 0,
    crackedEggs: row?.crackedEggs ?? 0,
    feedUsed: row?.feedUsed ?? 0,
    deadBirds: row?.deadBirds ?? 0,
  };
}
