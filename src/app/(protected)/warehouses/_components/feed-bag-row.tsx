"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteFeedBag } from "@/actions/delete-feed-bag";
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

import type { FeedBag } from "../_data/get-warehouses";
import { UpsertFeedBagDialog } from "./upsert-feed-bag-dialog";

interface FeedBagRowProps {
  feedBag: FeedBag;
  warehouseId: string;
  warehouseName: string;
}

export function FeedBagRow({
  feedBag,
  warehouseId,
  warehouseName,
}: FeedBagRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteAction = useAction(deleteFeedBag, {
    onSuccess: () => toast.success("Ração removida."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao remover ração."),
  });

  return (
    <>
      <TableRow className="bg-muted/30 hover:bg-muted/50">
        <TableCell className="pl-12 font-medium text-muted-foreground italic">
          Ração
        </TableCell>
        <TableCell>{feedBag.quantity.toLocaleString("pt-BR")} sacos</TableCell>
        <TableCell>
          {new Date(feedBag.date).toLocaleDateString("pt-BR")}
        </TableCell>
        <TableCell />
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
                Editar Ração
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Ração
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <UpsertFeedBagDialog
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          warehouseId={warehouseId}
          warehouseName={warehouseName}
          feedBag={feedBag}
        />
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover ração?</AlertDialogTitle>
            <AlertDialogDescription>
              Este registro de{" "}
              <strong>
                {feedBag.quantity.toLocaleString("pt-BR")} sacos
              </strong>{" "}
              será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAction.execute({ id: feedBag.id })}
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
