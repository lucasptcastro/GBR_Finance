import { z } from "zod";

export const deleteSaleSchema = z.object({
  saleId: z.string().uuid(),
});

export type DeleteSaleSchema = z.infer<typeof deleteSaleSchema>;
