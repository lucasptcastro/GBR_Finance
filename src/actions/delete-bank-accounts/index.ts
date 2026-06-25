"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { bankAccountsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteBankAccountsSchema } from "./schema";

export const deleteBankAccounts = protectedActionClient
  .schema(deleteBankAccountsSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const { ids } = data;

    if (!ids || ids.length === 0) return;

    await db
      .delete(bankAccountsTable)
      .where(
        and(
          inArray(bankAccountsTable.id, ids),
          eq(bankAccountsTable.userId, ctx.user.id),
        ),
      );

    revalidatePath("/bank-accounts");
  });
