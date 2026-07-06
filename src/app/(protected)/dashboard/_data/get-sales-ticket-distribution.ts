import { sql } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface SalesTicketBucket {
  label: string;
  salesCount: number;
  totalAmountInCents: number;
}

const BUCKETS = [
  { label: "Até R$50", min: 0, max: 5000 },
  { label: "R$50–100", min: 5000, max: 10000 },
  { label: "R$100–200", min: 10000, max: 20000 },
  { label: "R$200–500", min: 20000, max: 50000 },
  { label: "R$500–1k", min: 50000, max: 100000 },
  { label: "Acima R$1k", min: 100000, max: null },
];

export async function getSalesTicketDistribution(): Promise<SalesTicketBucket[]> {
  const rows = await db
    .select({
      totalAmountInCents: salesTable.totalAmountInCents,
    })
    .from(salesTable);

  return BUCKETS.map(({ label, min, max }) => {
    const filtered = rows.filter((r) => {
      const v = r.totalAmountInCents;
      return v >= min && (max === null || v < max);
    });
    return {
      label,
      salesCount: filtered.length,
      totalAmountInCents: filtered.reduce((s, r) => s + r.totalAmountInCents, 0),
    };
  });
}
