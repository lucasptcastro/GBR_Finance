"use client";

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { upsertEggProduction } from "@/actions/upsert-egg-production";
import type { DataTableFilterField } from "@/app/(protected)/_components/data-table";
import { DataTableFiltersPanel } from "@/app/(protected)/_components/data-table-filters-panel";
import { ExportDataButton } from "@/app/(protected)/_components/export-data-button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { EggProductionDisplayRow } from "../_data/get-egg-production";
import { productionColumns } from "./table-columns";

type EditableColumn =
  | "traysProduced"
  | "eggsLeftover"
  | "crackedEggs"
  | "feedUsed"
  | "deadBirds";

const EDITABLE_COLUMNS: EditableColumn[] = [
  "traysProduced",
  "eggsLeftover",
  "crackedEggs",
  "feedUsed",
  "deadBirds",
];

type EditingCell = {
  rowId: string;
  column: EditableColumn;
  value: string;
};

function toRowId(row: EggProductionDisplayRow): string {
  const d = row.date instanceof Date ? row.date : new Date(row.date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface ProductionTableProps {
  records: EggProductionDisplayRow[];
}

export function ProductionTable({ records }: ProductionTableProps) {
  const [localRecords, setLocalRecords] = useState(records);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  const upsertAction = useAction(upsertEggProduction, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao salvar. Tente novamente.");
    },
  });

  const filterFields = useMemo<DataTableFilterField[]>(() => [], []);

  const table = useReactTable({
    data: localRecords,
    columns: productionColumns,
    getRowId: toRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
    initialState: { columnVisibility: { month: false } },
  });

  const startEditing = useCallback(
    (rowId: string, column: EditableColumn, currentValue: number) => {
      setEditingCell({ rowId, column, value: String(currentValue) });
    },
    [],
  );

  const saveEdit = useCallback(
    (row: EggProductionDisplayRow) => {
      if (!editingCell) return;

      const newValue = parseInt(editingCell.value, 10);
      if (isNaN(newValue) || newValue < 0) {
        setEditingCell(null);
        return;
      }

      const col = editingCell.column;

      setLocalRecords((prev) =>
        prev.map((r) =>
          toRowId(r) === toRowId(row) ? { ...r, [col]: newValue } : r,
        ),
      );
      setEditingCell(null);

      upsertAction.execute({
        id: row.id,
        date: row.date,
        traysProduced: col === "traysProduced" ? newValue : row.traysProduced,
        eggsLeftover: col === "eggsLeftover" ? newValue : row.eggsLeftover,
        crackedEggs: col === "crackedEggs" ? newValue : row.crackedEggs,
        feedUsed: col === "feedUsed" ? newValue : row.feedUsed,
        deadBirds: col === "deadBirds" ? newValue : row.deadBirds,
      });
    },
    [editingCell, upsertAction],
  );

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-center justify-end gap-2">
        <DataTableFiltersPanel table={table} filterFields={filterFields} />
        <Input
          placeholder="Procurar..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm bg-white"
        />
        <ExportDataButton table={table} fileName="producao-ovos" />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers
                  .filter((h) => h.column.getIsVisible())
                  .map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {/* Dia — somente leitura */}
                  <TableCell>
                    <span className="font-medium tabular-nums">
                      {String(
                        (row.original.date instanceof Date
                          ? row.original.date
                          : new Date(row.original.date)
                        ).getDate(),
                      ).padStart(2, "0")}
                    </span>
                  </TableCell>

                  {/* Colunas editáveis */}
                  {EDITABLE_COLUMNS.map((col) => {
                    const isActive =
                      editingCell?.rowId === row.id &&
                      editingCell.column === col;

                    return (
                      <TableCell
                        key={col}
                        className="cursor-pointer"
                        onClick={() => {
                          if (!isActive) {
                            startEditing(
                              row.id,
                              col,
                              row.original[col] as number,
                            );
                          }
                        }}
                      >
                        {isActive ? (
                          <Input
                            autoFocus
                            type="number"
                            min={0}
                            value={editingCell!.value}
                            onChange={(e) =>
                              setEditingCell((prev) =>
                                prev
                                  ? { ...prev, value: e.target.value }
                                  : null,
                              )
                            }
                            onBlur={() => saveEdit(row.original)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit(row.original);
                              }
                              if (e.key === "Escape") cancelEdit();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-28"
                          />
                        ) : (
                          <span>
                            {(row.original[col] as number).toLocaleString(
                              "pt-BR",
                            )}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
