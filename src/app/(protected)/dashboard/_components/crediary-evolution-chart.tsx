"use client";

import dayjs from "dayjs";
import { HandCoins } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  getDashboardCrediaryEvolutionByYear,
} from "@/actions/get-dashboard-crediary-evolution-by-year/index";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MonthlyCrediaryEvolution } from "../_data/get-crediary-evolution-by-year";

interface CrediaryEvolutionChartProps {
  evolutionData: MonthlyCrediaryEvolution[];
  startFrom?: string;
}

const chartConfig = {
  grantedInCents: {
    label: "Crédito Concedido",
    color: "#ef4444",
  },
  receivedInCents: {
    label: "Valor Recebido",
    color: "#22c55e",
  },
} satisfies ChartConfig;

const MONTH_SHORT: Record<number, string> = {
  1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
  7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez",
};

const MONTH_FULL: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio",
  6: "Junho", 7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro",
  11: "Novembro", 12: "Dezembro",
};

export function CrediaryEvolutionChart({
  evolutionData,
  startFrom,
}: CrediaryEvolutionChartProps) {
  const currentYear = dayjs().format("YYYY");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dataByYear, setDataByYear] = useState<
    Record<string, MonthlyCrediaryEvolution[]>
  >({ [currentYear]: evolutionData });

  const getCrediaryEvolutionAction = useAction(
    getDashboardCrediaryEvolutionByYear,
    {
      onSuccess: ({ data }) => {
        if (!data) return;
        setDataByYear((prev) => ({
          ...prev,
          [data.year]: data.evolutionData,
        }));
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Erro ao carregar dados do gráfico.");
      },
    },
  );

  useEffect(() => {
    setDataByYear((prev) => ({ ...prev, [currentYear]: evolutionData }));
  }, [currentYear, evolutionData]);

  const availableYears = useMemo(() => {
    const startYear = startFrom ? dayjs(startFrom).year() : Number(currentYear);
    const maxYear = Number(currentYear);
    return Array.from(
      { length: maxYear - startYear + 1 },
      (_, i) => String(startYear + i),
    ).reverse();
  }, [currentYear, startFrom]);

  const selectedData = dataByYear[selectedYear] ?? [];

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const entry = selectedData.find((d) => Number(d.month) === month);
    return {
      date: MONTH_SHORT[month],
      month,
      grantedInCents: (entry?.grantedInCents ?? 0) / 100,
      receivedInCents: (entry?.receivedInCents ?? 0) / 100,
    };
  });

  const handleChangeYear = (year: string) => {
    setSelectedYear(year);
    if (dataByYear[year]) return;
    getCrediaryEvolutionAction.execute({ year: Number(year) });
  };

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <HandCoins size={16} className="text-primary" />
            </div>
            <p className="font-bold">Evolução do Crediário</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">Concedido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Recebido</span>
            </div>
            <Select
              value={selectedYear}
              onValueChange={handleChangeYear}
              disabled={getCrediaryEvolutionAction.isPending}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-0 sm:pt-12">
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(v) =>
                `R$${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
              }
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload?.filter((p) => Number(p.value) > 0)}
                  label={label}
                  formatter={(value, name) => {
                    const cfg = chartConfig[name as keyof typeof chartConfig];
                    return (
                      <>
                        <div
                          className="h-3 w-3 rounded border border-slate-400/80"
                          style={{ backgroundColor: cfg?.color }}
                        />
                        <span className="text-muted-foreground">
                          {cfg?.label}:
                        </span>
                        <span className="font-semibold">
                          {Number(value).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </>
                    );
                  }}
                  labelFormatter={(currentLabel, currentPayload) => {
                    const monthNum = currentPayload?.[0]?.payload?.month as number | undefined;
                    return MONTH_FULL[monthNum ?? 0] ?? currentLabel;
                  }}
                />
              )}
            />
            <Line
              dataKey="grantedInCents"
              type="monotone"
              stroke={chartConfig.grantedInCents.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              dataKey="receivedInCents"
              type="monotone"
              stroke={chartConfig.receivedInCents.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
