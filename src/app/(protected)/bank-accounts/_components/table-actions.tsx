"use client";

import { Loader2, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteBankAccount } from "@/actions/delete-bank-account";
import { deleteBankAccounts } from "@/actions/delete-bank-accounts";
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
import { bankAccountsTable } from "@/db/schema";

import { UpsertBankAccountDialog } from "./upsert-bank-account-dialog";

interface BankAccountsTableActionsProps {
  bankAccount: typeof bankAccountsTable.$inferSelect;
  selectedIds?: string[];
}

export const BankAccountsTableActions = ({
  bankAccount,
  selectedIds,
}: BankAccountsTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteBankAccountAction = useAction(deleteBankAccount, {
    onSuccess: () => {
      toast.success("Conta bancária deletada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar conta bancária.");
    },
  });

  const deleteBankAccountsAction = useAction(deleteBankAccounts, {
    onSuccess: () => {
      toast.success("Contas bancárias deletadas com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar contas bancárias.");
    },
  });

  const handleDeleteBankAccountClick = () => {
    if (selectedIds && selectedIds.length > 0) {
      deleteBankAccountsAction.execute({ ids: selectedIds });
      return;
    }

    if (!bankAccount) return;
    deleteBankAccountAction.execute({ bankAccountId: bankAccount.id });
  };

  const hasMoreThanOneBankAccountSelected =
    selectedIds && selectedIds.length > 1;

  return (
    <>
      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{bankAccount.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setUpsertDialogIsOpen(true)}
              disabled={hasMoreThanOneBankAccountSelected}
            >
              <PencilIcon />
              Editar
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {deleteBankAccountsAction.isPending ||
                  deleteBankAccountAction.isPending ? (
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
                      ? `Tem certeza que deseja deletar ${selectedIds.length} contas bancárias?`
                      : "Tem certeza que deseja deletar essa conta?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar
                    {selectedIds && selectedIds.length > 0
                      ? " as contas bancárias selecionadas permanentemente."
                      : " a conta bancária permanentemente."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteBankAccountClick}
                    asChild
                  >
                    <Button variant="destructive">
                      {deleteBankAccountsAction.isPending ||
                      deleteBankAccountAction.isPending ? (
                        <div className="flex w-full items-center justify-center">
                          <Loader2 className="animate-spin" />
                        </div>
                      ) : (
                        <>
                          <TrashIcon />
                          Excluir
                        </>
                      )}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpsertBankAccountDialog
          isOpen={upsertDialogIsOpen}
          bankAccount={bankAccount}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};
