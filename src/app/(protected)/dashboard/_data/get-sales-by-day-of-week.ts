import { and, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface SalesByDayOfWeek {
  dayIndex: number;
  dayLabel: string;
  totalAmountInCents: number;
  salesCount: number;
}

const DAY_LABELS: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

const parseDate = (str: string | undefined): Date | undefined => {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
};

export async function getSalesByDayOfWeek(
  from?: string,
  to?: string,
): Promise<SalesByDayOfWeek[]> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const rows = await db
    .select({
      dayIndex: sql<number>`EXTRACT(DOW FROM ${salesTable.date})::int`,
      totalAmountInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .where(
      and(
        fromDate ? gte(salesTable.date, fromDate) : undefined,
        toDate ? lte(salesTable.date, toDate) : undefined,
      ),
    )
    .groupBy(sql`EXTRACT(DOW FROM ${salesTable.date})`)
    .orderBy(sql`EXTRACT(DOW FROM ${salesTable.date})`);

  const resultMap = new Map(rows.map((r) => [r.dayIndex, r]));

  return Array.from({ length: 7 }, (_, i) => {
    const row = resultMap.get(i);
    return {
      dayIndex: i,
      dayLabel: DAY_LABELS[i] ?? String(i),
      totalAmountInCents: Number(row?.totalAmountInCents ?? 0),
      salesCount: row?.salesCount ?? 0,
    };
  });
}
