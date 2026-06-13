import z from "zod";

export const upsertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email("E-mail inválido"),
  emailVerified: z.boolean().optional().default(false),
  image: z.url().optional().nullable(),
  roleId: z.string().optional(),
});

export type UpsertUserSchema = z.infer<typeof upsertUserSchema>;
