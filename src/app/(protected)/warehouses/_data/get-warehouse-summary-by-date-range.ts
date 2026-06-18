import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { birdBatchesTable, eggProductionTable, eggSalesTable, feedBagsTable } from "@/db/schema";

const EGGS_PER_TRAY = 30;
const KG_PER_FEED_BAG = 40;

export interface WarehouseSummary {
  feedBagsRemaining: number;
  totalFeedBagsRegistered: number;
  birdsAvailable: number;
  totalBirdsRegistered: number;
  mortalityPercentage: number;
  totalEggs: number;
  approximateTrays: number;
  stockEggs: number;
  stockTrays: number;
  feedKgPerBird: number;
  totalFeedUsed: number;
  birdsForFeedRate: number;
}

function resolveDateRange(from?: string, to?: string) {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const fromDate = from ? new Date(from) : defaultFrom;
  const toDate = to ? new Date(to) : defaultTo;

  return {
    resolvedFrom: isNaN(fromDate.getTime()) ? defaultFrom : fromDate,
    resolvedTo: isNaN(toDate.getTime()) ? defaultTo : toDate,
  };
}

export async function getWarehouseSummaryByDateRange(
  warehouseId: string,
  from?: string,
  to?: string,
): Promise<WarehouseSummary> {
  const { resolvedFrom, resolvedTo } = resolveDateRange(from, to);

  const [feedBagRows, batchRows, productionRows, salesRows, allBatchRows, allDeadBirdRows] =
    await Promise.all([
    db
      .select({ quantity: feedBagsTable.quantity })
      .from(feedBagsTable)
      .where(
        and(
          eq(feedBagsTable.warehouseId, warehouseId),
          gte(feedBagsTable.date, resolvedFrom),
          lte(feedBagsTable.date, resolvedTo),
        ),
      ),
    db
      .select({ quantity: birdBatchesTable.quantity })
      .from(birdBatchesTable)
      .where(
        and(
          eq(birdBatchesTable.warehouseId, warehouseId),
          gte(birdBatchesTable.intakeDate, resolvedFrom),
          lte(birdBatchesTable.intakeDate, resolvedTo),
        ),
      ),
    db
      .select({
        feedUsed: eggProductionTable.feedUsed,
        deadBirds: eggProductionTable.deadBirds,
        traysProduced: eggProductionTable.traysProduced,
        crackedEggs: eggProductionTable.crackedEggs,
      })
      .from(eggProductionTable)
      .where(
        and(
          eq(eggProductionTable.warehouseId, warehouseId),
          gte(eggProductionTable.date, resolvedFrom),
          lte(eggProductionTable.date, resolvedTo),
        ),
      ),
    db
      .select({ traysSold: eggSalesTable.traysSold })
      .from(eggSalesTable)
      .where(
        and(
          eq(eggSalesTable.warehouseId, warehouseId),
          gte(eggSalesTable.date, resolvedFrom),
          lte(eggSalesTable.date, resolvedTo),
        ),
      ),
    db
      .select({ quantity: birdBatchesTable.quantity })
      .from(birdBatchesTable)
      .where(eq(birdBatchesTable.warehouseId, warehouseId)),
    db
      .select({ deadBirds: eggProductionTable.deadBirds })
      .from(eggProductionTable)
      .where(eq(eggProductionTable.warehouseId, warehouseId)),
  ]);

  const totalFeedBagsRegistered = feedBagRows.reduce(
    (sum, row) => sum + row.quantity,
    0,
  );
  const totalFeedUsed = productionRows.reduce(
    (sum, row) => sum + row.feedUsed,
    0,
  );
  const totalBirdsRegistered = batchRows.reduce(
    (sum, row) => sum + row.quantity,
    0,
  );
  const totalDeadBirds = productionRows.reduce(
    (sum, row) => sum + row.deadBirds,
    0,
  );
  const birdsAvailable = totalBirdsRegistered - totalDeadBirds;
  const mortalityPercentage =
    totalBirdsRegistered > 0
      ? (totalDeadBirds / totalBirdsRegistered) * 100
      : 0;

  const totalEggsProduced = productionRows.reduce(
    (sum, row) => sum + row.traysProduced * EGGS_PER_TRAY,
    0,
  );
  const totalCrackedEggs = productionRows.reduce(
    (sum, row) => sum + row.crackedEggs,
    0,
  );
  const totalEggs = totalEggsProduced - totalCrackedEggs;
  const approximateTrays = Math.floor(totalEggs / EGGS_PER_TRAY);

  const totalTraysSold = salesRows.reduce(
    (sum, row) => sum + row.traysSold,
    0,
  );
  const soldEggs = totalTraysSold * EGGS_PER_TRAY;
  const stockEggs = Math.max(0, totalEggs - soldEggs);
  const stockTrays = Math.max(0, approximateTrays - totalTraysSold);

  const flockBirdsRegistered = allBatchRows.reduce(
    (sum, row) => sum + row.quantity,
    0,
  );
  const flockDeadBirds = allDeadBirdRows.reduce(
    (sum, row) => sum + row.deadBirds,
    0,
  );
  const birdsForFeedRate = flockBirdsRegistered - flockDeadBirds;
  const totalFeedKg = totalFeedUsed * KG_PER_FEED_BAG;
  const feedKgPerBird =
    birdsForFeedRate > 0 ? totalFeedKg / birdsForFeedRate : 0;

  return {
    feedBagsRemaining: totalFeedBagsRegistered - totalFeedUsed,
    totalFeedBagsRegistered,
    birdsAvailable,
    totalBirdsRegistered,
    mortalityPercentage,
    totalEggs,
    approximateTrays,
    stockEggs,
    stockTrays,
    feedKgPerBird,
    totalFeedUsed,
    birdsForFeedRate,
  };
}
