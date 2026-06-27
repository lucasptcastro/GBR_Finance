"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { peopleTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertPersonSchema } from "./schema";

function getRevalidatePath(category: string) {
  if (category === "customer") return "/customers";
  if (category === "supplier") return "/suppliers";
  return "/customers";
}

export const upsertPerson = protectedActionClient
  .schema(upsertPersonSchema)
  .action(async ({ parsedInput: data }) => {
    await db
      .insert(peopleTable)
      .values({
        ...data,
      })
      .onConflictDoUpdate({
        target: [peopleTable.id],
        set: {
          ...data,
        },
      });

    revalidatePath(getRevalidatePath(data.category));
  });
