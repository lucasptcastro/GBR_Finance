"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { warehousesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteWarehouseSchema } from "./schema";

export const deleteWarehouse = protectedActionClient
  .schema(deleteWarehouseSchema)
  .action(async ({ parsedInput: data }) => {
    const existing = await db.query.warehousesTable.findFirst({
      where: eq(warehousesTable.id, data.id),
    });

    if (!existing) {
      throw new Error("Galpão não encontrado.");
    }

    await db.delete(warehousesTable).where(eq(warehousesTable.id, data.id));

    revalidatePath("/warehouses");
  });
