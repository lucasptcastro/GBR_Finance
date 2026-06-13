"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import { UpsertProductionDialog } from "./upsert-production-dialog";

export function AddProductionButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Button onClick={() => setDialogOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Nova Produção
      </Button>

      <UpsertProductionDialog isOpen={dialogOpen} setIsOpen={setDialogOpen} />
    </Dialog>
  );
}
