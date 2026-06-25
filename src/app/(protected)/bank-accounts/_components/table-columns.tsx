"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bankAccountsTable } from "@/db/schema";

import { BankAccountColorBadge } from "./color-badge";
import { BankAccountsTableActions } from "./table-actions";

type BankAccount = typeof bankAccountsTable.$inferSelect;

export const bankAccountColumns: ColumnDef<BankAccount>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return (
        <input
          type="checkbox"
          aria-label="Selecionar todas contas bancárias"
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
          aria-label={`Selecionar conta bancária ${row.original.name}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="cursor-pointer"
        />
      );
    },
  },
  {
    id: "name",
    accessorKey: "name",
    filterFn: "includesString",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome do Banco
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    id: "color",
    accessorKey: "color",
    filterFn: "includesString",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cor
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <BankAccountColorBadge color={row.getValue("color")} />
      </div>
    ),
  },
  {
    id: "dueDay",
    accessorKey: "dueDay",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dia de Vencimento
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row: { original: bankAccount } }) => {
      return bankAccount.dueDay
        ? new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            bankAccount.dueDay,
          ).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const bankAccount = row.original;
      const selectionState = table.getState().rowSelection ?? {};
      const selectedIds = Object.keys(selectionState).filter(
        (id) => selectionState[id as unknown as string],
      );

      return (
        <BankAccountsTableActions
          bankAccount={bankAccount}
          selectedIds={selectedIds}
        />
      );
    },
  },
];
