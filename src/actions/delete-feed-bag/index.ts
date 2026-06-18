"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { feedBagsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteFeedBagSchema } from "./schema";

export const deleteFeedBag = protectedActionClient
  .schema(deleteFeedBagSchema)
  .action(async ({ parsedInput: data }) => {
    const existing = await db.query.feedBagsTable.findFirst({
      where: eq(feedBagsTable.id, data.id),
    });

    if (!existing) {
      throw new Error("Registro de ração não encontrado.");
    }

    await db.delete(feedBagsTable).where(eq(feedBagsTable.id, data.id));

    revalidatePath("/warehouses");
    revalidatePath("/production");
  });
