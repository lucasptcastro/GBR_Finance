"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { peopleTable } from "@/db/schema";

import { CustomerStatusBadge } from "./status-badge";
import { CustomersTableActions } from "./table-actions";
import { CustomerTypeBadge } from "./type-badge";

type CustomerRow = typeof peopleTable.$inferSelect;

const selectColumn: ColumnDef<CustomerRow> = {
  id: "select",
  header: ({ table }) => {
    return (
      <input
        type="checkbox"
        aria-label="Selecionar todos clientes"
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
        aria-label={`Selecionar cliente ${row.original.name}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="cursor-pointer"
      />
    );
  },
};

const baseCustomerColumns: ColumnDef<CustomerRow>[] = [
  selectColumn,
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    id: "nickname",
    accessorKey: "nickname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apelido
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("nickname")}</div>,
  },
  {
    id: "type",
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row: { original: customer } }) => (
      <CustomerTypeBadge type={customer.type} />
    ),
  },
  {
    id: "document",
    accessorKey: "cpf",
    header: "Documento",
    cell: ({ row: { original: customer } }) => (
      <div>{customer.type === "individual" ? customer.cpf : customer.cnpj}</div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email") || "—"}</div>,
  },
  {
    id: "mobile",
    accessorKey: "mobile",
    header: "Celular",
    cell: ({ row }) => <div>{row.getValue("mobile") || "—"}</div>,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row: { original: customer } }) => (
      <CustomerStatusBadge status={customer.status} />
    ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row, table }) => {
      const customer = row.original;
      const selectionState = table.getState().rowSelection ?? {};
      const selectedIds = Object.keys(selectionState).filter(
        (id) => selectionState[id as unknown as string],
      );

      return (
        <CustomersTableActions customer={customer} selectedIds={selectedIds} />
      );
    },
  },
];

export const customerColumns = baseCustomerColumns;
