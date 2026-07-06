"use client";

import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formatLocalDate = (date: Date | null | undefined): string => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseLocalDate = (str: string | null): Date | undefined => {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? undefined : dt;
};

const formatDisplayRange = (from: Date | undefined, to: Date | undefined) => {
  if (!from) return null;
  const f = format(from, "dd/MM/yyyy", { locale: ptBR });
  const t = to ? format(to, "dd/MM/yyyy", { locale: ptBR }) : null;
  return t ? `${f} - ${t}` : f;
};

export function SalesComparisonPicker() {
  const [open, setOpen] = useState(false);

  const [salesFrom, setSalesFrom] = useQueryState(
    "salesFrom",
    parseAsString.withDefault(""),
  );
  const [salesTo, setSalesTo] = useQueryState(
    "salesTo",
    parseAsString.withDefault(""),
  );
  const [salesCompareFrom, setSalesCompareFrom] = useQueryState(
    "salesCompareFrom",
    parseAsString.withDefault(""),
  );
  const [salesCompareTo, setSalesCompareTo] = useQueryState(
    "salesCompareTo",
    parseAsString.withDefault(""),
  );

  const [currentRange, setCurrentRange] = useState<DateRange | undefined>(
    () => ({
      from: parseLocalDate(salesFrom) ?? startOfMonth(new Date()),
      to: parseLocalDate(salesTo) ?? new Date(),
    }),
  );
  const [compareRange, setCompareRange] = useState<DateRange | undefined>(
    () => ({
      from:
        parseLocalDate(salesCompareFrom) ??
        startOfMonth(subMonths(new Date(), 1)),
      to:
        parseLocalDate(salesCompareTo) ?? endOfMonth(subMonths(new Date(), 1)),
    }),
  );

  const hasCustomRange =
    salesFrom || salesTo || salesCompareFrom || salesCompareTo;

  const handleApply = () => {
    setSalesFrom(formatLocalDate(currentRange?.from ?? null), {
      shallow: false,
    });
    setSalesTo(formatLocalDate(currentRange?.to ?? null), { shallow: false });
    setSalesCompareFrom(formatLocalDate(compareRange?.from ?? null), {
      shallow: false,
    });
    setSalesCompareTo(formatLocalDate(compareRange?.to ?? null), {
      shallow: false,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setSalesFrom("", { shallow: false });
    setSalesTo("", { shallow: false });
    setSalesCompareFrom("", { shallow: false });
    setSalesCompareTo("", { shallow: false });
    setCurrentRange({
      from: startOfMonth(new Date()),
      to: new Date(),
    });
    setCompareRange({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    });
  };

  const currentLabel = formatDisplayRange(currentRange?.from, currentRange?.to);
  const compareLabel = formatDisplayRange(compareRange?.from, compareRange?.to);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !hasCustomRange && "text-muted-foreground",
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {hasCustomRange && currentLabel ? (
              <span className="text-sm">
                {currentLabel}
                {compareLabel && (
                  <>
                    <span className="text-muted-foreground mx-1">vs</span>
                    {compareLabel}
                  </>
                )}
              </span>
            ) : (
              <span>Comparar </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold">Período atual</Label>
              <Calendar
                mode="range"
                selected={currentRange}
                onSelect={setCurrentRange}
                defaultMonth={currentRange?.from}
                locale={ptBR}
              />
            </div>
            <Separator orientation="vertical" className="hidden sm:block" />
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-semibold">
                Período de comparação
              </Label>
              <Calendar
                mode="range"
                selected={compareRange}
                onSelect={setCompareRange}
                defaultMonth={compareRange?.from}
                locale={ptBR}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hasCustomRange && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
          onClick={handleReset}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
