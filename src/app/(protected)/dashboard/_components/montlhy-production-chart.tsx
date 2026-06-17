"use client";

import dayjs from "dayjs";
import { ChartSpline } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  getDashboardMonthlyProductionByYear,
  type MonthlyProduction,
} from "@/actions/get-dashboard-monthly-production-by-year";
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

interface Warehouse {
  id: string;
  name: string;
}

interface MonthlyProductionChartProps {
  monthlyProductionData: MonthlyProduction[];
  startFrom?: string;
  warehouses?: Warehouse[];
}

const METRIC_OPTIONS = [
  { value: "all", label: "Todas as métricas" },
  { value: "traysProduced", label: "Bandejas Produzidas" },
  { value: "eggsLeftover", label: "Ovos Sobrados" },
  { value: "crackedEggs", label: "Ovos Quebrados" },
  { value: "feedUsed", label: "Rações Usadas" },
  { value: "deadBirds", label: "Aves Mortas" },
] as const;

type MetricKey =
  | "traysProduced"
  | "eggsLeftover"
  | "crackedEggs"
  | "feedUsed"
  | "deadBirds";

const chartConfig = {
  traysProduced: {
    label: "Bandejas Produzidas",
    color: "var(--primary)",
  },
  eggsLeftover: {
    label: "Ovos Sobrados",
    color: "gray",
  },
  crackedEggs: {
    label: "Ovos Quebrados",
    color: "#f97316",
  },
  feedUsed: {
    label: "Rações Usadas",
    color: "#84cc16",
  },
  deadBirds: {
    label: "Aves Mortas",
    color: "#ef4444",
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

export function MonthlyProductionChart({
  monthlyProductionData,
  startFrom,
  warehouses = [],
}: MonthlyProductionChartProps) {
  const currentYear = dayjs().format("YYYY");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMetric, setSelectedMetric] = useState<"all" | MetricKey>(
    "all",
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("all");
  const [productionByYearAndWarehouse, setProductionByYearAndWarehouse] =
    useState<Record<string, MonthlyProduction[]>>({
      [`${currentYear}-all`]: monthlyProductionData,
    });

  const cacheKey = `${selectedYear}-${selectedWarehouseId}`;

  const getMonthlyProductionByYearAction = useAction(
    getDashboardMonthlyProductionByYear,
    {
      onSuccess: ({ data }) => {
        if (!data) return;
        const key = `${data.year}-${data.warehouseId ?? "all"}`;
        setProductionByYearAndWarehouse((prev) => ({
          ...prev,
          [key]: data.monthlyProductionData,
        }));
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Erro ao carregar dados do gráfico.");
      },
    },
  );

  useEffect(() => {
    setProductionByYearAndWarehouse((prev) => ({
      ...prev,
      [`${currentYear}-all`]: monthlyProductionData,
    }));
  }, [currentYear, monthlyProductionData]);

  const availableYears = useMemo(() => {
    const years = monthlyProductionData
      .map((item) => Number(item.year))
      .filter((year) => Number.isFinite(year));
    const startYearFromFirstRecord = startFrom ? dayjs(startFrom).year() : null;
    const minYearFromData = years.length > 0 ? Math.min(...years) : null;
    const minYear =
      startYearFromFirstRecord && Number.isFinite(startYearFromFirstRecord)
        ? startYearFromFirstRecord
        : (minYearFromData ?? Number(currentYear));
    const maxYear = Number(currentYear);

    return Array.from({ length: maxYear - minYear + 1 }, (_item, index) =>
      String(minYear + index),
    ).reverse();
  }, [monthlyProductionData, currentYear, startFrom]);

  const selectedYearData =
    productionByYearAndWarehouse[cacheKey] ??
    (selectedYear === currentYear && selectedWarehouseId === "all"
      ? monthlyProductionData
      : []);

  const chartMonths = Array.from({ length: 12 }).map((_item, index) =>
    dayjs(`${selectedYear}-01-01`)
      .startOf("year")
      .add(index, "month")
      .format("YYYY-MM"),
  );

  const chartData = chartMonths.map((monthAndYear) => {
    const year = monthAndYear.split("-")[0];
    const monthNumber = String(Number(monthAndYear.split("-")[1]));

    const dataForMonth = selectedYearData.find(
      (item) => item.month === monthNumber && item.year === year,
    );

    return {
      date: MONTH_SHORT[Number(monthAndYear.split("-")[1])],
      fulldate: monthAndYear,
      traysProduced: dataForMonth?.traysProduced ?? 0,
      eggsLeftover: dataForMonth?.eggsLeftover ?? 0,
      crackedEggs: dataForMonth?.crackedEggs ?? 0,
      feedUsed: dataForMonth?.feedUsed ?? 0,
      deadBirds: dataForMonth?.deadBirds ?? 0,
    };
  });

  const visibleMetrics: MetricKey[] =
    selectedMetric === "all"
      ? [
          "traysProduced",
          "eggsLeftover",
          "crackedEggs",
          "feedUsed",
          "deadBirds",
        ]
      : [selectedMetric];

  const handleChangeYear = (year: string) => {
    setSelectedYear(year);
    const key = `${year}-${selectedWarehouseId}`;
    if (productionByYearAndWarehouse[key]) return;
    getMonthlyProductionByYearAction.execute({
      year: Number(year),
      warehouseId:
        selectedWarehouseId !== "all" ? selectedWarehouseId : undefined,
    });
  };

  const handleChangeWarehouse = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    const key = `${selectedYear}-${warehouseId}`;
    if (productionByYearAndWarehouse[key]) return;
    getMonthlyProductionByYearAction.execute({
      year: Number(selectedYear),
      warehouseId: warehouseId !== "all" ? warehouseId : undefined,
    });
  };

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <ChartSpline size={16} className="text-primary" />
            </div>
            <p className="font-bold">Produção Mensal</p>
          </div>
          <div className="flex items-center gap-2">
            {warehouses.length > 0 && (
              <Select
                value={selectedWarehouseId}
                onValueChange={handleChangeWarehouse}
                disabled={getMonthlyProductionByYearAction.isPending}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Galpão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Galpões</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={selectedMetric}
              onValueChange={(value) =>
                setSelectedMetric(value as "all" | MetricKey)
              }
            >
              <SelectTrigger className="w-[190px]">
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
              disabled={getMonthlyProductionByYearAction.isPending}
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
              width={48}
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload?.filter((item) => Number(item.value) > 0)}
                  label={label}
                  formatter={(value, name) => {
                    const metricColors: Record<string, string> = {
                      traysProduced: "var(--primary)",
                      eggsLeftover: "gray",
                      crackedEggs: "#f97316",
                      feedUsed: "#84cc16",
                      deadBirds: "#ef4444",
                    };

                    const metricLabels: Record<string, string> = {
                      traysProduced: "Bandejas",
                      eggsLeftover: "Ovos Sobrados",
                      crackedEggs: "Ovos Quebrados",
                      feedUsed: "Rações Usadas",
                      deadBirds: "Aves Mortas",
                    };

                    return (
                      <>
                        <div
                          className="h-3 w-3 rounded border border-slate-400/80"
                          style={{
                            backgroundColor:
                              metricColors[String(name)] ?? "hsl(var(--muted))",
                          }}
                        />
                        <span className="text-muted-foreground">
                          {metricLabels[String(name)] ?? String(name)}:
                        </span>
                        <span className="font-semibold">
                          {Number(value).toLocaleString("pt-BR")}
                        </span>
                      </>
                    );
                  }}
                  labelFormatter={(currentLabel, currentPayload) => {
                    if (currentPayload && currentPayload[0]) {
                      const monthStr = currentPayload[0].payload?.fulldate as
                        | string
                        | undefined;
                      if (monthStr) {
                        const monthNum = Number(monthStr.split("-")[1]);
                        return MONTH_FULL[monthNum] ?? currentLabel;
                      }
                      return currentLabel;
                    }
                    return currentLabel;
                  }}
                />
              )}
            />
            {visibleMetrics.map((metric) => (
              <Line
                key={metric}
                dataKey={metric}
                type="monotone"
                stroke={chartConfig[metric].color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
