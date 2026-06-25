"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { UpsertBankAccountDialog } from "./upsert-bank-account-dialog";

export const AddBankAccountButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-md font-bold text-white">
            Adicionar conta bancária
            <ArrowDownUpIcon />
          </Button>
        </DialogTrigger>
        <UpsertBankAccountDialog
          isOpen={isOpen}
          onSuccess={() => setIsOpen(false)}
        />
      </Dialog>
    </>
  );
};
