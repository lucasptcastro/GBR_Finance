"use client";

import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingDown, TrendingUp } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ProductionComparisonPicker } from "./production-comparison-picker";
import type { ProductionSummary } from "../_data/get-production-summary-by-date-range";

interface ProductionPercentageCardProps {
  current: ProductionSummary;
  previous: ProductionSummary;
}

const parseLocalDate = (str: string | null): Date | undefined => {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? undefined : dt;
};

const formatPeriod = (from: Date, to: Date): string =>
  `${format(from, "dd/MM", { locale: ptBR })} - ${format(to, "dd/MM/yy", { locale: ptBR })}`;

export function ProductionPercentageCard({
  current,
  previous,
}: ProductionPercentageCardProps) {
  const [from] = useQueryState("from", parseAsString.withDefault(""));
  const [to] = useQueryState("to", parseAsString.withDefault(""));
  const [prodCompareFrom] = useQueryState(
    "prodCompareFrom",
    parseAsString.withDefault(""),
  );
  const [prodCompareTo] = useQueryState(
    "prodCompareTo",
    parseAsString.withDefault(""),
  );

  const now = new Date();
  const currentFrom = parseLocalDate(from) ?? startOfMonth(now);
  const currentTo = parseLocalDate(to) ?? now;
  const compareFrom =
    parseLocalDate(prodCompareFrom) ?? startOfMonth(subMonths(now, 1));
  const compareTo =
    parseLocalDate(prodCompareTo) ?? endOfMonth(subMonths(now, 1));

  const variation =
    previous.totalTrays === 0
      ? null
      : Math.round(
          ((current.totalTrays - previous.totalTrays) / previous.totalTrays) *
            100,
        );

  const isPositive = variation !== null && variation > 0;
  const isNegative = variation !== null && variation < 0;

  return (
    <Card className="bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn("rounded-sm p-1.5", {
              "bg-red-500/10": isNegative,
              "bg-green-500/10": isPositive,
              "bg-primary/10": !isNegative && !isPositive,
            })}
          >
            {isNegative ? (
              <TrendingDown size={16} className="text-red-500" />
            ) : (
              <TrendingUp size={16} className="text-green-500" />
            )}
          </div>
          <p className="text-muted-foreground text-sm">Variação na Produção</p>
        </div>
        <ProductionComparisonPicker />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p
          className={cn(
            "text-2xl font-bold",
            isPositive && "text-green-600 dark:text-green-400",
            isNegative && "text-red-600 dark:text-red-400",
          )}
        >
          {variation === null ? "—" : `${isPositive ? "+" : ""}${variation}%`}
        </p>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
          <span className="text-foreground font-medium">
            {formatPeriod(currentFrom, currentTo)}
          </span>
          <span className="text-muted-foreground">vs</span>
          <span className="text-muted-foreground">
            {formatPeriod(compareFrom, compareTo)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
