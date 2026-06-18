"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { eggProductionTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertEggProductionSchema } from "./schema";

export const upsertEggProduction = protectedActionClient
  .schema(upsertEggProductionSchema)
  .action(async ({ parsedInput: data }) => {
    if (data.id) {
      const existing = await db.query.eggProductionTable.findFirst({
        where: eq(eggProductionTable.id, data.id),
      });

      if (!existing) {
        throw new Error("Registro de produção não encontrado.");
      }

      await db
        .update(eggProductionTable)
        .set({
          traysProduced: data.traysProduced,
          eggsLeftover: data.eggsLeftover,
          crackedEggs: data.crackedEggs,
          feedUsed: data.feedUsed,
          deadBirds: data.deadBirds,
          updatedAt: new Date(),
        })
        .where(eq(eggProductionTable.id, data.id));
    } else {
      await db.insert(eggProductionTable).values({
        date: data.date,
        traysProduced: data.traysProduced,
        eggsLeftover: data.eggsLeftover,
        crackedEggs: data.crackedEggs,
        feedUsed: data.feedUsed,
        deadBirds: data.deadBirds,
        warehouseId: data.warehouseId,
      });
    }

    revalidatePath("/production");
    revalidatePath("/warehouses");
  });
