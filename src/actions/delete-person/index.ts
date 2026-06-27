"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { peopleTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deletePersonSchema } from "./schema";

function getRevalidatePath(category: string) {
  if (category === "customer") return "/customers";
  if (category === "supplier") return "/suppliers";
  return "/customers";
}

export const deletePerson = protectedActionClient
  .schema(deletePersonSchema)
  .action(async ({ parsedInput: data }) => {
    const person = await db.query.peopleTable.findFirst({
      where: eq(peopleTable.id, data.id),
    });

    if (!person) {
      throw new Error("Pessoa não encontrada");
    }

    if (person.category !== data.category) {
      throw new Error("Pessoa não encontrada");
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(peopleTable)
        .where(
          and(
            eq(peopleTable.id, data.id),
            eq(peopleTable.category, data.category),
          ),
        );
    });

    revalidatePath(getRevalidatePath(data.category));
  });
