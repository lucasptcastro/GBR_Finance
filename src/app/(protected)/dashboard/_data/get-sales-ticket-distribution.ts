import { and, gte, lte } from "drizzle-orm";

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

const parseDate = (str: string | undefined): Date | undefined => {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
};

export async function getSalesTicketDistribution(
  from?: string,
  to?: string,
): Promise<SalesTicketBucket[]> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const rows = await db
    .select({ totalAmountInCents: salesTable.totalAmountInCents })
    .from(salesTable)
    .where(
      and(
        fromDate ? gte(salesTable.date, fromDate) : undefined,
        toDate ? lte(salesTable.date, toDate) : undefined,
      ),
    );

  return BUCKETS.map(({ label, min, max }) => {
    const filtered = rows.filter((r) => {
      const v = r.totalAmountInCents;
      return v >= min && (max === null || v < max);
    });
    return {
      label,
      salesCount: filtered.length,
      totalAmountInCents: filtered.reduce(
        (s, r) => s + r.totalAmountInCents,
        0,
      ),
    };
  });
}
