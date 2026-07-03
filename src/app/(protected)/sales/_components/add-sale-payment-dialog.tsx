"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { addSalePayment } from "@/actions/add-sale-payment";
import type { AddSalePaymentSchema } from "@/actions/add-sale-payment/schema";
import { addSalePaymentSchema } from "@/actions/add-sale-payment/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_slip: "Boleto bancário",
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

interface AddSalePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string;
  invoiceNumber: number;
  totalAmountInCents: number;
  paidAmountInCents: number;
  bankAccounts: { id: string; name: string; color: string }[];
}

export function AddSalePaymentDialog({
  open,
  onOpenChange,
  saleId,
  invoiceNumber,
  totalAmountInCents,
  paidAmountInCents,
  bankAccounts,
}: AddSalePaymentDialogProps) {
  const remainingInCents = totalAmountInCents - paidAmountInCents;
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<AddSalePaymentSchema>({
    resolver: zodResolver(addSalePaymentSchema),
    defaultValues: {
      saleId,
      paymentDate: todayStr,
      paymentMethod: "pix",
      amountInCents: remainingInCents,
    },
  });

  const { execute, isPending } = useAction(addSalePayment, {
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso!");
      onOpenChange(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao registrar pagamento");
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        saleId,
        paymentDate: todayStr,
        paymentMethod: "pix",
        amountInCents: remainingInCents,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saleId, remainingInCents]);

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const first = Object.values(errors).find((e) => e?.message);
    toast.error(first?.message ?? "Preencha todos os campos obrigatórios.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Registrar pagamento — NF #{invoiceNumber}</DialogTitle>
          <DialogDescription>
            Total: {formatCurrency(totalAmountInCents)} · Pago:{" "}
            {formatCurrency(paidAmountInCents)} · Restante:{" "}
            {formatCurrency(remainingInCents)}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((d) => execute(d), onInvalid)}
          className="space-y-4"
        >
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!form.formState.errors.paymentDate}>
                <FieldLabel>Data do pagamento</FieldLabel>
                <Input
                  type="date"
                  {...form.register("paymentDate")}
                  aria-invalid={!!form.formState.errors.paymentDate}
                />
                {form.formState.errors.paymentDate && (
                  <FieldError errors={[form.formState.errors.paymentDate]} />
                )}
              </Field>

              <Field data-invalid={!!form.formState.errors.amountInCents}>
                <FieldLabel>Valor (R$)</FieldLabel>
                <Controller
                  name="amountInCents"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        max={remainingInCents / 100}
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
                      {bankAccounts.map((b) => (
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

            <Field data-invalid={!!form.formState.errors.notes}>
              <FieldLabel>Observações (opcional)</FieldLabel>
              <Textarea
                placeholder="Observações"
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
              {isPending ? "Registrando..." : "Registrar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
