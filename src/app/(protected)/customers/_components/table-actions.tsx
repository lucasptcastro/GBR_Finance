"use client";

import {
  EyeIcon,
  Loader2,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
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

import { UpsertCustomerDialog } from "./upsert-customer-dialog";

interface CustomersTableActionsProps {
  customer: typeof peopleTable.$inferSelect;
  selectedIds?: string[];
}

export const CustomersTableActions = ({
  customer,
  selectedIds,
}: CustomersTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteCustomerAction = useAction(deletePerson, {
    onSuccess: () => {
      toast.success("Cliente deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar cliente.");
    },
  });

  const deleteCustomersAction = useAction(deletePeople, {
    onSuccess: () => {
      toast.success("Clientes deletados com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar clientes.");
    },
  });

  const handleDeleteCustomerClick = () => {
    if (selectedIds && selectedIds.length > 0) {
      deleteCustomersAction.execute({ ids: selectedIds, category: "customer" });
      return;
    }

    if (!customer) return;
    deleteCustomerAction.execute({ id: customer.id, category: "customer" });
  };

  const hasMoreThanOneSelected = selectedIds && selectedIds.length > 1;
  const isDeleting =
    deleteCustomerAction.isPending || deleteCustomersAction.isPending;

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
            <DropdownMenuLabel>{customer.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hasMoreThanOneSelected ? (
              <DropdownMenuItem disabled>
                <EyeIcon size={16} />
                Visualizar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center gap-2"
                >
                  <EyeIcon size={16} />
                  Visualizar
                </Link>
              </DropdownMenuItem>
            )}
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
                      ? "Tem certeza que deseja deletar os clientes selecionados?"
                      : "Tem certeza que deseja deletar esse cliente?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar o cliente
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCustomerClick}
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

        <UpsertCustomerDialog
          isOpen={upsertDialogIsOpen}
          customer={customer}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};
