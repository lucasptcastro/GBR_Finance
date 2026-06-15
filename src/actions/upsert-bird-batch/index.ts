"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { birdBatchesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertBirdBatchSchema } from "./schema";

export const upsertBirdBatch = protectedActionClient
  .schema(upsertBirdBatchSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    if (data.id) {
      const existing = await db.query.birdBatchesTable.findFirst({
        where: eq(birdBatchesTable.id, data.id),
      });

      if (!existing) {
        throw new Error("Lote não encontrado.");
      }

      await db
        .update(birdBatchesTable)
        .set({
          name: data.name,
          quantity: data.quantity,
          intakeDate: data.intakeDate,
          ageAtIntakeMonths: data.ageAtIntakeMonths,
          updatedAt: new Date(),
        })
        .where(eq(birdBatchesTable.id, data.id));
    } else {
      await db.insert(birdBatchesTable).values({
        warehouseId: data.warehouseId,
        name: data.name,
        quantity: data.quantity,
        intakeDate: data.intakeDate,
        ageAtIntakeMonths: data.ageAtIntakeMonths,
        createdBy: ctx.user.id,
      });
    }

    revalidatePath("/warehouses");
  });
