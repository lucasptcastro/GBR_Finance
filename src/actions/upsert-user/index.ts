"use server";

import { and, eq, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { getRole } from "@/data/get-role";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertUserSchema } from "./schema";

export const upsertUser = protectedActionClient
  .schema(upsertUserSchema)
  .action(async ({ parsedInput: data }) => {
    const { role } = await getRole();
    if (role?.slug !== "admin") {
      throw new Error(
        "Unauthorized: You do not have permission to perform this action.",
      );
    }

    if (data.id) {
      // Atualizar usuário existente
      const existingUser = await db.query.userTable.findFirst({
        where: eq(userTable.id, data.id),
      });

      if (!existingUser) {
        throw new Error("Usuário não encontrado");
      }

      // Verificar se o email já está sendo usado por outro usuário
      const emailExists = await db.query.userTable.findFirst({
        where: and(eq(userTable.email, data.email), ne(userTable.id, data.id)),
      });

      if (emailExists) {
        throw new Error("Este e-mail já está sendo usado por outro usuário");
      }

      await db
        .update(userTable)
        .set({
          name: data.name,
          email: data.email,
          emailVerified: false,
          image: data.image,
          updatedAt: new Date(),
          roleId: data.roleId,
        })
        .where(eq(userTable.id, data.id));
    } else {
      // Criar novo usuário
      const emailExists = await db.query.userTable.findFirst({
        where: eq(userTable.email, data.email),
      });

      if (emailExists) {
        throw new Error("Este e-mail já está sendo usado");
      }

      await db.insert(userTable).values({
        id: nanoid(),
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified ?? false,
        image: data.image,
        roleId: data.roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Disparar fluxo de reset de senha para que o usuário defina sua senha
      // O callback sendResetPassword detecta que é um usuário novo e envia o e-mail de boas-vindas
      const baseUrl =
        process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

      await auth.api.requestPasswordReset({
        body: {
          email: data.email,
          redirectTo: `${baseUrl}/reset-password`,
        },
      });
    }

    revalidatePath("/users");
  });
