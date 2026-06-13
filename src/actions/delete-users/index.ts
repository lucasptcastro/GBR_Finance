"use server";

import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getRole } from "@/data/get-role";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteUsersSchema } from "./schema";

export const deleteUsers = protectedActionClient
  .schema(deleteUsersSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const { role } = await getRole();
    if (role?.slug !== "admin") {
      throw new Error(
        "Unauthorized: You do not have permission to perform this action.",
      );
    }

    const { ids } = data;

    if (!ids || ids.length === 0) return;

    if (ids.includes(ctx.user.id)) {
      throw new Error("Você não pode deletar seu próprio usuário");
    }

    await db.delete(userTable).where(inArray(userTable.id, ids));

    revalidatePath("/users");
  });
