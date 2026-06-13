import { count } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { rolesTable, userTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getUsers = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const users = await db.query.userTable.findMany({
    with: {
      role: true,
    },
    orderBy: (userTable, { desc }) => [desc(userTable.createdAt)],
  });

  const totalUsers = (
    await db
      .select({
        count: count(),
      })
      .from(userTable)
  )[0].count;

  const totalAdmins = users.filter(
    (user) => user.role?.slug === "admin",
  ).length;

  const totalMembers = users.filter((user) => {
    const roleSlug = user.role?.slug ?? "member";
    return roleSlug === "member";
  }).length;

  const roles = await db.select().from(rolesTable);

  return {
    users,
    roles,
    totalUsers,
    totalAdmins,
    totalMembers,
  };
};
