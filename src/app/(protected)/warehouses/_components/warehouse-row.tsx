"use client";

import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteWarehouse } from "@/actions/delete-warehouse";
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

import type { WarehouseWithBatches } from "../_data/get-warehouses";
import { BatchRow } from "./batch-row";
import { FeedBagRow } from "./feed-bag-row";
import { UpsertBatchDialog } from "./upsert-batch-dialog";
import { UpsertFeedBagDialog } from "./upsert-feed-bag-dialog";
import { UpsertWarehouseDialog } from "./upsert-warehouse-dialog";

interface WarehouseRowProps {
  warehouse: WarehouseWithBatches;
}

export function WarehouseRow({ warehouse }: WarehouseRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [addFeedBagOpen, setAddFeedBagOpen] = useState(false);

  const deleteAction = useAction(deleteWarehouse, {
    onSuccess: () => toast.success("Galpão removido."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao remover galpão."),
  });

  const totalFeedBags = warehouse.feedBags.reduce(
    (sum, fb) => sum + fb.quantity,
    0,
  );

  return (
    <>
      <TableRow className="font-semibold hover:bg-muted/40">
        <TableCell>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-left"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            {warehouse.name}
          </button>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {warehouse.batches.length}{" "}
          {warehouse.batches.length === 1 ? "lote" : "lotes"}
          {totalFeedBags > 0 && (
            <span className="ml-2">
              · {totalFeedBags.toLocaleString("pt-BR")} sacos
            </span>
          )}
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full" align="end">
              <DropdownMenuItem onClick={() => setAddBatchOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Lote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddFeedBagOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Ração
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar Galpão
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Galpão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {expanded &&
        warehouse.batches.map((batch) => (
          <BatchRow
            key={batch.id}
            batch={batch}
            warehouseId={warehouse.id}
            warehouseName={warehouse.name}
          />
        ))}

      {expanded &&
        warehouse.feedBags.map((feedBag) => (
          <FeedBagRow
            key={feedBag.id}
            feedBag={feedBag}
            warehouseId={warehouse.id}
            warehouseName={warehouse.name}
          />
        ))}

      {expanded &&
        warehouse.batches.length === 0 &&
        warehouse.feedBags.length === 0 && (
          <TableRow className="bg-muted/10">
            <TableCell
              colSpan={6}
              className="text-muted-foreground pl-12 text-sm italic"
            >
              Nenhum lote ou ração cadastrada neste galpão.
            </TableCell>
          </TableRow>
        )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <UpsertWarehouseDialog
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          warehouse={warehouse}
        />
      </Dialog>

      <Dialog open={addBatchOpen} onOpenChange={setAddBatchOpen}>
        <UpsertBatchDialog
          isOpen={addBatchOpen}
          setIsOpen={setAddBatchOpen}
          warehouseId={warehouse.id}
          warehouseName={warehouse.name}
        />
      </Dialog>

      <Dialog open={addFeedBagOpen} onOpenChange={setAddFeedBagOpen}>
        <UpsertFeedBagDialog
          isOpen={addFeedBagOpen}
          setIsOpen={setAddFeedBagOpen}
          warehouseId={warehouse.id}
          warehouseName={warehouse.name}
        />
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover galpão?</AlertDialogTitle>
            <AlertDialogDescription>
              O galpão <strong>{warehouse.name}</strong> e todos os seus lotes
              serão removidos permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAction.execute({ id: warehouse.id })}
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
