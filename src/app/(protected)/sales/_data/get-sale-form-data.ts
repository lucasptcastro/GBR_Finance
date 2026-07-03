import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bankAccountsTable,
  peopleTable,
  warehousesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSaleFormData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autenticado");

  const [customers, warehouses, bankAccounts] = await Promise.all([
    db.query.peopleTable.findMany({
      where: eq(peopleTable.category, "customer"),
      columns: { id: true, name: true, nickname: true },
      orderBy: (t, { asc }) => [asc(t.name)],
    }),
    db.query.warehousesTable.findMany({
      columns: { id: true, name: true },
      orderBy: (t, { asc }) => [asc(t.name)],
    }),
    db.query.bankAccountsTable.findMany({
      where: eq(bankAccountsTable.userId, session.user.id),
      columns: { id: true, name: true, color: true },
      orderBy: (t, { asc }) => [asc(t.name)],
    }),
  ]);

  return { customers, warehouses, bankAccounts };
}
