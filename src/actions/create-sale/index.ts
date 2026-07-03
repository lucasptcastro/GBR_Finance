"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { bankAccountsTable, salesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { createSaleSchema } from "./schema";

export const createSale = protectedActionClient
  .schema(createSaleSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const totalAmountInCents = data.traysSold * data.pricePerTrayInCents;
    const isCrediary = data.paymentMethod === "crediary";

    // Gera número sequencial de nota fiscal por usuário
    const lastSale = await db.query.salesTable.findFirst({
      where: eq(salesTable.createdBy, ctx.user.id),
      orderBy: (table, { desc }) => [desc(table.invoiceNumber)],
    });

    const invoiceNumber = (lastSale?.invoiceNumber ?? 0) + 1;

    const saleDate = new Date(data.date + "T00:00:00");

    await db.insert(salesTable).values({
      invoiceNumber,
      date: saleDate,
      traysSold: data.traysSold,
      pricePerTrayInCents: data.pricePerTrayInCents,
      totalAmountInCents,
      paymentMethod: data.paymentMethod,
      status: isCrediary ? "pending" : "paid",
      notes: data.notes,
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      bankAccountId: data.bankAccountId,
      createdBy: ctx.user.id,
    });

    // Atualiza saldo da conta bancária apenas para pagamentos imediatos
    if (!isCrediary && data.bankAccountId) {
      await db
        .update(bankAccountsTable)
        .set({
          currentBalanceInCents: sql`${bankAccountsTable.currentBalanceInCents} + ${totalAmountInCents}`,
        })
        .where(eq(bankAccountsTable.id, data.bankAccountId));
    }

    revalidatePath("/sales");
    revalidatePath("/warehouses");
    revalidatePath("/bank-accounts");
    revalidatePath("/customers-credit");
  });
