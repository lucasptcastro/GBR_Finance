"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { bankAccountsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { upsertBankAccountSchema } from "./schema";

export const upsertBankAccount = protectedActionClient
  .schema(upsertBankAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .insert(bankAccountsTable)
      .values({
        ...parsedInput,
        userId: ctx.user.id,
      })
      .onConflictDoUpdate({
        target: [bankAccountsTable.id],
        set: {
          ...parsedInput,
          userId: ctx.user.id,
        },
      });

    revalidatePath("/bank-accounts");
  });
