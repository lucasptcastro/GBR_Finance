"use client";

import { CheckCircle } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import type { SalesByStatus } from "../_data/get-sales-by-status";

interface SalesStatusChartProps {
  data: SalesByStatus[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: "#22c55e",
  partially_paid: "#f97316",
  pending: "#ef4444",
};

export function SalesStatusChart({ data }: SalesStatusChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <CheckCircle size={16} className="text-primary" />
            </div>
            <p className="font-bold">Status das Vendas</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma venda registrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.salesCount, 0);

  const chartConfig = Object.fromEntries(
    data.map((d) => [
      d.status,
      { label: d.label, color: STATUS_COLORS[d.status] ?? "var(--primary)" },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-sm p-1.5">
            <CheckCircle size={16} className="text-primary" />
          </div>
          <p className="font-bold">Status das Vendas</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <ChartContainer config={chartConfig} className="h-[240px] w-[240px] shrink-0">
          <PieChart>
            <Pie
              data={data}
              dataKey="salesCount"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? "var(--primary)"}
                  fillOpacity={0.9}
                />
              ))}
            </Pie>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                const pct =
                  total > 0
                    ? (((item.value as number) / total) * 100).toFixed(1)
                    : "0";
                const d = item.payload as SalesByStatus;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                    <p className="font-semibold mb-1">{d.label}</p>
                    <p className="text-muted-foreground">
                      {item.value} vendas
                      <span className="ml-1 text-xs">({pct}%)</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {(d.totalAmountInCents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-col gap-2 w-full">
          {data.map((entry) => {
            const pct =
              total > 0
                ? ((entry.salesCount / total) * 100).toFixed(1)
                : "0";
            return (
              <div
                key={entry.status}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[entry.status] ?? "var(--primary)",
                    }}
                  />
                  <span className="text-muted-foreground">{entry.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                  <span className="font-semibold">
                    {entry.salesCount} vendas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
