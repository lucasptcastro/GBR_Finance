"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { eggStockAdjustmentsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertEggStockAdjustmentSchema } from "./schema";

export const upsertEggStockAdjustment = protectedActionClient
  .schema(upsertEggStockAdjustmentSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const adjustmentDate = new Date(data.date + "T00:00:00");

    await db
      .insert(eggStockAdjustmentsTable)
      .values({
        ...data,
        date: adjustmentDate,
        createdBy: ctx.user.id,
      })
      .onConflictDoUpdate({
        target: [eggStockAdjustmentsTable.id],
        set: {
          date: adjustmentDate,
          quantity: data.quantity,
          reason: data.reason,
          warehouseId: data.warehouseId,
        },
      });

    revalidatePath("/warehouses");
  });
