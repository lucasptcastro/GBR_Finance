import { z } from "zod";

export const upsertWarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome do galpão é obrigatório"),
});
