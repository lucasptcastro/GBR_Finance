import { z } from "zod";

export const upsertFeedBagSchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid("Galpão inválido"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  date: z.coerce.date(),
});
