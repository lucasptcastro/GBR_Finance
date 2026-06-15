"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import { UpsertWarehouseDialog } from "./upsert-warehouse-dialog";

export function AddWarehouseButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Galpão
      </Button>
      <UpsertWarehouseDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </Dialog>
  );
}
