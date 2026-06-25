"use client";

import { useMemo } from "react";

import { bankAccountsTable } from "@/db/schema";

import {
  DataTable,
  type DataTableFilterField,
} from "../../_components/data-table";
import { bankAccountColumns } from "./table-columns";

export type BankAccountWithBalance = typeof bankAccountsTable.$inferSelect & {
  computedBalanceInCents: number;
};

interface BankAccountsTableProps {
  bankAccounts: BankAccountWithBalance[];
}

export function BankAccountsTable({ bankAccounts }: BankAccountsTableProps) {
  const filterFields = useMemo<DataTableFilterField[]>(
    () => [
      {
        columnId: "name",
        label: "Nome do banco",
        type: "text",
        placeholder: "Contém…",
      },
      {
        columnId: "color",
        label: "Cor (hex)",
        type: "text",
        placeholder: "Ex.: #3b82f6",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={bankAccountColumns}
      data={bankAccounts}
      filterFields={filterFields}
    />
  );
}
