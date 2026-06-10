import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import * as schema from "../db/schema";
import { sendResetPasswordEmail, sendWelcomeEmail } from "./sendemail";

interface sendResetPasswordProps {
  user: User;
  url: string;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: sendResetPasswordProps) => {
      try {
        // Verifica se o usuário já possui uma conta com senha (credential)
        const existingAccount = await db.query.accountTable.findFirst({
          where: and(
            eq(schema.accountTable.userId, user.id),
            eq(schema.accountTable.providerId, "credential"),
          ),
        });

        if (!existingAccount) {
          // Usuário novo (criado por admin) — enviar e-mail de boas-vindas
          await sendWelcomeEmail({
            name: user.name,
            email: user.email,
            resetUrl: url,
          });
        } else {
          // Usuário existente — enviar e-mail de reset de senha
          await sendResetPasswordEmail({ user, url });
        }
      } catch (error) {
        console.error("Erro ao enviar email:", error);
        throw error;
      }
    },
  },
  user: {
    modelName: "userTable",
    additionalFields: {
      roleId: {
        type: "string",
        required: false,
        defaultValue: process.env.MEMBER_ID,
        input: false,
      },
    },
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "accountTable",
  },
  verification: {
    modelName: "verificationTable",
  },
});
