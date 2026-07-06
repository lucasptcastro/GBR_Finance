import { sql } from "drizzle-orm";

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

export async function getSalesByDayOfWeek(): Promise<SalesByDayOfWeek[]> {
  const rows = await db
    .select({
      dayIndex: sql<number>`EXTRACT(DOW FROM ${salesTable.date})::int`,
      totalAmountInCents: sql<number>`sum(${salesTable.totalAmountInCents})::bigint`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .groupBy(sql`EXTRACT(DOW FROM ${salesTable.date})`)
    .orderBy(sql`EXTRACT(DOW FROM ${salesTable.date})`);

  const resultMap = new Map(
    rows.map((r) => [r.dayIndex, r]),
  );

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
