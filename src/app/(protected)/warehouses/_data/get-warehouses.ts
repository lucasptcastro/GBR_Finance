import dayjs from "dayjs";

import { db } from "@/db";
import { eggProductionTable } from "@/db/schema";

export type BirdBatchWithAge = {
  id: string;
  name: string;
  quantity: number;
  intakeDate: Date;
  ageAtIntakeMonths: number;
  currentAgeMonths: number;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

export type FeedBag = {
  id: string;
  quantity: number;
  date: Date;
  warehouseId: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

export type WarehouseWithBatches = {
  id: string;
  name: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  batches: BirdBatchWithAge[];
  feedBags: FeedBag[];
  totalFeedBagsRegistered: number;
  feedBagsRemaining: number;
  totalBirdsRegistered: number;
  totalDeadBirds: number;
  birdsAvailable: number;
  mortalityPercentage: number;
};

export async function getWarehouses(): Promise<WarehouseWithBatches[]> {
  const [warehouses, productionRows] = await Promise.all([
    db.query.warehousesTable.findMany({
      with: {
        batches: true,
        feedBags: true,
      },
      orderBy: (table, { asc }) => [asc(table.createdAt)],
    }),
    db
      .select({
        warehouseId: eggProductionTable.warehouseId,
        feedUsed: eggProductionTable.feedUsed,
        deadBirds: eggProductionTable.deadBirds,
      })
      .from(eggProductionTable),
  ]);

  const feedUsedByWarehouse = new Map<string, number>();
  const deadBirdsByWarehouse = new Map<string, number>();
  for (const row of productionRows) {
    if (!row.warehouseId) continue;
    feedUsedByWarehouse.set(
      row.warehouseId,
      (feedUsedByWarehouse.get(row.warehouseId) ?? 0) + row.feedUsed,
    );
    deadBirdsByWarehouse.set(
      row.warehouseId,
      (deadBirdsByWarehouse.get(row.warehouseId) ?? 0) + row.deadBirds,
    );
  }

  const today = dayjs();

  return warehouses.map((warehouse) => {
    const totalFeedBagsRegistered = warehouse.feedBags.reduce(
      (sum, fb) => sum + fb.quantity,
      0,
    );
    const totalFeedUsed = feedUsedByWarehouse.get(warehouse.id) ?? 0;
    const totalBirdsRegistered = warehouse.batches.reduce(
      (sum, batch) => sum + batch.quantity,
      0,
    );
    const totalDeadBirds = deadBirdsByWarehouse.get(warehouse.id) ?? 0;
    const birdsAvailable = totalBirdsRegistered - totalDeadBirds;
    const mortalityPercentage =
      totalBirdsRegistered > 0
        ? (totalDeadBirds / totalBirdsRegistered) * 100
        : 0;

    return {
      ...warehouse,
      batches: warehouse.batches.map((batch) => ({
        ...batch,
        currentAgeMonths:
          batch.ageAtIntakeMonths +
          today.diff(dayjs(batch.intakeDate), "month"),
      })),
      feedBagsRemaining: totalFeedBagsRegistered - totalFeedUsed,
      totalFeedBagsRegistered,
      totalBirdsRegistered,
      totalDeadBirds,
      birdsAvailable,
      mortalityPercentage,
    };
  });
}
