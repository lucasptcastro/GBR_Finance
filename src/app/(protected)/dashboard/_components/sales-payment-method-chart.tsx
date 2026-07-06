"use client";

import { CreditCard } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import type { SalesByPaymentMethod } from "../_data/get-sales-by-payment-method";

interface SalesPaymentMethodChartProps {
  data: SalesByPaymentMethod[];
}

const COLORS = [
  "var(--primary)",
  "#84cc16",
  "#f97316",
  "#06b6d4",
  "#8b5cf6",
];

export function SalesPaymentMethodChart({
  data,
}: SalesPaymentMethodChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <CreditCard size={16} className="text-primary" />
            </div>
            <p className="font-bold">Formas de Pagamento</p>
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

  const total = data.reduce((sum, d) => sum + d.totalAmountInCents, 0);

  const chartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.paymentMethod,
      { label: d.paymentMethod, color: COLORS[i % COLORS.length] },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-sm p-1.5">
            <CreditCard size={16} className="text-primary" />
          </div>
          <p className="font-bold">Formas de Pagamento</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <ChartContainer config={chartConfig} className="h-[240px] w-[240px] shrink-0">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalAmountInCents"
              nameKey="paymentMethod"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.paymentMethod}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.9}
                />
              ))}
            </Pie>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                const pct = total > 0
                  ? ((Number(item.value) / total) * 100).toFixed(1)
                  : "0";
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                    <p className="font-semibold mb-1">{item.name}</p>
                    <p className="text-muted-foreground">
                      {Number(item.value).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      <span className="ml-1 text-xs">({pct}%)</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {(item.payload as SalesByPaymentMethod).salesCount} vendas
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-col gap-2 w-full">
          {data.map((entry, index) => {
            const pct =
              total > 0
                ? ((entry.totalAmountInCents / total) * 100).toFixed(1)
                : "0";
            return (
              <div
                key={entry.paymentMethod}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">
                    {entry.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {pct}%
                  </span>
                  <span className="font-semibold">
                    {(entry.totalAmountInCents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
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
