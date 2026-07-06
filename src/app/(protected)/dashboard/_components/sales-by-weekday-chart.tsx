"use client";

import { CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { useState } from "react";
import type { SalesByDayOfWeek } from "../_data/get-sales-by-day-of-week";

interface SalesByWeekdayChartProps {
  data: SalesByDayOfWeek[];
}

type MetricKey = "totalAmountInCents" | "salesCount";

const METRIC_OPTIONS = [
  { value: "totalAmountInCents", label: "Receita Total (R$)" },
  { value: "salesCount", label: "Número de Vendas" },
] as const;

const chartConfig = {
  totalAmountInCents: {
    label: "Receita Total",
    color: "var(--primary)",
  },
  salesCount: {
    label: "Nº de Vendas",
    color: "#84cc16",
  },
} satisfies ChartConfig;

export function SalesByWeekdayChart({ data }: SalesByWeekdayChartProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("totalAmountInCents");

  const chartData = data.map((d) => ({
    dayLabel: d.dayLabel,
    totalAmountInCents: d.totalAmountInCents / 100,
    salesCount: d.salesCount,
  }));

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <CalendarDays size={16} className="text-primary" />
            </div>
            <p className="font-bold">Vendas por Dia da Semana</p>
          </div>
          <Select
            value={selectedMetric}
            onValueChange={(v) => setSelectedMetric(v as MetricKey)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Métrica" />
            </SelectTrigger>
            <SelectContent>
              {METRIC_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-full p-0 sm:pt-4">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={56}
              tickFormatter={(v) => {
                if (selectedMetric === "totalAmountInCents") {
                  return `R$${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
                }
                return Number(v).toLocaleString("pt-BR");
              }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  formatter={(value, name) => {
                    const cfg = chartConfig[name as MetricKey];
                    const displayValue =
                      name === "totalAmountInCents"
                        ? Number(value).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : `${Number(value).toLocaleString("pt-BR")} vendas`;
                    return (
                      <>
                        <div
                          className="h-3 w-3 rounded border border-slate-400/80"
                          style={{ backgroundColor: cfg?.color }}
                        />
                        <span className="text-muted-foreground">
                          {cfg?.label}:
                        </span>
                        <span className="font-semibold">{displayValue}</span>
                      </>
                    );
                  }}
                />
              )}
            />
            <Bar
              dataKey={selectedMetric}
              fill={chartConfig[selectedMetric].color}
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
