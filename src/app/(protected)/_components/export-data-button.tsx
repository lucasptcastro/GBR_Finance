"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportFormat = "json" | "csv" | "excel";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toSafeFileBaseName(fileName?: string) {
  const base = (fileName ?? "export").trim() || "export";
  return base.replace(/[\\/:*?"<>|]/g, "-");
}

function formatCellValue(value: unknown) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

interface ExportDataButtonProps<TData> {
  table: TanStackTable<TData>;
  fileName?: string;
}

export function ExportDataButton<TData>({
  table,
  fileName,
}: ExportDataButtonProps<TData>) {
  const handleExport = async (format: ExportFormat) => {
    const exportableColumns = table.getVisibleLeafColumns().filter((col) => {
      const def = col.columnDef;
      return (
        Boolean((def as { accessorKey?: unknown }).accessorKey) ||
        typeof (def as { accessorFn?: unknown }).accessorFn === "function"
      );
    });

    const rows = table.getSortedRowModel().rows;

    const exportData = rows.map((row) => {
      const record: Record<string, unknown> = {};
      for (const col of exportableColumns) {
        record[col.id] = row.getValue(col.id);
      }
      return record;
    });

    const baseName = toSafeFileBaseName(fileName);

    if (format === "json") {
      const json = JSON.stringify(exportData, null, 2);
      downloadBlob(
        new Blob([json], { type: "application/json;charset=utf-8" }),
        `${baseName}.json`,
      );
      return;
    }

    if (format === "csv") {
      const headers = exportableColumns.map((c) => c.id);
      const lines = [headers.map(escapeCsv).join(",")];

      for (const row of rows) {
        const values = exportableColumns.map((c) => {
          const cellValue = formatCellValue(row.getValue(c.id));
          return escapeCsv(cellValue);
        });
        lines.push(values.join(","));
      }

      const csv = lines.join("\n");
      downloadBlob(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
        `${baseName}.csv`,
      );
      return;
    }

    const xlsxMod = await import("xlsx");
    const XLSX: typeof import("xlsx") =
      (xlsxMod as unknown as { default?: typeof import("xlsx") }).default ??
      xlsxMod;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

    const arrayBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    downloadBlob(
      new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${baseName}.xlsx`,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Share />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => void handleExport("json")}>
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleExport("csv")}>
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleExport("excel")}>
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
