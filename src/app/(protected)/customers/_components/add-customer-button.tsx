"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { UpsertCustomerDialog } from "./upsert-customer-dialog";

export const AddCustomerButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-md font-bold text-white">
            Adicionar cliente
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <UpsertCustomerDialog
          isOpen={isOpen}
          onSuccess={() => setIsOpen(false)}
        />
      </Dialog>
    </>
  );
};
