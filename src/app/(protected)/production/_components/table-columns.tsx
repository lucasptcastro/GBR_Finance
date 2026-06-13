"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EggProductionDisplayRow } from "../_data/get-egg-production";

function toLocalDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const parts = value.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export type EggProductionRow = EggProductionDisplayRow;

export const productionColumns: ColumnDef<EggProductionRow>[] = [
  {
    id: "month",
    accessorFn: (row) => {
      const d = toLocalDate(row.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    },
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const d = toLocalDate(row.original.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === filterValue;
    },
    header: () => null,
    cell: () => null,
    enableHiding: true,
  },
  {
    id: "day",
    accessorFn: (row) => toLocalDate(row.date).getDate(),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dia
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {String(toLocalDate(row.original.date).getDate()).padStart(2, "0")}
      </span>
    ),
  },
  {
    id: "traysProduced",
    accessorKey: "traysProduced",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Bandejas Fabricadas
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span>{row.original.traysProduced.toLocaleString("pt-BR")}</span>
    ),
  },
  {
    id: "eggsLeftover",
    accessorKey: "eggsLeftover",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ovos Sobrados
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span>{row.original.eggsLeftover.toLocaleString("pt-BR")}</span>
    ),
  },
  {
    id: "crackedEggs",
    accessorKey: "crackedEggs",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ovos Trincados
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span>{row.original.crackedEggs.toLocaleString("pt-BR")}</span>
    ),
  },
  {
    id: "feedUsed",
    accessorKey: "feedUsed",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Rações Usadas
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span>{row.original.feedUsed.toLocaleString("pt-BR")}</span>
    ),
  },
  {
    id: "deadBirds",
    accessorKey: "deadBirds",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Aves Mortas
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span>{row.original.deadBirds.toLocaleString("pt-BR")}</span>
    ),
  },
];
