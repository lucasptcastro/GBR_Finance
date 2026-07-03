"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { CustomerCreditSummary } from "../_data/get-customers-credit";
import { CustomerCreditRow } from "./customer-credit-row";

interface CustomersCreditTableProps {
  customers: CustomerCreditSummary[];
  bankAccounts: { id: string; name: string; color: string }[];
}

export function CustomersCreditTable({
  customers,
  bankAccounts,
}: CustomersCreditTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum cliente com crediário em aberto.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Vendas</TableHead>
            <TableHead>Total em aberto</TableHead>
            <TableHead>Total pago</TableHead>
            <TableHead>Saldo devedor</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerCreditRow
              key={customer.customerId}
              customer={customer}
              bankAccounts={bankAccounts}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
