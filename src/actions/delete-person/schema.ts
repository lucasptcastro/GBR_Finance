import { z } from "zod";

import { personCategoryEnum } from "@/db/schema";

export const deletePersonSchema = z.object({
  id: z.uuid(),
  category: z.enum(personCategoryEnum.enumValues.map((category) => category)),
});
