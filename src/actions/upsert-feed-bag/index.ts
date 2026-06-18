"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { feedBagsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertFeedBagSchema } from "./schema";

export const upsertFeedBag = protectedActionClient
  .schema(upsertFeedBagSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    if (data.id) {
      const existing = await db.query.feedBagsTable.findFirst({
        where: eq(feedBagsTable.id, data.id),
      });

      if (!existing) {
        throw new Error("Registro de ração não encontrado.");
      }

      await db
        .update(feedBagsTable)
        .set({
          quantity: data.quantity,
          date: data.date,
          updatedAt: new Date(),
        })
        .where(eq(feedBagsTable.id, data.id));
    } else {
      await db.insert(feedBagsTable).values({
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        date: data.date,
        createdBy: ctx.user.id,
      });
    }

    revalidatePath("/warehouses");
    revalidatePath("/production");
  });
