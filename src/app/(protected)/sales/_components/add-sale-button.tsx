"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PlusIcon } from "@phosphor-icons/react";

import { CreateSaleDialog } from "./create-sale-dialog";
import type { SaleFormData } from "./create-sale-dialog";

interface AddSaleButtonProps {
  formData: SaleFormData;
}

export function AddSaleButton({ formData }: AddSaleButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon />
        Nova venda
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <CreateSaleDialog
          open={open}
          onOpenChange={setOpen}
          formData={formData}
        />
      </Dialog>
    </>
  );
}
