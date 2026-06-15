import { z } from "zod";

export const deleteBirdBatchSchema = z.object({
  id: z.string().uuid(),
});
