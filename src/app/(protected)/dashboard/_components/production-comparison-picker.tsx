"use client";

import { endOfMonth, startOfMonth, subMonths } from "date-fns";
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

export function ProductionComparisonPicker() {
  const [open, setOpen] = useState(false);

  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));
  const [prodCompareFrom, setProdCompareFrom] = useQueryState(
    "prodCompareFrom",
    parseAsString.withDefault(""),
  );
  const [prodCompareTo, setProdCompareTo] = useQueryState(
    "prodCompareTo",
    parseAsString.withDefault(""),
  );

  const [currentRange, setCurrentRange] = useState<DateRange | undefined>(
    () => ({
      from: parseLocalDate(from) ?? startOfMonth(new Date()),
      to: parseLocalDate(to) ?? new Date(),
    }),
  );
  const [compareRange, setCompareRange] = useState<DateRange | undefined>(
    () => ({
      from:
        parseLocalDate(prodCompareFrom) ??
        startOfMonth(subMonths(new Date(), 1)),
      to:
        parseLocalDate(prodCompareTo) ?? endOfMonth(subMonths(new Date(), 1)),
    }),
  );

  const hasCustomRange = from || to || prodCompareFrom || prodCompareTo;

  const handleApply = () => {
    setFrom(formatLocalDate(currentRange?.from ?? null), { shallow: false });
    setTo(formatLocalDate(currentRange?.to ?? null), { shallow: false });
    setProdCompareFrom(formatLocalDate(compareRange?.from ?? null), {
      shallow: false,
    });
    setProdCompareTo(formatLocalDate(compareRange?.to ?? null), {
      shallow: false,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setFrom("", { shallow: false });
    setTo("", { shallow: false });
    setProdCompareFrom("", { shallow: false });
    setProdCompareTo("", { shallow: false });
    setCurrentRange({
      from: startOfMonth(new Date()),
      to: new Date(),
    });
    setCompareRange({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              hasCustomRange ? "text-primary" : "text-muted-foreground",
            )}
            title="Comparar períodos de produção"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
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
          className="h-6 w-6 text-muted-foreground"
          onClick={handleReset}
          title="Limpar comparação"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
