import { z } from "zod";

import { personSexEnum, personTypeEnum } from "@/db/schema";

export const upsertPersonSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  nickname: z.string().trim().optional(),
  category: z.enum(["customer", "supplier"], {
    message: "A categoria é obrigatória.",
  }),
  type: z.enum(personTypeEnum.enumValues, {
    message: "O tipo é obrigatório.",
  }),
  sex: z.enum(personSexEnum.enumValues).default("male").optional(),
  isPcd: z.boolean().default(false).optional(),
  birthDate: z.coerce.date().optional(),
  rg: z.string().trim().optional(),
  stateRegistration: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  mobile: z.string().trim().min(1, {
    message: "O celular é obrigatório.",
  }),
  cpf: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  zipCode: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  reference: z.string().trim().optional(),
  observation: z
    .string()
    .trim()
    .max(2000, {
      message: "A observação deve ter no máximo 2000 caracteres.",
    })
    .optional(),
});
