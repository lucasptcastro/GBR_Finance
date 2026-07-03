"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { SaleWithRelations } from "../_data/get-sales";
import { SaleRow } from "./sale-row";

interface SalesTableProps {
  sales: SaleWithRelations[];
  bankAccounts: { id: string; name: string; color: string }[];
}

export function SalesTable({ sales, bankAccounts }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma venda registrada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">NF</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Galpão</TableHead>
            <TableHead className="text-center">Bandejas</TableHead>
            <TableHead>Preço unit.</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} bankAccounts={bankAccounts} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
