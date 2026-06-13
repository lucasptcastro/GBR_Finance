"use client";

import dayjs from "dayjs";
import { Calendar, CalendarDays, CalendarRange, Loader2 } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePresetProps {
  startFrom?: string;
}

export function DateRangePreset({ startFrom }: DateRangePresetProps) {
  const [isSinceStartLoading, setIsSinceStartLoading] = React.useState(false);

  const [fromString, setFromString] = useQueryState(
    "from",
    parseAsString.withDefault(""),
  );
  const [toString, setToString] = useQueryState(
    "to",
    parseAsString.withDefault(""),
  );

  // Função para formatar data no formato ISO local
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const setMonthRange = (range: "current" | "next") => {
    const from =
      range === "current"
        ? dayjs().startOf("month").toDate()
        : dayjs().add(1, "month").startOf("month").toDate();
    const to =
      range === "current"
        ? dayjs().endOf("month").toDate()
        : dayjs().add(1, "month").endOf("month").toDate();

    setFromString(formatLocalDate(from), { shallow: false });
    setToString(formatLocalDate(to), { shallow: false });
  };

  const setYearRange = () => {
    const from = dayjs().startOf("year").toDate();
    const to = dayjs().endOf("year").toDate();

    setFromString(formatLocalDate(from), { shallow: false });
    setToString(formatLocalDate(to), { shallow: false });
  };

  const setSinceStartRange = () => {
    if (!startFrom) return;

    setIsSinceStartLoading(true);
    const today = new Date();
    setFromString(startFrom, { shallow: false });
    setToString(formatLocalDate(today), { shallow: false });
  };

  // Verifica se está no modo mês atual
  const isCurrentMonth =
    fromString === formatLocalDate(dayjs().startOf("month").toDate()) &&
    toString === formatLocalDate(dayjs().endOf("month").toDate());

  // Verifica se está no modo próximo mês
  const isNextMonth =
    fromString ===
      formatLocalDate(dayjs().add(1, "month").startOf("month").toDate()) &&
    toString ===
      formatLocalDate(dayjs().add(1, "month").endOf("month").toDate());

  // Verifica se está no modo ano atual
  const isCurrentYear =
    fromString === formatLocalDate(dayjs().startOf("year").toDate()) &&
    toString === formatLocalDate(dayjs().endOf("year").toDate());

  const todayString = formatLocalDate(new Date());
  const isSinceStart =
    !!startFrom && fromString === startFrom && toString === todayString;

  React.useEffect(() => {
    if (isSinceStart) {
      setIsSinceStartLoading(false);
    }
  }, [isSinceStart]);

  return (
    <div className={cn("xs:grid-cols-2 grid grid-cols-1 gap-2 sm:flex")}>
      <Button
        variant={
          isCurrentMonth || (!fromString && !toString) ? "default" : "outline"
        }
        size="sm"
        onClick={() => setMonthRange("current")}
        className={cn(
          "flex flex-1 items-center gap-2",
          (isCurrentMonth || (!fromString && !toString)) &&
            "bg-primary text-primary-foreground",
        )}
      >
        <CalendarDays className="h-4 w-4" />
        Mês Atual
      </Button>

      <Button
        variant={isNextMonth ? "default" : "outline"}
        size="sm"
        onClick={() => setMonthRange("next")}
        className={cn(
          "flex flex-1 items-center gap-2",
          isNextMonth && "bg-primary text-primary-foreground",
        )}
      >
        <CalendarDays className="h-4 w-4" />
        Mês Seguinte
      </Button>

      <Button
        variant={isCurrentYear ? "default" : "outline"}
        size="sm"
        onClick={setYearRange}
        className={cn(
          "flex flex-1 items-center gap-2",
          isCurrentYear && "bg-primary text-primary-foreground",
        )}
      >
        <Calendar className="h-4 w-4" />
        Ano Atual
      </Button>

      {startFrom ? (
        <Button
          variant={isSinceStart ? "default" : "outline"}
          size="sm"
          onClick={setSinceStartRange}
          disabled={isSinceStartLoading}
          aria-busy={isSinceStartLoading}
          className={cn(
            "flex flex-1 items-center gap-2",
            isSinceStart && "bg-primary text-primary-foreground",
          )}
        >
          {isSinceStartLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {isSinceStartLoading ? (
            "Carregando..."
          ) : (
            <>
              <CalendarRange className="h-4 w-4" />
              Desde o início
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
