"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { UpsertSupplierDialog } from "./upsert-supplier-dialog";

export const AddSupplierButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-md font-bold text-white">
            Adicionar fornecedor
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <UpsertSupplierDialog
          isOpen={isOpen}
          onSuccess={() => setIsOpen(false)}
        />
      </Dialog>
    </>
  );
};
