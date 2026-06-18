import { z } from "zod";

export const deleteFeedBagSchema = z.object({
  id: z.string().uuid(),
});
