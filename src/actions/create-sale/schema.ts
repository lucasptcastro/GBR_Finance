import { z } from "zod";

export const createSaleSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  traysSold: z.number().int().min(1, "Quantidade deve ser maior que zero"),
  pricePerTrayInCents: z
    .number()
    .int()
    .min(1, "Preço deve ser maior que zero"),
  paymentMethod: z.enum([
    "pix",
    "credit_card",
    "debit_card",
    "bank_slip",
    "crediary",
  ]),
  notes: z.string().trim().optional(),
  customerId: z.string().uuid("Cliente é obrigatório"),
  warehouseId: z.string().uuid("Galpão é obrigatório"),
  bankAccountId: z.string().uuid().optional(),
});

export type CreateSaleSchema = z.infer<typeof createSaleSchema>;
