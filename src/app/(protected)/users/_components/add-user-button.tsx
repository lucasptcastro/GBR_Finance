"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { rolesTable } from "@/db/schema";

import { UpsertUserDialog } from "./upsert-user-dialog";

interface AddUserButtonProps {
  roles: (typeof rolesTable.$inferSelect)[];
}

export const AddUserButton = ({ roles }: AddUserButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <Button
          onClick={() => setDialogIsOpen(true)}
          className="rounded-md font-medium text-white"
        >
          Adicionar usuário
          <PlusIcon />
        </Button>

        <UpsertUserDialog
          isOpen={dialogIsOpen}
          setIsOpen={setDialogIsOpen}
          roles={roles}
        />
      </Dialog>
    </>
  );
};
