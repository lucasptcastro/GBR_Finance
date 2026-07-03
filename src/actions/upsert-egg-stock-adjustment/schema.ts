import { z } from "zod";

export const upsertEggStockAdjustmentSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  quantity: z.number().int().refine((v) => v !== 0, {
    message: "Quantidade não pode ser zero",
  }),
  reason: z.string().trim().optional(),
  warehouseId: z.string().uuid("Galpão é obrigatório"),
});

export type UpsertEggStockAdjustmentSchema = z.infer<
  typeof upsertEggStockAdjustmentSchema
>;
