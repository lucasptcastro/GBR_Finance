"use client";

import { useMemo } from "react";

import { rolesTable, userTable } from "@/db/schema";

import {
  DataTable,
  type DataTableFilterField,
} from "@/app/(protected)/_components/data-table";
import { userColumns } from "./table-columns";

export type UserTableRow = typeof userTable.$inferSelect & {
  role: typeof rolesTable.$inferSelect | null;
};

interface UsersTableProps {
  users: UserTableRow[];
  roles: (typeof rolesTable.$inferSelect)[];
}

export function UsersTable({ users, roles }: UsersTableProps) {
  const filterFields = useMemo<DataTableFilterField[]>(
    () => [
      {
        columnId: "user",
        label: "Nome ou e-mail",
        type: "text",
        placeholder: "Contém…",
      },
      {
        columnId: "role",
        label: "Perfil",
        type: "select",
        options: roles.map((r) => ({ value: r.slug, label: r.name })),
        allLabel: "Todos",
      },
      {
        columnId: "emailVerified",
        label: "E-mail verificado",
        type: "select",
        options: [
          { value: "true", label: "Verificado" },
          { value: "false", label: "Não verificado" },
        ],
        allLabel: "Todos",
      },
    ],
    [roles],
  );

  return (
    <DataTable
      columns={userColumns}
      data={users}
      meta={{ roles }}
      filterFields={filterFields}
    />
  );
}
