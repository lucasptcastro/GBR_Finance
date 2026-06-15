import dayjs from "dayjs";

import { db } from "@/db";

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

export type WarehouseWithBatches = {
  id: string;
  name: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  batches: BirdBatchWithAge[];
};

export async function getWarehouses(): Promise<WarehouseWithBatches[]> {
  const warehouses = await db.query.warehousesTable.findMany({
    with: {
      batches: true,
    },
    orderBy: (table, { asc }) => [asc(table.createdAt)],
  });

  const today = dayjs();

  return warehouses.map((warehouse) => ({
    ...warehouse,
    batches: warehouse.batches.map((batch) => ({
      ...batch,
      currentAgeMonths:
        batch.ageAtIntakeMonths + today.diff(dayjs(batch.intakeDate), "month"),
    })),
  }));
}
