"use client";

import dayjs from "dayjs";
import { ChartSpline } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  getDashboardMonthlySalesByYear,
  type MonthlySales,
} from "@/actions/get-dashboard-monthly-sales-by-year/index";
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

interface MonthlySalesChartProps {
  monthlySalesData: MonthlySales[];
  startFrom?: string;
}

const METRIC_OPTIONS = [
  { value: "totalAmountInCents", label: "Receita Total (R$)" },
  { value: "traysSold", label: "Bandejas Vendidas" },
  { value: "salesCount", label: "Número de Vendas" },
] as const;

type MetricKey = "totalAmountInCents" | "traysSold" | "salesCount";

const chartConfig = {
  totalAmountInCents: {
    label: "Receita Total",
    color: "var(--primary)",
  },
  traysSold: {
    label: "Bandejas Vendidas",
    color: "#84cc16",
  },
  salesCount: {
    label: "Nº de Vendas",
    color: "#f97316",
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

export function MonthlySalesChart({
  monthlySalesData,
  startFrom,
}: MonthlySalesChartProps) {
  const currentYear = dayjs().format("YYYY");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(
    "totalAmountInCents",
  );
  const [salesByYear, setSalesByYear] = useState<
    Record<string, MonthlySales[]>
  >({ [currentYear]: monthlySalesData });

  const getDashboardMonthlySalesByYearAction = useAction(
    getDashboardMonthlySalesByYear,
    {
      onSuccess: ({ data }) => {
        if (!data) return;
        setSalesByYear((prev) => ({
          ...prev,
          [data.year]: data.monthlySalesData,
        }));
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Erro ao carregar dados do gráfico.");
      },
    },
  );

  useEffect(() => {
    setSalesByYear((prev) => ({ ...prev, [currentYear]: monthlySalesData }));
  }, [currentYear, monthlySalesData]);

  const availableYears = useMemo(() => {
    const years = monthlySalesData
      .map((item) => Number(item.year))
      .filter((y) => Number.isFinite(y));
    const startYearFromFirstRecord = startFrom ? dayjs(startFrom).year() : null;
    const minYearFromData = years.length > 0 ? Math.min(...years) : null;
    const minYear =
      startYearFromFirstRecord && Number.isFinite(startYearFromFirstRecord)
        ? startYearFromFirstRecord
        : (minYearFromData ?? Number(currentYear));
    const maxYear = Number(currentYear);

    return Array.from({ length: maxYear - minYear + 1 }, (_item, i) =>
      String(minYear + i),
    ).reverse();
  }, [monthlySalesData, currentYear, startFrom]);

  const selectedYearData = salesByYear[selectedYear] ?? [];

  const chartMonths = Array.from({ length: 12 }).map((_item, i) =>
    dayjs(`${selectedYear}-01-01`).startOf("year").add(i, "month").format("YYYY-MM"),
  );

  const chartData = chartMonths.map((monthAndYear) => {
    const [year, monthPadded] = monthAndYear.split("-");
    const monthNumber = String(Number(monthPadded));
    const dataForMonth = selectedYearData.find(
      (item) => item.month === monthNumber && item.year === year,
    );
    return {
      date: MONTH_SHORT[Number(monthPadded)],
      fulldate: monthAndYear,
      totalAmountInCents: dataForMonth
        ? dataForMonth.totalAmountInCents / 100
        : 0,
      traysSold: dataForMonth?.traysSold ?? 0,
      salesCount: dataForMonth?.salesCount ?? 0,
    };
  });

  const handleChangeYear = (year: string) => {
    setSelectedYear(year);
    if (salesByYear[year]) return;
    getDashboardMonthlySalesByYearAction.execute({ year: Number(year) });
  };

  const metricLabel = METRIC_OPTIONS.find(
    (o) => o.value === selectedMetric,
  )?.label;

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <ChartSpline size={16} className="text-primary" />
            </div>
            <p className="font-bold">Vendas Mensais</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedMetric}
              onValueChange={(v) => setSelectedMetric(v as MetricKey)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Métrica" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear}
              onValueChange={handleChangeYear}
              disabled={getDashboardMonthlySalesByYearAction.isPending}
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
              width={56}
              tickFormatter={(value) => {
                if (selectedMetric === "totalAmountInCents") {
                  return `R$${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
                }
                return Number(value).toLocaleString("pt-BR");
              }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  formatter={(value, name) => {
                    const color = chartConfig[name as MetricKey]?.color ?? "var(--primary)";
                    const displayValue =
                      name === "totalAmountInCents"
                        ? Number(value).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : Number(value).toLocaleString("pt-BR");

                    return (
                      <>
                        <div
                          className="h-3 w-3 rounded border border-slate-400/80"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground">
                          {metricLabel}:
                        </span>
                        <span className="font-semibold">{displayValue}</span>
                      </>
                    );
                  }}
                  labelFormatter={(currentLabel, currentPayload) => {
                    if (currentPayload?.[0]) {
                      const monthStr = currentPayload[0].payload?.fulldate as string | undefined;
                      if (monthStr) {
                        const monthNum = Number(monthStr.split("-")[1]);
                        return MONTH_FULL[monthNum] ?? currentLabel;
                      }
                    }
                    return currentLabel;
                  }}
                />
              )}
            />
            <Line
              key={selectedMetric}
              dataKey={selectedMetric}
              type="monotone"
              stroke={chartConfig[selectedMetric].color}
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
