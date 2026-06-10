import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { userTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getRole = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, session.user.id),
    with: {
      role: true,
    },
  });

  return {
    role: user?.role ?? null,
  };
};
