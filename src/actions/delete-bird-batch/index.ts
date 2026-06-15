"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { birdBatchesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteBirdBatchSchema } from "./schema";

export const deleteBirdBatch = protectedActionClient
  .schema(deleteBirdBatchSchema)
  .action(async ({ parsedInput: data }) => {
    const existing = await db.query.birdBatchesTable.findFirst({
      where: eq(birdBatchesTable.id, data.id),
    });

    if (!existing) {
      throw new Error("Lote não encontrado.");
    }

    await db
      .delete(birdBatchesTable)
      .where(eq(birdBatchesTable.id, data.id));

    revalidatePath("/warehouses");
  });
