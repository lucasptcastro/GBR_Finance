import z from "zod";

export const deleteUserSchema = z.object({
  userId: z.string(),
});

export type DeleteUserSchema = z.infer<typeof deleteUserSchema>;
