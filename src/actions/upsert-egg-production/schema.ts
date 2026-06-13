import { z } from "zod";

export const upsertEggProductionSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.date(),
  traysProduced: z.number().int().min(0),
  eggsLeftover: z.number().int().min(0),
  crackedEggs: z.number().int().min(0),
  feedUsed: z.number().int().min(0),
  deadBirds: z.number().int().min(0),
});
