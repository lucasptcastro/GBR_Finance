import { z } from "zod";

export const upsertBankAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Nome é obrigatório"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  dueDay: z.number().int().min(1).max(28).optional(),
});

export type UpsertBankAccountSchema = z.infer<typeof upsertBankAccountSchema>;
