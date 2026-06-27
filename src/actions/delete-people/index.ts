"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { peopleTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deletePeopleSchema } from "./schema";

function getRevalidatePath(category: string) {
  if (category === "customer") return "/customers";
  if (category === "supplier") return "/suppliers";
  return "/customers";
}

export const deletePeople = protectedActionClient
  .schema(deletePeopleSchema)
  .action(async ({ parsedInput: data }) => {
    const people = await db.query.peopleTable.findMany({
      where: and(
        inArray(peopleTable.id, data.ids),
        eq(peopleTable.category, data.category),
      ),
      columns: {
        id: true,
      },
    });

    const allowedIds = people.map((person) => person.id);

    if (allowedIds.length === 0) {
      throw new Error("Nenhuma pessoa encontrada para exclusão.");
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(peopleTable)
        .where(
          and(
            inArray(peopleTable.id, data.ids),
            eq(peopleTable.category, data.category),
          ),
        );
    });

    const pathToRevalidate = getRevalidatePath(data.category);
    revalidatePath(pathToRevalidate);
  });
