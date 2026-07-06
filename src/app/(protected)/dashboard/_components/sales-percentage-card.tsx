"use client";

import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingDown, TrendingUp } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { SalesComparisonPicker } from "./sales-comparison-picker";
import type { SalesSummary } from "../_data/get-sales-summary-by-date-range";

interface SalesPercentageCardProps {
  summary: SalesSummary;
}

const parseLocalDate = (str: string | null): Date | undefined => {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? undefined : dt;
};

const formatPeriod = (from: Date, to: Date): string =>
  `${format(from, "dd/MM", { locale: ptBR })} - ${format(to, "dd/MM/yy", { locale: ptBR })}`;

export function SalesPercentageCard({ summary }: SalesPercentageCardProps) {
  const [salesFrom] = useQueryState("salesFrom", parseAsString.withDefault(""));
  const [salesTo] = useQueryState("salesTo", parseAsString.withDefault(""));
  const [salesCompareFrom] = useQueryState(
    "salesCompareFrom",
    parseAsString.withDefault(""),
  );
  const [salesCompareTo] = useQueryState(
    "salesCompareTo",
    parseAsString.withDefault(""),
  );

  const now = new Date();
  const currentFrom = parseLocalDate(salesFrom) ?? startOfMonth(now);
  const currentTo = parseLocalDate(salesTo) ?? now;
  const compareFrom =
    parseLocalDate(salesCompareFrom) ?? startOfMonth(subMonths(now, 1));
  const compareTo =
    parseLocalDate(salesCompareTo) ?? endOfMonth(subMonths(now, 1));

  const { current, previous } = summary;
  const variation =
    previous.totalAmountInCents === 0
      ? null
      : Math.round(
          ((current.totalAmountInCents - previous.totalAmountInCents) /
            previous.totalAmountInCents) *
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
          <p className="text-muted-foreground text-sm">Variação nas Vendas</p>
        </div>
        <SalesComparisonPicker compact />
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
