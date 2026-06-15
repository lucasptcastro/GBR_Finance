"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { warehousesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertWarehouseSchema } from "./schema";

export const upsertWarehouse = protectedActionClient
  .schema(upsertWarehouseSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    if (data.id) {
      const existing = await db.query.warehousesTable.findFirst({
        where: eq(warehousesTable.id, data.id),
      });

      if (!existing) {
        throw new Error("Galpão não encontrado.");
      }

      await db
        .update(warehousesTable)
        .set({ name: data.name, updatedAt: new Date() })
        .where(eq(warehousesTable.id, data.id));
    } else {
      await db.insert(warehousesTable).values({
        name: data.name,
        createdBy: ctx.user.id,
      });
    }

    revalidatePath("/warehouses");
  });
