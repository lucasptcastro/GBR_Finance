"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertEggStockAdjustment } from "@/actions/upsert-egg-stock-adjustment";
import type { UpsertEggStockAdjustmentSchema } from "@/actions/upsert-egg-stock-adjustment/schema";
import { upsertEggStockAdjustmentSchema } from "@/actions/upsert-egg-stock-adjustment/schema";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UpsertEggStockAdjustmentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  warehouseId: string;
  warehouseName: string;
}

export function UpsertEggStockAdjustmentDialog({
  isOpen,
  setIsOpen,
  warehouseId,
  warehouseName,
}: UpsertEggStockAdjustmentDialogProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<UpsertEggStockAdjustmentSchema>({
    resolver: zodResolver(upsertEggStockAdjustmentSchema),
    defaultValues: {
      date: todayStr,
      quantity: 0,
      reason: "",
      warehouseId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: todayStr,
        quantity: 0,
        reason: "",
        warehouseId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, warehouseId]);

  const { execute, isPending } = useAction(upsertEggStockAdjustment, {
    onSuccess: () => {
      toast.success("Ajuste de estoque registrado.");
      setIsOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao registrar ajuste.");
    },
  });

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const first = Object.values(errors).find((e) => e?.message);
    toast.error(first?.message ?? "Preencha todos os campos obrigatórios.");
  };

  return (
    <DialogContent className="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>Ajuste de estoque — {warehouseName}</DialogTitle>
        <DialogDescription>
          Use valores positivos para entrada de bandejas (ex: saldo inicial) e
          negativos para saída.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit((d) => execute(d), onInvalid)}
        className="space-y-4"
      >
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.date}>
              <FieldLabel>Data</FieldLabel>
              <Input
                type="date"
                {...form.register("date")}
                aria-invalid={!!form.formState.errors.date}
              />
              {form.formState.errors.date && (
                <FieldError errors={[form.formState.errors.date]} />
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.quantity}>
              <FieldLabel>Quantidade de bandejas</FieldLabel>
              <Input
                type="number"
                placeholder="Ex: 100 ou -20"
                {...form.register("quantity", { valueAsNumber: true })}
                aria-invalid={!!form.formState.errors.quantity}
              />
              {form.formState.errors.quantity && (
                <FieldError errors={[form.formState.errors.quantity]} />
              )}
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.reason}>
            <FieldLabel>Motivo (opcional)</FieldLabel>
            <Textarea
              placeholder="Ex: Saldo inicial ao implantar o sistema"
              {...form.register("reason")}
              aria-invalid={!!form.formState.errors.reason}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Salvando..." : "Salvar ajuste"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
