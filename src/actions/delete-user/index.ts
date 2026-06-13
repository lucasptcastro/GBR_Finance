"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getRole } from "@/data/get-role";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteUserSchema } from "./schema";

export const deleteUser = protectedActionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const { role } = await getRole();
    if (role?.slug !== "admin") {
      throw new Error(
        "Unauthorized: You do not have permission to perform this action.",
      );
    }

    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, data.userId),
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verifica se não está tentando deletar o próprio usuário logado
    if (user.id === ctx.user.id) {
      throw new Error("Você não pode deletar seu próprio usuário");
    }

    await db.delete(userTable).where(eq(userTable.id, data.userId));

    revalidatePath("/users");
  });
