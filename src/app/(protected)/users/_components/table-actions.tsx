"use client";

import { EditIcon, Loader2, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteUser } from "@/actions/delete-user";
import { deleteUsers } from "@/actions/delete-users";
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
import { rolesTable, userTable } from "@/db/schema";

import { UpsertUserDialog } from "./upsert-user-dialog";

interface UsersTableActionsProps {
  user?: typeof userTable.$inferSelect;
  selectedIds?: string[];
  roles: (typeof rolesTable.$inferSelect)[];
}

export const UsersTableActions = ({
  user,
  selectedIds,
  roles,
}: UsersTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteUserAction = useAction(deleteUser, {
    onSuccess: () => {
      toast.success("Usuário deletado com sucesso.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao deletar usuário.");
    },
  });

  const deleteUsersAction = useAction(deleteUsers, {
    onSuccess: () => {
      toast.success("Usuários deletados com sucesso.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao deletar usuários.");
    },
  });

  const handleDeleteUserClick = () => {
    if (selectedIds && selectedIds.length > 0) {
      deleteUsersAction.execute({ ids: selectedIds });
      return;
    }

    if (!user) return;
    deleteUserAction.execute({ userId: user.id });
  };

  const hasMoreThanOneUserSelected = selectedIds && selectedIds.length > 1;

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
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setUpsertDialogIsOpen(true)}
              disabled={hasMoreThanOneUserSelected}
            >
              <EditIcon />
              Editar
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {deleteUsersAction.isPending || deleteUserAction.isPending ? (
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
                      ? `Tem certeza que deseja deletar ${selectedIds.length} usuários?`
                      : "Tem certeza que deseja deletar esse usuário?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar
                    {selectedIds && selectedIds.length > 0
                      ? " os usuários selecionados e todas as suas transações e contas a pagar."
                      : " o usuário e todas as suas transações e contas a pagar."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUserClick} asChild>
                    <Button variant="destructive">
                      {deleteUsersAction.isPending ||
                      deleteUserAction.isPending ? (
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

        <UpsertUserDialog
          isOpen={upsertDialogIsOpen}
          setIsOpen={setUpsertDialogIsOpen}
          roles={roles}
          user={user}
        />
      </Dialog>
    </>
  );
};
