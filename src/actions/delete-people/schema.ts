import { z } from "zod";

import { personCategoryEnum } from "@/db/schema";

export const deletePeopleSchema = z.object({
  ids: z.array(z.uuid()).min(1, "IDs são obrigatórios"),
  category: z.enum(personCategoryEnum.enumValues.map((category) => category)),
});

export type DeletePeopleInput = z.infer<typeof deletePeopleSchema>;
