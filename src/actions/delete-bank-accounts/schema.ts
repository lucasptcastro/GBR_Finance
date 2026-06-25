import { z } from "zod";

export const deleteBankAccountsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type DeleteBankAccountsSchema = z.infer<typeof deleteBankAccountsSchema>;
