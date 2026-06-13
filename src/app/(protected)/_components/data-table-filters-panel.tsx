"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";
import { ListFilter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { DataTableFilterField } from "./data-table-filter-types";

const FILTER_ALL = "__data_table_all__";

export interface DataTableFiltersPanelProps<TData> {
  table: TanstackTable<TData>;
  filterFields: DataTableFilterField[];
}

export function DataTableFiltersPanel<TData>({
  table,
  filterFields,
}: DataTableFiltersPanelProps<TData>) {
  const activeCount = table
    .getState()
    .columnFilters.filter(
      (f) =>
        f.value !== undefined &&
        f.value !== null &&
        String(f.value).trim() !== "",
    ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-1.5"
          aria-label="Filtros da tabela"
        >
          <ListFilter className="size-4" />
          {activeCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center px-1 text-[10px]"
            >
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Filtros</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={activeCount === 0}
              onClick={() => table.resetColumnFilters()}
            >
              Limpar
            </Button>
          </div>
          <div className="max-h-[min(60vh,24rem)] space-y-3 overflow-y-auto pr-1">
            {filterFields.map((field) => {
              const column = table.getColumn(field.columnId);
              if (!column) return null;

              if (field.type === "text") {
                const raw = column.getFilterValue();
                const value =
                  typeof raw === "string" ? raw : raw != null ? String(raw) : "";

                return (
                  <div key={field.columnId} className="space-y-1.5">
                    <Label
                      htmlFor={`filter-${field.columnId}`}
                      className="text-xs"
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={`filter-${field.columnId}`}
                      placeholder={field.placeholder ?? "Filtrar…"}
                      value={value}
                      onChange={(e) => {
                        const next = e.target.value;
                        column.setFilterValue(
                          next.trim() === "" ? undefined : next,
                        );
                      }}
                      className="h-8 bg-white"
                    />
                  </div>
                );
              }

              const allLabel = field.allLabel ?? "Todos";
              const raw = column.getFilterValue();
              const selected =
                raw !== undefined && raw !== null && String(raw) !== ""
                  ? String(raw)
                  : FILTER_ALL;

              return (
                <div key={field.columnId} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <Select
                    value={selected}
                    onValueChange={(v) =>
                      column.setFilterValue(v === FILTER_ALL ? undefined : v)
                    }
                  >
                    <SelectTrigger className="h-8 w-full bg-white">
                      <SelectValue placeholder={allLabel} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={FILTER_ALL}>{allLabel}</SelectItem>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
