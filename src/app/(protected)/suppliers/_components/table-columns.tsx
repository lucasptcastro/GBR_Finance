"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { peopleTable } from "@/db/schema";

import { SupplierStatusBadge } from "./status-badge";
import { SuppliersTableActions } from "./table-actions";
import { SupplierTypeBadge } from "./type-badge";

type SupplierRow = typeof peopleTable.$inferSelect;

const selectColumn: ColumnDef<SupplierRow> = {
  id: "select",
  header: ({ table }) => {
    return (
      <input
        type="checkbox"
        aria-label="Selecionar todos fornecedores"
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
        aria-label={`Selecionar fornecedor ${row.original.name}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="cursor-pointer"
      />
    );
  },
};

const baseSupplierColumns: ColumnDef<SupplierRow>[] = [
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
    cell: ({ row: { original: supplier } }) => (
      <SupplierTypeBadge type={supplier.type} />
    ),
  },
  {
    id: "document",
    accessorKey: "cpf",
    header: "Documento",
    cell: ({ row: { original: supplier } }) => (
      <div>{supplier.type === "individual" ? supplier.cpf : supplier.cnpj}</div>
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
    cell: ({ row: { original: supplier } }) => (
      <SupplierStatusBadge status={supplier.status} />
    ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row, table }) => {
      const supplier = row.original;
      const selectionState = table.getState().rowSelection ?? {};
      const selectedIds = Object.keys(selectionState).filter(
        (id) => selectionState[id as unknown as string],
      );

      return (
        <SuppliersTableActions supplier={supplier} selectedIds={selectedIds} />
      );
    },
  },
];

export const supplierColumns = baseSupplierColumns;
