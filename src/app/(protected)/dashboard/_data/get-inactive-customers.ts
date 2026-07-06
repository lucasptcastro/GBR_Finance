import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { peopleTable, salesTable } from "@/db/schema";

export interface InactiveCustomer {
  customerId: string;
  customerName: string;
  lastPurchaseDate: Date | null;
  totalPurchases: number;
}

export async function getInactiveCustomers(): Promise<InactiveCustomer[]> {
  const rows = await db
    .select({
      customerId: peopleTable.id,
      customerName: peopleTable.name,
      lastPurchaseDate: sql<Date | null>`MAX(${salesTable.date})`,
      totalPurchases: sql<number>`COUNT(${salesTable.id})::int`,
    })
    .from(peopleTable)
    .leftJoin(salesTable, eq(salesTable.customerId, peopleTable.id))
    .where(eq(peopleTable.category, "customer"))
    .groupBy(peopleTable.id, peopleTable.name)
    .orderBy(sql`MAX(${salesTable.date}) ASC NULLS FIRST`);

  return rows.map((row) => ({
    customerId: row.customerId,
    customerName: row.customerName,
    lastPurchaseDate: row.lastPurchaseDate,
    totalPurchases: row.totalPurchases ?? 0,
  }));
}
