"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { bankAccountsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteBankAccountSchema } from "./schema";

export const deleteBankAccount = protectedActionClient
  .schema(deleteBankAccountSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const bankAccount = await db.query.bankAccountsTable.findFirst({
      where: eq(bankAccountsTable.id, data.bankAccountId),
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    // verifica se a conta pertence ao usuário logado
    const bankAccountDoesNotBelongToUser = bankAccount.userId !== ctx.user.id;

    if (bankAccountDoesNotBelongToUser) {
      throw new Error("Unauthorized");
    }

    await db
      .delete(bankAccountsTable)
      .where(
        and(
          eq(bankAccountsTable.id, data.bankAccountId),
          eq(bankAccountsTable.userId, ctx.user.id),
        ),
      );

    revalidatePath("/bank-accounts");
  });
