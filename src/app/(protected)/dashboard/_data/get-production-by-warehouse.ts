import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { eggProductionTable, warehousesTable } from "@/db/schema";

export interface ProductionByWarehouse {
  warehouseId: string;
  warehouseName: string;
  traysProduced: number;
  deadBirds: number;
  feedUsed: number;
}

const parseDate = (str: string | undefined): Date | undefined => {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
};

export async function getProductionByWarehouse(
  from?: string,
  to?: string,
): Promise<ProductionByWarehouse[]> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const resolvedFrom = fromDate ?? defaultFrom;
  const resolvedTo = toDate ?? defaultTo;

  const rows = await db
    .select({
      warehouseId: warehousesTable.id,
      warehouseName: warehousesTable.name,
      traysProduced: sql<number>`coalesce(sum(${eggProductionTable.traysProduced}), 0)::int`,
      deadBirds: sql<number>`coalesce(sum(${eggProductionTable.deadBirds}), 0)::int`,
      feedUsed: sql<number>`coalesce(sum(${eggProductionTable.feedUsed}), 0)::int`,
    })
    .from(warehousesTable)
    .leftJoin(
      eggProductionTable,
      and(
        eq(eggProductionTable.warehouseId, warehousesTable.id),
        gte(eggProductionTable.date, resolvedFrom),
        lte(eggProductionTable.date, resolvedTo),
      ),
    )
    .groupBy(warehousesTable.id, warehousesTable.name)
    .orderBy(sql`sum(${eggProductionTable.traysProduced}) desc nulls last`);

  return rows.map((r) => ({
    warehouseId: r.warehouseId,
    warehouseName: r.warehouseName,
    traysProduced: r.traysProduced ?? 0,
    deadBirds: r.deadBirds ?? 0,
    feedUsed: r.feedUsed ?? 0,
  }));
}
