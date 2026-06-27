import dayjs from "dayjs";
import { and, count, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { peopleTable } from "@/db/schema";

export const getCustomers = async ({
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

  const customers = await db.query.peopleTable.findMany({
    where: eq(peopleTable.category, "customer"),
    orderBy: (peopleTable, { desc }) => [desc(peopleTable.createdAt)],
  });

  // Query para buscar a quantidade total de clientes
  const totalCustomers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "customer"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  // Query para buscar clientes ativos
  const activeCustomers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "customer"),
          eq(peopleTable.status, "active"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  // Query para buscar clientes inativos
  const inactiveCustomers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "customer"),
          eq(peopleTable.status, "inactive"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  // Query para buscar pessoas físicas
  const individualCustomers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "customer"),
          eq(peopleTable.type, "individual"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  // Query para buscar pessoas jurídicas
  const companyCustomers = (
    await db
      .select({
        count: count(),
      })
      .from(peopleTable)
      .where(
        and(
          eq(peopleTable.category, "customer"),
          eq(peopleTable.type, "company"),
          gte(peopleTable.createdAt, periodStart),
          lte(peopleTable.createdAt, periodEnd),
        ),
      )
  )[0].count;

  return {
    customers,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    individualCustomers,
    companyCustomers,
  };
};
