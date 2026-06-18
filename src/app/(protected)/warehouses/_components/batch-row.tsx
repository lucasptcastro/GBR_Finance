"use client";

import dayjs from "dayjs";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteBirdBatch } from "@/actions/delete-bird-batch";
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
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

import type { BirdBatchWithAge } from "../_data/get-warehouses";
import { UpsertBatchDialog } from "./upsert-batch-dialog";

function formatIntakeAge(months: number): string {
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

function formatCurrentAge(intakeDate: Date, ageAtIntakeMonths: number): string {
  const virtualBirth = dayjs(intakeDate).subtract(ageAtIntakeMonths, "month");
  const today = dayjs();
  const months = today.diff(virtualBirth, "month");
  const days = today.diff(virtualBirth.add(months, "month"), "day");

  const monthPart = `${months} ${months === 1 ? "mês" : "meses"}`;
  const dayPart = `${days} ${days === 1 ? "dia" : "dias"}`;

  if (months === 0) return dayPart;
  if (days === 0) return monthPart;
  return `${monthPart} e ${dayPart}`;
}

interface BatchRowProps {
  batch: BirdBatchWithAge;
  warehouseId: string;
  warehouseName: string;
}

export function BatchRow({ batch, warehouseId, warehouseName }: BatchRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteAction = useAction(deleteBirdBatch, {
    onSuccess: () => toast.success("Lote removido."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao remover lote."),
  });

  return (
    <>
      <TableRow className="bg-muted/30 hover:bg-muted/50">
        <TableCell className="pl-12 font-medium">{batch.name}</TableCell>
        <TableCell>{batch.quantity.toLocaleString("pt-BR")} aves</TableCell>
        <TableCell>
          {new Date(batch.intakeDate).toLocaleDateString("pt-BR")}
        </TableCell>
        <TableCell>{formatIntakeAge(batch.ageAtIntakeMonths)}</TableCell>
        <TableCell>
          <Badge variant="secondary">
            {formatCurrentAge(batch.intakeDate, batch.ageAtIntakeMonths)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full" align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar Lote
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Lote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <UpsertBatchDialog
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          warehouseId={warehouseId}
          warehouseName={warehouseName}
          batch={batch}
        />
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover lote?</AlertDialogTitle>
            <AlertDialogDescription>
              O lote <strong>{batch.name}</strong> será removido
              permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAction.execute({ id: batch.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
