import { desc } from "drizzle-orm";

import { db } from "@/db";
import { eggProductionTable } from "@/db/schema";

export type EggProductionDisplayRow = {
  id?: string;
  date: Date;
  traysProduced: number;
  eggsLeftover: number;
  crackedEggs: number;
  feedUsed: number;
  deadBirds: number;
};

function toDate(value: Date | string): Date {
  if (typeof value === "string") {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

/** month = "YYYY-MM". Falls back to current month if omitted. */
export async function getEggProduction(month?: string) {
  const dbRecords = await db
    .select()
    .from(eggProductionTable)
    .orderBy(desc(eggProductionTable.date));

  const now = new Date();
  let targetYear: number;
  let targetMonth: number; // 0-indexed

  if (month) {
    const [y, m] = month.split("-").map(Number);
    targetYear = y;
    targetMonth = m - 1;
  } else {
    targetYear = now.getFullYear();
    targetMonth = now.getMonth();
  }

  // Index existing records for the target month by date key "YYYY-MM-DD"
  const recordsByDate = new Map<string, (typeof dbRecords)[0]>();
  for (const r of dbRecords) {
    const d = toDate(r.date);
    if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
      const key = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      recordsByDate.set(key, r);
    }
  }

  // Generate a row for every day of the target month
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetMonthRows: EggProductionDisplayRow[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const existing = recordsByDate.get(key);

    if (existing) {
      targetMonthRows.push({
        id: existing.id,
        date: toDate(existing.date),
        traysProduced: existing.traysProduced,
        eggsLeftover: existing.eggsLeftover,
        crackedEggs: existing.crackedEggs,
        feedUsed: existing.feedUsed,
        deadBirds: existing.deadBirds,
      });
    } else {
      targetMonthRows.push({
        date: new Date(targetYear, targetMonth, day),
        traysProduced: 0,
        eggsLeftover: 0,
        crackedEggs: 0,
        feedUsed: 0,
        deadBirds: 0,
      });
    }
  }

  // Sort descending (most recent day first)
  targetMonthRows.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Summary: only real (persisted) records of the target month
  const realRows = targetMonthRows.filter((r) => r.id);

  const totalTraysThisMonth = realRows.reduce(
    (sum, r) => sum + r.traysProduced,
    0,
  );
  const totalEggsLeftoverThisMonth = realRows.reduce(
    (sum, r) => sum + r.eggsLeftover,
    0,
  );
  const totalCrackedEggsThisMonth = realRows.reduce(
    (sum, r) => sum + r.crackedEggs,
    0,
  );
  const totalFeedUsedThisMonth = realRows.reduce(
    (sum, r) => sum + r.feedUsed,
    0,
  );
  const totalDeadBirdsThisMonth = realRows.reduce(
    (sum, r) => sum + r.deadBirds,
    0,
  );

  return {
    records: targetMonthRows,
    totalTraysThisMonth,
    totalEggsLeftoverThisMonth,
    totalCrackedEggsThisMonth,
    totalFeedUsedThisMonth,
    totalDeadBirdsThisMonth,
  };
}
