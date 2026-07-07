"use client";

import { Bird, Package } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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

import type { ProductionByWarehouse } from "../_data/get-production-by-warehouse";

interface ProductionByWarehouseChartProps {
  data: ProductionByWarehouse[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Metric = "traysProduced" | "deadBirds" | "feedUsed";

const METRICS: { value: Metric; label: string }[] = [
  { value: "traysProduced", label: "Bandejas Produzidas" },
  { value: "deadBirds", label: "Aves Mortas" },
  { value: "feedUsed", label: "Ração Usada (kg)" },
];

export function ProductionByWarehouseChart({
  data,
}: ProductionByWarehouseChartProps) {
  const [metric, setMetric] = useState<Metric>("traysProduced");

  const chartData = data.map((d, idx) => ({
    name: d.warehouseName,
    value: d[metric],
    color: COLORS[idx % COLORS.length],
  }));

  const config = {
    value: { label: METRICS.find((m) => m.value === metric)?.label },
  };

  const formatValue = (v: number) => {
    if (metric === "traysProduced") return `${v.toLocaleString("pt-BR")} bdj`;
    if (metric === "deadBirds") return `${v} aves`;
    return `${v} kg`;
  };

  if (data.length === 0) {
    return (
      <Card className="bg-transparent shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 py-4">
          <div className="bg-primary/10 rounded-sm p-1.5">
            <Package size={16} className="text-primary" />
          </div>
          <CardTitle className="text-base">Produção por Galpão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhum dado disponível.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-sm p-1.5">
            <Package size={16} className="text-primary" />
          </div>
          <CardTitle className="text-base">Produção por Galpão</CardTitle>
        </div>
        <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <SelectTrigger className="h-8 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRICS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ right: 60, left: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={90}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    formatValue(Number(value)),
                    METRICS.find((m) => m.value === metric)?.label,
                  ]}
                />
              }
            />
            <Bar dataKey="value" radius={4}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) => formatValue(Number(v))}
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
