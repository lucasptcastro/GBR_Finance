"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertBirdBatch } from "@/actions/upsert-bird-batch";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { BirdBatchWithAge } from "../_data/get-warehouses";

interface UpsertBatchDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  warehouseId: string;
  warehouseName: string;
  batch?: BirdBatchWithAge;
}

const formSchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  name: z.string().min(1, "Nome do lote é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  intakeDate: z.string().min(1, "Data de entrada é obrigatória"),
  ageAtIntakeMonths: z.number().min(0, "Idade não pode ser negativa"),
});

type FormData = z.infer<typeof formSchema>;

export function UpsertBatchDialog({
  isOpen,
  setIsOpen,
  warehouseId,
  warehouseName,
  batch,
}: UpsertBatchDialogProps) {
  const isEditing = Boolean(batch?.id);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const defaultValues = (): FormData => ({
    id: batch?.id,
    warehouseId,
    name: batch?.name ?? "",
    quantity: batch?.quantity ?? 1,
    // input type="date" trabalha com string "yyyy-MM-dd"
    intakeDate: batch?.intakeDate
      ? format(new Date(batch.intakeDate), "yyyy-MM-dd")
      : todayStr,
    ageAtIntakeMonths: batch?.ageAtIntakeMonths ?? 0,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  });

  const upsertAction = useAction(upsertBirdBatch, {
    onSuccess: () => {
      toast.success(isEditing ? "Lote atualizado." : "Lote cadastrado.");
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
      toast.error(error.serverError ?? "Erro ao salvar lote. Tente novamente.");
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, batch, warehouseId]);

  const onSubmit = (values: FormData) =>
    upsertAction.execute({
      ...values,
      intakeDate: new Date(values.intakeDate + "T00:00:00"),
    });

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const first = Object.values(errors).find((e) => e?.message);
    toast.error(first?.message ?? "Preencha todos os campos obrigatórios.");
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Lote" : "Novo Lote de Aves"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Atualizando lote no ${warehouseName}.`
            : `Cadastre um novo lote de aves para o ${warehouseName}.`}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
      >
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Nome do Lote</FieldLabel>
          <Input
            placeholder="Ex.: Lote Maio 2025"
            {...form.register("name")}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>

        <FieldGroup className="grid grid-cols-2 gap-4 w-full">
          <Field data-invalid={!!form.formState.errors.quantity}>
            <FieldLabel>Quantidade de Aves</FieldLabel>
            <Input
              type="number"
              min={1}
              placeholder="0"
              {...form.register("quantity", { valueAsNumber: true })}
              aria-invalid={!!form.formState.errors.quantity}
            />
            {form.formState.errors.quantity && (
              <FieldError errors={[form.formState.errors.quantity]} />
            )}
          </Field>

          <Field data-invalid={!!form.formState.errors.ageAtIntakeMonths}>
            <FieldLabel>Idade na Entrada (meses)</FieldLabel>
            <Input
              type="number"
              min={0}
              placeholder="0"
              {...form.register("ageAtIntakeMonths", { valueAsNumber: true })}
              aria-invalid={!!form.formState.errors.ageAtIntakeMonths}
            />
            {form.formState.errors.ageAtIntakeMonths && (
              <FieldError errors={[form.formState.errors.ageAtIntakeMonths]} />
            )}
          </Field>
        </FieldGroup>

        <Field data-invalid={!!form.formState.errors.intakeDate}>
          <FieldLabel>Data de Entrada</FieldLabel>
          <Input
            type="date"
            {...form.register("intakeDate")}
            aria-invalid={!!form.formState.errors.intakeDate}
          />
          {form.formState.errors.intakeDate && (
            <FieldError errors={[form.formState.errors.intakeDate]} />
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
