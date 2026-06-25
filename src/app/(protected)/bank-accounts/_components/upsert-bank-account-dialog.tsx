"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertBankAccount } from "@/actions/upsert-bank-account";
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
import { bankAccountsTable } from "@/db/schema";

interface UpsertBankAccountDialogProps {
  isOpen: boolean;
  onSuccess?: () => void;
  bankAccount?: typeof bankAccountsTable.$inferSelect;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Cor inválida.",
  }),
  dueDay: z.number().int().min(1).max(28).optional(),
  currentBalanceInCents: z.number().int(),
});

type FormData = z.infer<typeof formSchema>;

export const UpsertBankAccountDialog = ({
  isOpen,
  onSuccess,
  bankAccount,
}: UpsertBankAccountDialogProps) => {
  const form = useForm<FormData>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bankAccount?.name ?? "",
      color: bankAccount?.color ?? "#3b82f6",
      dueDay: bankAccount?.dueDay ?? undefined,
      currentBalanceInCents: bankAccount?.currentBalanceInCents ?? 0,
    },
  });

  const upsertBankAccountAction = useAction(upsertBankAccount, {
    onSuccess: () => {
      toast.success(
        bankAccount
          ? "Conta bancária atualizada com sucesso"
          : "Conta bancária adicionada com sucesso",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao adicionar a conta bancária. Tente novamente.");
    },
  });

  const onSubmit = (values: FormData) => {
    upsertBankAccountAction.execute({
      ...values,
      id: bankAccount?.id,
    });
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: bankAccount?.name ?? "",
        color: bankAccount?.color ?? "#3b82f6",
        dueDay: bankAccount?.dueDay ?? undefined,
        currentBalanceInCents: bankAccount?.currentBalanceInCents ?? 0,
      });
    }
  }, [isOpen, bankAccount, form]);

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {bankAccount
              ? "Atualizar Conta Bancária"
              : "Adicionar Conta Bancária"}
          </DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nome do Banco</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Digite o nome do banco..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="color"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Cor</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="h-10 w-20 cursor-pointer"
                      type="color"
                    />
                    <Input
                      type="text"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
                      placeholder="#3b82f6"
                      maxLength={7}
                      className="flex-1"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="dueDay"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Dia de Vencimento (cartão de crédito){" "}
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    type="number"
                    placeholder="Ex: 10"
                    min={1}
                    max={28}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value, 10) : undefined);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="currentBalanceInCents"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Saldo Atual (R$)</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    type="number"
                    placeholder="Ex: 1500,00"
                    min={0}
                    step={0.01}
                    value={field.value / 100}
                    onChange={(e) => {
                      const reais = parseFloat(e.target.value);
                      field.onChange(
                        isNaN(reais) ? 0 : Math.round(reais * 100),
                      );
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant={"outline"}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={upsertBankAccountAction.isPending}
              className="gap-1"
            >
              {upsertBankAccountAction.isPending && (
                <Loader2 className="animate-spin" />
              )}
              {bankAccount ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
};
