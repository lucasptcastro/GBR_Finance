"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  bankAccountsTable,
  salePaymentsTable,
  salesTable,
} from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { addSalePaymentSchema } from "./schema";

export const addSalePayment = protectedActionClient
  .schema(addSalePaymentSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    const sale = await db.query.salesTable.findFirst({
      where: eq(salesTable.id, data.saleId),
      with: { payments: true },
    });

    if (!sale) throw new Error("Venda não encontrada");

    const paymentDate = new Date(data.paymentDate + "T00:00:00");

    // Registra o pagamento
    await db.insert(salePaymentsTable).values({
      saleId: data.saleId,
      amountInCents: data.amountInCents,
      paymentDate,
      paymentMethod: data.paymentMethod,
      bankAccountId: data.bankAccountId,
      notes: data.notes,
      createdBy: ctx.user.id,
    });

    // Calcula total pago incluindo o novo pagamento
    const previouslyPaid = sale.payments.reduce(
      (acc, p) => acc + p.amountInCents,
      0,
    );
    const totalPaid = previouslyPaid + data.amountInCents;

    // Determina novo status
    let newStatus: "pending" | "partially_paid" | "paid";
    if (totalPaid >= sale.totalAmountInCents) {
      newStatus = "paid";
    } else {
      newStatus = "partially_paid";
    }

    await db
      .update(salesTable)
      .set({ status: newStatus })
      .where(eq(salesTable.id, data.saleId));

    // Atualiza saldo da conta bancária
    await db
      .update(bankAccountsTable)
      .set({
        currentBalanceInCents: sql`${bankAccountsTable.currentBalanceInCents} + ${data.amountInCents}`,
      })
      .where(eq(bankAccountsTable.id, data.bankAccountId));

    revalidatePath("/sales");
    revalidatePath("/customers-credit");
    revalidatePath("/bank-accounts");
  });
