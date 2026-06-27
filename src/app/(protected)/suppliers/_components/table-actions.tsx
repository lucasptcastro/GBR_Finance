"use client";

import {
  Loader2,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deletePeople } from "@/actions/delete-people";
import { deletePerson } from "@/actions/delete-person";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { peopleTable } from "@/db/schema";

import { UpsertSupplierDialog } from "./upsert-supplier-dialog";

interface SuppliersTableActionsProps {
  supplier: typeof peopleTable.$inferSelect;
  selectedIds?: string[];
}

export const SuppliersTableActions = ({
  supplier,
  selectedIds,
}: SuppliersTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteSupplierAction = useAction(deletePerson, {
    onSuccess: () => {
      toast.success("Fornecedor deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar fornecedor.");
    },
  });

  const deleteSuppliersAction = useAction(deletePeople, {
    onSuccess: () => {
      toast.success("Fornecedores deletados com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar fornecedores.");
    },
  });

  const handleDeleteSupplierClick = () => {
    if (selectedIds && selectedIds.length > 0) {
      deleteSuppliersAction.execute({ ids: selectedIds, category: "supplier" });
      return;
    }

    if (!supplier) return;
    deleteSupplierAction.execute({ id: supplier.id, category: "supplier" });
  };

  const hasMoreThanOneSelected = selectedIds && selectedIds.length > 1;
  const isDeleting =
    deleteSupplierAction.isPending || deleteSuppliersAction.isPending;

  return (
    <>
      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{supplier.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setUpsertDialogIsOpen(true)}
              disabled={hasMoreThanOneSelected}
            >
              <PencilIcon />
              Edição rápida
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {isDeleting ? (
                    <div className="flex w-full items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    <>
                      <TrashIcon />
                      Excluir
                    </>
                  )}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {selectedIds && selectedIds.length > 0
                      ? "Tem certeza que deseja deletar os fornecedores selecionados?"
                      : "Tem certeza que deseja deletar esse fornecedor?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar o
                    fornecedor permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSupplierClick}
                    asChild
                  >
                    <Button
                      type="submit"
                      disabled={isDeleting}
                      className="gap-1"
                    >
                      {isDeleting && <Loader2 className="animate-spin" />}
                      Deletar
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpsertSupplierDialog
          isOpen={upsertDialogIsOpen}
          supplier={supplier}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};
