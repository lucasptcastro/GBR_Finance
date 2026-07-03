"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretDownIcon, CaretRightIcon, CurrencyDollarIcon } from "@phosphor-icons/react";

import type { CustomerCreditSummary } from "../_data/get-customers-credit";
import { AddSalePaymentDialog } from "../../sales/_components/add-sale-payment-dialog";

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  partially_paid: "Parcial",
};

const STATUS_VARIANTS: Record<string, "destructive" | "secondary"> = {
  pending: "destructive",
  partially_paid: "secondary",
};

interface CustomerCreditRowProps {
  customer: CustomerCreditSummary;
  bankAccounts: { id: string; name: string; color: string }[];
}

export function CustomerCreditRow({
  customer,
  bankAccounts,
}: CustomerCreditRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<
    (typeof customer.pendingSales)[0] | null
  >(null);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("pt-BR");

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
        <>
          <TableRow className="cursor-pointer hover:bg-muted/50">
            <TableCell>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2">
                  {isOpen ? (
                    <CaretDownIcon size={16} />
                  ) : (
                    <CaretRightIcon size={16} />
                  )}
                  <span className="font-medium">{customer.customerName}</span>
                </button>
              </CollapsibleTrigger>
            </TableCell>
            <TableCell className="text-center">{customer.salesCount}</TableCell>
            <TableCell>{formatCurrency(customer.totalOwedInCents)}</TableCell>
            <TableCell>{formatCurrency(customer.totalPaidInCents)}</TableCell>
            <TableCell className="font-semibold text-destructive">
              {formatCurrency(customer.remainingInCents)}
            </TableCell>
            <TableCell />
          </TableRow>

          <CollapsibleContent asChild>
            <>
              {customer.pendingSales.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="bg-muted/20 text-sm"
                >
                  <TableCell className="pl-10">
                    NF #{sale.invoiceNumber} — {sale.warehouseName} —{" "}
                    {formatDate(sale.date)} — {sale.traysSold} bandejas
                  </TableCell>
                  <TableCell />
                  <TableCell>{formatCurrency(sale.totalAmountInCents)}</TableCell>
                  <TableCell>{formatCurrency(sale.paidAmountInCents)}</TableCell>
                  <TableCell className="font-medium text-destructive">
                    {formatCurrency(sale.totalAmountInCents - sale.paidAmountInCents)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={STATUS_VARIANTS[sale.status]}
                      >
                        {STATUS_LABELS[sale.status]}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <CurrencyDollarIcon />
                        Pagar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          </CollapsibleContent>
        </>
      </Collapsible>

      {selectedSale && (
        <AddSalePaymentDialog
          open={!!selectedSale}
          onOpenChange={(open) => {
            if (!open) setSelectedSale(null);
          }}
          saleId={selectedSale.id}
          invoiceNumber={selectedSale.invoiceNumber}
          totalAmountInCents={selectedSale.totalAmountInCents}
          paidAmountInCents={selectedSale.paidAmountInCents}
          bankAccounts={bankAccounts}
        />
      )}
    </>
  );
}
