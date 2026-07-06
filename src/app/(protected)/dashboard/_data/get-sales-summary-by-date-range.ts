import { and, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { salesTable } from "@/db/schema";

export interface SalesPeriodSummary {
  totalAmountInCents: number;
  salesCount: number;
  averageTicketInCents: number;
}

export interface SalesSummary {
  current: SalesPeriodSummary;
  previous: SalesPeriodSummary;
}

function buildPeriodQuery(from: Date, to: Date) {
  return db
    .select({
      totalAmountInCents: sql<number>`coalesce(sum(${salesTable.totalAmountInCents}), 0)::bigint`,
      salesCount: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .where(and(gte(salesTable.date, from), lte(salesTable.date, to)));
}

export async function getSalesSummaryByDateRange(
  salesFrom?: string,
  salesTo?: string,
  salesCompareFrom?: string,
  salesCompareTo?: string,
): Promise<SalesSummary> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const parseDate = (str: string | undefined, fallback: Date): Date => {
    if (!str) return fallback;
    const d = new Date(str + "T00:00:00");
    return isNaN(d.getTime()) ? fallback : d;
  };

  const currentFrom = parseDate(salesFrom, currentMonthStart);
  const currentTo = parseDate(salesTo, currentMonthEnd);
  const compareFrom = parseDate(salesCompareFrom, prevMonthStart);
  const compareTo = parseDate(salesCompareTo, prevMonthEnd);

  const [[currentRow], [previousRow]] = await Promise.all([
    buildPeriodQuery(currentFrom, currentTo),
    buildPeriodQuery(compareFrom, compareTo),
  ]);

  const currentCount = currentRow?.salesCount ?? 0;
  const previousCount = previousRow?.salesCount ?? 0;
  const currentTotal = Number(currentRow?.totalAmountInCents ?? 0);
  const previousTotal = Number(previousRow?.totalAmountInCents ?? 0);

  return {
    current: {
      totalAmountInCents: currentTotal,
      salesCount: currentCount,
      averageTicketInCents: currentCount > 0 ? Math.round(currentTotal / currentCount) : 0,
    },
    previous: {
      totalAmountInCents: previousTotal,
      salesCount: previousCount,
      averageTicketInCents: previousCount > 0 ? Math.round(previousTotal / previousCount) : 0,
    },
  };
}
