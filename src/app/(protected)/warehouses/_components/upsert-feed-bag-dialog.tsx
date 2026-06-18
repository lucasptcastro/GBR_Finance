"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertFeedBag } from "@/actions/upsert-feed-bag";
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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { FeedBag } from "../_data/get-warehouses";

interface UpsertFeedBagDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  warehouseId: string;
  warehouseName: string;
  feedBag?: FeedBag;
}

const formSchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  date: z.string().min(1, "Data é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

export function UpsertFeedBagDialog({
  isOpen,
  setIsOpen,
  warehouseId,
  warehouseName,
  feedBag,
}: UpsertFeedBagDialogProps) {
  const isEditing = Boolean(feedBag?.id);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const defaultValues = (): FormData => ({
    id: feedBag?.id,
    warehouseId,
    quantity: feedBag?.quantity ?? 1,
    date: feedBag?.date
      ? format(new Date(feedBag.date), "yyyy-MM-dd")
      : todayStr,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  });

  const upsertAction = useAction(upsertFeedBag, {
    onSuccess: () => {
      toast.success(isEditing ? "Ração atualizada." : "Ração cadastrada.");
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
        error.serverError ?? "Erro ao salvar ração. Tente novamente.",
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, feedBag, warehouseId]);

  const onSubmit = (values: FormData) =>
    upsertAction.execute({
      ...values,
      date: new Date(values.date + "T00:00:00"),
    });

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const first = Object.values(errors).find((e) => e?.message);
    toast.error(first?.message ?? "Preencha todos os campos obrigatórios.");
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Ração" : "Adicionar Ração"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Atualizando registro de ração no ${warehouseName}.`
            : `Registre sacos de ração para o ${warehouseName}.`}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
      >
        <Field data-invalid={!!form.formState.errors.quantity}>
          <FieldLabel>Quantidade de Sacos</FieldLabel>
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

        <Field data-invalid={!!form.formState.errors.date}>
          <FieldLabel>Data de Entrada</FieldLabel>
          <Input
            type="date"
            {...form.register("date")}
            aria-invalid={!!form.formState.errors.date}
          />
          {form.formState.errors.date && (
            <FieldError errors={[form.formState.errors.date]} />
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
