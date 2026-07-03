"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

import { deleteSale } from "@/actions/delete-sale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DotsThreeIcon,
  ReceiptIcon,
  TrashIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";

import type { SaleWithRelations } from "../_data/get-sales";
import { AddSalePaymentDialog } from "./add-sale-payment-dialog";

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  partially_paid: "Parcial",
  paid: "Pago",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "destructive",
  partially_paid: "secondary",
  paid: "default",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_slip: "Boleto",
  crediary: "Crediário",
};

interface SaleRowProps {
  sale: SaleWithRelations;
  bankAccounts: { id: string; name: string; color: string }[];
}

export function SaleRow({ sale, bankAccounts }: SaleRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const paidAmount = sale.payments.reduce((sum, p) => sum + p.amountInCents, 0);

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteSale,
    {
      onSuccess: () => toast.success("Venda excluída"),
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Erro ao excluir"),
    },
  );

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("pt-BR");

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">#{sale.invoiceNumber}</TableCell>
        <TableCell>{formatDate(sale.date)}</TableCell>
        <TableCell>{sale.customer?.name ?? "—"}</TableCell>
        <TableCell>{sale.warehouse.name}</TableCell>
        <TableCell className="text-center">{sale.traysSold}</TableCell>
        <TableCell>{formatCurrency(sale.pricePerTrayInCents)}</TableCell>
        <TableCell className="font-medium">
          {formatCurrency(sale.totalAmountInCents)}
        </TableCell>
        <TableCell>
          {PAYMENT_METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
        </TableCell>
        <TableCell>
          <Badge variant={STATUS_VARIANTS[sale.status]}>
            {STATUS_LABELS[sale.status]}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <DotsThreeIcon size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={`/api/sales/${sale.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ReceiptIcon className="mr-2" />
                  Ver nota fiscal
                </a>
              </DropdownMenuItem>
              {sale.status !== "paid" &&
                sale.paymentMethod === "crediary" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setPaymentDialogOpen(true)}
                    >
                      <CurrencyDollarIcon className="mr-2" />
                      Registrar pagamento
                    </DropdownMenuItem>
                  </>
                )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <TrashIcon className="mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda #{sale.invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os efeitos na conta bancária e no
              estoque serão revertidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => executeDelete({ saleId: sale.id })}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {sale.paymentMethod === "crediary" && sale.status !== "paid" && (
        <AddSalePaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          saleId={sale.id}
          invoiceNumber={sale.invoiceNumber}
          totalAmountInCents={sale.totalAmountInCents}
          paidAmountInCents={paidAmount}
          bankAccounts={bankAccounts}
        />
      )}
    </>
  );
}
