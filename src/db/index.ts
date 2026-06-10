import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema, // seta qual schema usar (ajuda na tipagem das tabelas)
});
