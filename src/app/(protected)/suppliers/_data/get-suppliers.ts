import dayjs from "dayjs";
import { and, count, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { peopleTable } from "@/db/schema";

export const getSuppliers = async ({
  from,
  to,
}: {
  from?: string;
  to?: string;
} = {}) => {
  const parseDateInput = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(value);
  };

  if (!from || !to) {
    from = dayjs().startOf("year").format("YYYY-MM-DD");
    to = dayjs().endOf("year").format("YYYY-MM-DD");
  }

  const periodStart = dayjs(parseDateInput(from)).startOf("day").toDate();
  const periodEnd = dayjs(parseDateInput(to)).endOf("day").toDate();

  const suppliers = await db.query.peopleTable.findMany({
    where: eq(peopleTable.category, "supplier"),
    orderBy: (peopleTable, { desc }) => [desc(peopleTable.createdAt)],
  });

  const totalSuppliers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "supplier"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  const activeSuppliers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "supplier"),
          eq(peopleTable.status, "active"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  const inactiveSuppliers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "supplier"),
          eq(peopleTable.status, "inactive"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  const individualSuppliers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "supplier"),
          eq(peopleTable.type, "individual"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  const companySuppliers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "supplier"),
          eq(peopleTable.type, "company"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  return {
    suppliers,
    totalSuppliers,
    activeSuppliers,
    inactiveSuppliers,
    individualSuppliers,
    companySuppliers,
  };
};
