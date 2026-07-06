"use client";

import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserX } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InactiveCustomer } from "../_data/get-inactive-customers";

interface InactiveCustomersTableProps {
  customers: InactiveCustomer[];
}

const THRESHOLD_OPTIONS = [
  { value: "30", label: "Sem compras há 30+ dias" },
  { value: "60", label: "Sem compras há 60+ dias" },
  { value: "90", label: "Sem compras há 90+ dias" },
  { value: "never", label: "Nunca compraram" },
] as const;

type ThresholdValue = "30" | "60" | "90" | "never";

function getInactiveBadgeColor(days: number | null): string {
  if (days === null) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  if (days >= 90) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (days >= 60) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
}

export function InactiveCustomersTable({
  customers,
}: InactiveCustomersTableProps) {
  const [threshold, setThreshold] = useState<ThresholdValue>("30");

  const now = new Date();

  const filtered = customers.filter((c) => {
    if (threshold === "never") return c.lastPurchaseDate === null;
    if (!c.lastPurchaseDate) return true;
    const days = differenceInDays(now, c.lastPurchaseDate);
    return days >= Number(threshold);
  });

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-sm p-1.5">
              <UserX size={16} className="text-primary" />
            </div>
            <p className="font-bold">Clientes Inativos</p>
          </div>
          <Select
            value={threshold}
            onValueChange={(v) => setThreshold(v as ThresholdValue)}
          >
            <SelectTrigger className="w-[230px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THRESHOLD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">
            Nenhum cliente inativo neste período.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Última Compra</TableHead>
                <TableHead className="text-right">Inativo há</TableHead>
                <TableHead className="text-right">Total de Compras</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 15).map((c) => {
                const days = c.lastPurchaseDate
                  ? differenceInDays(now, c.lastPurchaseDate)
                  : null;
                return (
                  <TableRow key={c.customerId}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.lastPurchaseDate
                        ? format(c.lastPurchaseDate, "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getInactiveBadgeColor(days)}`}
                      >
                        {days === null ? "Nunca comprou" : `${days} dias`}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.totalPurchases}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {filtered.length > 15 && (
          <p className="px-6 py-3 text-xs text-muted-foreground">
            Exibindo 15 de {filtered.length} clientes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
