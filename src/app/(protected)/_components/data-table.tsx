"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  InitialTableState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { DataTableFilterField } from "./data-table-filter-types";
import { DataTableFiltersPanel } from "./data-table-filters-panel";
import { ExportDataButton } from "./export-data-button";

export type {
  DataTableFilterField,
  DataTableSelectFilterField,
  DataTableTextFilterField,
} from "./data-table-filter-types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  exportFileName?: string;
  meta?: Record<string, unknown>;
  /** Campos exibidos no painel do botão de filtros (ListFilter). */
  filterFields?: DataTableFilterField[];
  /** Estado inicial da tabela (ex.: `columnVisibility` para colunas só de filtro). */
  initialState?: InitialTableState;
}

function getLocalDateStamp() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  exportFileName,
  meta,
  filterFields,
  initialState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const pathname = usePathname();

  const resolvedExportFileName = useMemo(() => {
    if (exportFileName?.trim()) return exportFileName.trim();

    const lastSegment = (pathname ?? "")
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean)
      .at(-1);

    const base =
      lastSegment && lastSegment !== "(protected)" ? lastSegment : "export";
    return `${base}-${getLocalDateStamp()}`;
  }, [exportFileName, pathname]);

  const table = useReactTable({
    data,
    columns,
    meta,
    initialState,
    // ensure row ids come from the data id property so selection maps to transaction ids
    // fallback to the row index when `id` is missing to avoid returning an empty string
    getRowId: (row, index) => {
      const maybeId = (row as unknown as { id?: string }).id;
      return (maybeId ?? index).toString();
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <div className="flex w-full items-center justify-end gap-2">
        {filterFields?.length ? (
          <DataTableFiltersPanel table={table} filterFields={filterFields} />
        ) : null}

        <Input
          placeholder="Procurar..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm bg-white"
        />

        <ExportDataButton table={table} fileName={resolvedExportFileName} />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </>
  );
}
