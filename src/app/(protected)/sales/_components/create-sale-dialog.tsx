"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createSale } from "@/actions/create-sale";
import type { CreateSaleSchema } from "@/actions/create-sale/schema";
import { createSaleSchema } from "@/actions/create-sale/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface SaleFormData {
  customers: { id: string; name: string; nickname: string | null }[];
  warehouses: { id: string; name: string }[];
  bankAccounts: { id: string; name: string; color: string }[];
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_slip: "Boleto bancário",
  crediary: "Crediário",
};

interface CreateSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: SaleFormData;
}

export function CreateSaleDialog({
  open,
  onOpenChange,
  formData,
}: CreateSaleDialogProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<CreateSaleSchema>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      date: todayStr,
      traysSold: 1,
      pricePerTrayInCents: 0,
      paymentMethod: "pix",
      notes: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const isCrediary = paymentMethod === "crediary";

  const { execute, isPending } = useAction(createSale, {
    onSuccess: () => {
      toast.success("Venda registrada com sucesso!");
      onOpenChange(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao registrar venda");
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        date: todayStr,
        traysSold: 1,
        pricePerTrayInCents: 0,
        paymentMethod: "pix",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(data: CreateSaleSchema) {
    execute(data);
  }

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const first = Object.values(errors).find((e) => e?.message);
    toast.error(first?.message ?? "Preencha todos os campos obrigatórios.");
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[580px]">
      <DialogHeader>
        <DialogTitle>Nova venda</DialogTitle>
        <DialogDescription>
          Registre uma venda de bandejas de ovos.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
      >
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.date}>
              <FieldLabel>Data da venda</FieldLabel>
              <Input
                type="date"
                {...form.register("date")}
                aria-invalid={!!form.formState.errors.date}
              />
              {form.formState.errors.date && (
                <FieldError errors={[form.formState.errors.date]} />
              )}
            </Field>

            <Controller
              name="warehouseId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Galpão</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione o galpão" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="customerId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Cliente</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.nickname ? ` (${c.nickname})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.traysSold}>
              <FieldLabel>Quantidade de bandejas</FieldLabel>
              <Input
                type="number"
                min={1}
                placeholder="0"
                {...form.register("traysSold", { valueAsNumber: true })}
                aria-invalid={!!form.formState.errors.traysSold}
              />
              {form.formState.errors.traysSold && (
                <FieldError errors={[form.formState.errors.traysSold]} />
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.pricePerTrayInCents}>
              <FieldLabel>Preço por bandeja (R$)</FieldLabel>
              <Controller
                name="pricePerTrayInCents"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      aria-invalid={fieldState.invalid}
                      value={field.value / 100}
                      onChange={(e) =>
                        field.onChange(
                          Math.round(
                            parseFloat(e.target.value || "0") * 100,
                          ),
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </>
                )}
              />
            </Field>
          </div>

          <Controller
            name="paymentMethod"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Forma de pagamento</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {!isCrediary && (
            <Controller
              name="bankAccountId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Conta bancária</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.bankAccounts.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          <span
                            className="mr-2 inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: b.color }}
                          />
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {isCrediary && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              No crediário, o pagamento será registrado posteriormente. O
              cliente ficará com o saldo em aberto até a quitação.
            </div>
          )}

          <Field data-invalid={!!form.formState.errors.notes}>
            <FieldLabel>Observações (opcional)</FieldLabel>
            <Textarea
              placeholder="Observações adicionais"
              {...form.register("notes")}
              aria-invalid={!!form.formState.errors.notes}
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
            {isPending ? "Registrando..." : "Registrar venda"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
