"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Circle, XCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rolesTable, userTable } from "@/db/schema";
import { getUserInitials } from "@/helpers/name-format";
import { cn } from "@/lib/utils";

import { UsersTableActions } from "./table-actions";

type User = typeof userTable.$inferSelect & {
  role: typeof rolesTable.$inferSelect | null;
};

type TableMeta = {
  roles?: (typeof rolesTable.$inferSelect)[];
};

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return (
        <input
          type="checkbox"
          aria-label="Selecionar todos usuários"
          checked={table.getIsAllRowsSelected()}
          ref={(el) => {
            if (!el) return;
            el.indeterminate = table.getIsSomeRowsSelected();
          }}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="cursor-pointer"
        />
      );
    },
    cell: ({ row }) => {
      return (
        <input
          type="checkbox"
          aria-label={`Selecionar usuário ${row.original.name}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="cursor-pointer"
        />
      );
    },
  },
  {
    id: "user",
    accessorFn: (row) => `${row.name} ${row.email}`.trim(),
    filterFn: "includesString",
    header: "Usuário",
    cell: ({ row: { original: user } }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="text-xs">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-muted-foreground text-xs">{user.email}</span>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    accessorKey: "role",
    filterFn: (row, _columnId, filterValue) => {
      if (filterValue == null || filterValue === "") return true;
      return row.original.role?.slug === String(filterValue);
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Perfil
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row: { original: user } }) => {
      const userRoleSlug = user.role?.slug;
      const userRoleName = user.role?.name;

      return (
        <Badge
          variant={"secondary"}
          className={cn("gap-1", {
            "bg-blue-500/10 text-blue-500": userRoleSlug === "admin",
            "bg-muted-foreground/10 text-muted-foreground":
              userRoleSlug !== "admin",
          })}
        >
          <Circle
            size={12}
            className={
              userRoleSlug === "admin"
                ? "fill-blue-500"
                : "fill-muted-foreground"
            }
          />
          {userRoleName}
        </Badge>
      );
    },
  },
  {
    id: "emailVerified",
    accessorKey: "emailVerified",
    filterFn: (row, _columnId, filterValue) => {
      if (filterValue == null || filterValue === "") return true;
      const want = filterValue === "true";
      return row.original.emailVerified === want;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status do E-mail
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row: { original: user } }) => (
      <Badge
        variant={user.emailVerified ? "default" : "secondary"}
        className="gap-1"
      >
        {user.emailVerified ? (
          <>
            <CheckCircle size={12} />
            Verificado
          </>
        ) : (
          <>
            <XCircle size={12} />
            Não verificado
          </>
        )}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data de Cadastro
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row: { original: user } }) =>
      new Date(user.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },

  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const selectionState = table.getState().rowSelection ?? {};
      const selectedIds = Object.keys(selectionState).filter(
        (id) => selectionState[id as unknown as string],
      );

      return (
        <UsersTableActions
          user={user}
          selectedIds={selectedIds}
          roles={(table.options.meta as TableMeta)?.roles ?? []}
        />
      );
    },
  },
];
