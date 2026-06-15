import { z } from "zod";

export const upsertBirdBatchSchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid("Galpão inválido"),
  name: z.string().min(1, "Nome do lote é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  intakeDate: z.coerce.date(),
  ageAtIntakeMonths: z.coerce.number().min(0, "Idade não pode ser negativa"),
});
