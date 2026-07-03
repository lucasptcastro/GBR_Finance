import { z } from "zod";

export const addSalePaymentSchema = z.object({
  saleId: z.string().uuid("Venda é obrigatória"),
  amountInCents: z
    .number()
    .int()
    .min(1, "Valor deve ser maior que zero"),
  paymentDate: z.string().min(1, "Data é obrigatória"),
  paymentMethod: z.enum(["pix", "credit_card", "debit_card", "bank_slip"]),
  bankAccountId: z.string().uuid("Conta bancária é obrigatória"),
  notes: z.string().trim().optional(),
});

export type AddSalePaymentSchema = z.infer<typeof addSalePaymentSchema>;
