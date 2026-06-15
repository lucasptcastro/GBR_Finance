"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { WarehouseWithBatches } from "../_data/get-warehouses";
import { WarehouseRow } from "./warehouse-row";

interface WarehousesTableProps {
  warehouses: WarehouseWithBatches[];
}

export function WarehousesTable({ warehouses }: WarehousesTableProps) {
  if (warehouses.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16">
        <p className="text-sm font-medium">Nenhum galpão cadastrado ainda.</p>
        <p className="text-xs">
          Clique em &quot;Novo Galpão&quot; para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Galpão / Lote</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Data de Entrada</TableHead>
            <TableHead>Idade Atual</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => (
            <WarehouseRow key={warehouse.id} warehouse={warehouse} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
