import { z } from "zod";

export const deleteWarehouseSchema = z.object({
  id: z.string().uuid(),
});
