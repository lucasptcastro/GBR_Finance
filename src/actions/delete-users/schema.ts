import { z } from "zod";

export const deleteUsersSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type DeleteUsersSchema = z.infer<typeof deleteUsersSchema>;
