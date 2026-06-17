import { db } from "@/db";

export type WarehouseListItem = {
  id: string;
  name: string;
};

export async function getWarehousesList(): Promise<WarehouseListItem[]> {
  const rows = await db.query.warehousesTable.findMany({
    columns: { id: true, name: true },
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return rows;
}
