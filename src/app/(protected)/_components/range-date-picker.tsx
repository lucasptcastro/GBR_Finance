"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarRange } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function RangeDatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  // Função utilitária para converter string ISO para Date local
  const parseLocalDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    // Cria a data usando os componentes da string ISO para evitar problemas de fuso horário
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa 0-based months
  };

  // Função utilitária para converter Date para string ISO local
  const formatLocalDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // coleta a data da query string (URL) / sem data padrão
  const [fromString, setFromString] = useQueryState(
    "from",
    parseAsString.withDefault(""),
  );
  const [toString, setToString] = useQueryState(
    "to",
    parseAsString.withDefault(""),
  );

  // Converte as strings para objetos Date
  const from = parseLocalDate(fromString);
  const to = parseLocalDate(toString);

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    if (dateRange?.from) {
      setFromString(formatLocalDate(dateRange.from), {
        shallow: false, // faz com que a página seja recarregada para atualizar os valores
      });
    }
    if (dateRange?.to) {
      setToString(formatLocalDate(dateRange.to), {
        shallow: false, // faz com que a página seja recarregada para atualizar os valores
      });
    }
  };

  const date: DateRange = {
    from: from || undefined,
    to: to || undefined,
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarRange />
            {date?.from ? (
              date.to ? (
                <span className="w-full text-center sm:w-auto sm:text-left">
                  {format(date.from, "LLL dd, y", {
                    locale: ptBR,
                  })}{" "}
                  -{" "}
                  {format(date.to, "LLL dd, y", {
                    locale: ptBR,
                  })}
                </span>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span className="w-full text-center sm:w-auto sm:text-left">
                Selecionar intervalo de datas
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
