"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { bankAccountsTable, salesTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { deleteSaleSchema } from "./schema";

export const deleteSale = protectedActionClient
  .schema(deleteSaleSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const sale = await db.query.salesTable.findFirst({
      where: eq(salesTable.id, data.saleId),
      with: { payments: true },
    });

    if (!sale) throw new Error("Venda não encontrada");

    // Reverte o saldo bancário conforme pagamentos realizados
    if (sale.paymentMethod !== "crediary") {
      // Pagamento imediato: reverte o valor total da conta bancária
      if (sale.bankAccountId) {
        await db
          .update(bankAccountsTable)
          .set({
            currentBalanceInCents: sql`${bankAccountsTable.currentBalanceInCents} - ${sale.totalAmountInCents}`,
          })
          .where(eq(bankAccountsTable.id, sale.bankAccountId));
      }
    } else {
      // Crediário: reverte pagamentos parciais já registrados
      for (const payment of sale.payments) {
        if (payment.bankAccountId) {
          await db
            .update(bankAccountsTable)
            .set({
              currentBalanceInCents: sql`${bankAccountsTable.currentBalanceInCents} - ${payment.amountInCents}`,
            })
            .where(eq(bankAccountsTable.id, payment.bankAccountId));
        }
      }
    }

    // Deleta a venda (cascade remove os pagamentos)
    await db.delete(salesTable).where(eq(salesTable.id, data.saleId));

    revalidatePath("/sales");
    revalidatePath("/warehouses");
    revalidatePath("/bank-accounts");
    revalidatePath("/customers-credit");
  });
