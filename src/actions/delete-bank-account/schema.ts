import z from "zod";

export const deleteBankAccountSchema = z.object({
  bankAccountId: z.uuid(),
});

export type DeleteBankAccountSchema = z.infer<typeof deleteBankAccountSchema>;
