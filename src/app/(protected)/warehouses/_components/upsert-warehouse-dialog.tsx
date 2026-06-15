"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertWarehouse } from "@/actions/upsert-warehouse";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { WarehouseWithBatches } from "../_data/get-warehouses";

interface UpsertWarehouseDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  warehouse?: WarehouseWithBatches;
}

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome do galpão é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export function UpsertWarehouseDialog({
  isOpen,
  setIsOpen,
  warehouse,
}: UpsertWarehouseDialogProps) {
  const isEditing = Boolean(warehouse?.id);

  const form = useForm<FormData>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: warehouse?.id,
      name: warehouse?.name ?? "",
    },
  });

  const upsertAction = useAction(upsertWarehouse, {
    onSuccess: () => {
      toast.success(isEditing ? "Galpão atualizado." : "Galpão cadastrado.");
      setIsOpen(false);
    },
    onError: ({ error }) => {
      if (error.validationErrors) {
        const messages = Object.values(error.validationErrors)
          .flatMap((v) => (Array.isArray(v) ? v : []))
          .filter(Boolean)
          .join(", ");
        toast.error(messages || "Dados inválidos. Verifique os campos.");
        return;
      }
      toast.error(
        error.serverError ?? "Erro ao salvar galpão. Tente novamente.",
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ id: warehouse?.id, name: warehouse?.name ?? "" });
    }
  }, [isOpen, warehouse, form]);

  const onSubmit = (values: FormData) => upsertAction.execute(values);

  const onInvalid = () => {
    toast.error("Preencha todos os campos obrigatórios antes de continuar.");
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Galpão" : "Novo Galpão"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Atualize o nome do galpão."
            : "Cadastre um novo galpão para vincular lotes de aves."}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
      >
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Nome do Galpão</FieldLabel>
          <Input
            placeholder="Ex.: Galpão 1"
            {...form.register("name")}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={upsertAction.isPending}>
            {isEditing ? "Atualizar" : "Cadastrar"}
            {upsertAction.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
