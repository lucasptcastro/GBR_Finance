"use client";

import { AlertCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TopCrediaryCustomer } from "../_data/get-top-crediary-customers";

interface TopCrediaryCustomersChartProps {
  customers: TopCrediaryCustomer[];
}

const chartConfig = {
  remainingInCents: {
    label: "Dívida Pendente",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function TopCrediaryCustomersChart({
  customers,
}: TopCrediaryCustomersChartProps) {
  if (customers.length === 0) {
    return (
      <Card className="bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <AlertCircle size={16} className="text-primary" />
            </div>
            <p className="font-bold">Maiores Devedores (Crediário)</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum crediário pendente.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = customers.map((c) => ({
    name: c.customerName,
    shortName: c.customerName.split(" ").slice(0, 2).join(" "),
    remainingInCents: c.remainingInCents / 100,
  }));

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-sm p-1.5">
            <AlertCircle size={16} className="text-primary" />
          </div>
          <p className="font-bold">Maiores Devedores (Crediário)</p>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <ChartContainer config={chartConfig} className="max-h-[320px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 64, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="shortName"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fontSize: 12 }}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `R$${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
              }
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  labelFormatter={(_l, pl) =>
                    (pl?.[0]?.payload as { name?: string })?.name ?? _l
                  }
                  formatter={(value) => (
                    <>
                      <div
                        className="h-3 w-3 rounded border border-slate-400/80"
                        style={{ backgroundColor: "#ef4444" }}
                      />
                      <span className="text-muted-foreground">
                        Dívida pendente:
                      </span>
                      <span className="font-semibold">
                        {Number(value).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </>
                  )}
                />
              )}
            />
            <Bar dataKey="remainingInCents" radius={4}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill="#ef4444" fillOpacity={0.85} />
              ))}
              <LabelList
                dataKey="remainingInCents"
                position="right"
                formatter={(v: number) =>
                  `R$${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
                }
                className="text-xs fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
