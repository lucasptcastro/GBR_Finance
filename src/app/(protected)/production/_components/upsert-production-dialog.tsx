"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertEggProduction } from "@/actions/upsert-egg-production";
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

import type { EggProductionDisplayRow } from "../_data/get-egg-production";

interface UpsertProductionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Undefined = nova produção sem data pré-selecionada (botão "Nova Produção"). */
  record?: EggProductionDisplayRow;
}

const formSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.date(),
  traysProduced: z.coerce.number().int().min(0),
  eggsLeftover: z.coerce.number().int().min(0),
  crackedEggs: z.coerce.number().int().min(0),
  feedUsed: z.coerce.number().int().min(0),
  deadBirds: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof formSchema>;

export function UpsertProductionDialog({
  isOpen,
  setIsOpen,
  record,
}: UpsertProductionDialogProps) {
  const form = useForm<FormData>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: record?.id,
      date: record?.date ?? new Date(),
      traysProduced: record?.traysProduced ?? 0,
      eggsLeftover: record?.eggsLeftover ?? 0,
      crackedEggs: record?.crackedEggs ?? 0,
      feedUsed: record?.feedUsed ?? 0,
      deadBirds: record?.deadBirds ?? 0,
    },
  });

  const upsertAction = useAction(upsertEggProduction, {
    onSuccess: () => {
      toast.success(
        record?.id
          ? "Produção atualizada com sucesso."
          : "Produção cadastrada com sucesso.",
      );
      setIsOpen(false);
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Erro ao salvar produção. Tente novamente.",
      );
    },
  });

  const onSubmit = (values: FormData) => {
    upsertAction.execute(values);
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: record?.id,
        date: record?.date ?? new Date(),
        traysProduced: record?.traysProduced ?? 0,
        eggsLeftover: record?.eggsLeftover ?? 0,
        crackedEggs: record?.crackedEggs ?? 0,
        feedUsed: record?.feedUsed ?? 0,
        deadBirds: record?.deadBirds ?? 0,
      });
    }
  }, [isOpen, record, form]);

  const dateValue = form.watch("date");
  const formattedDate =
    dateValue instanceof Date
      ? dateValue.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  // record is defined = row click (either editing existing or filling a virtual row)
  // record is undefined = "Nova Produção" button (free date selection)
  const isRowClick = record !== undefined;
  const isEditing = Boolean(record?.id);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Produção" : "Nova Produção"}
        </DialogTitle>
        <DialogDescription>
          {isRowClick
            ? `${isEditing ? "Atualizando" : "Cadastrando"} os dados de produção do dia ${formattedDate}`
            : "Cadastre os dados de produção para um novo dia"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isRowClick ? (
          <Field>
            <FieldLabel>Data</FieldLabel>
            <Input value={formattedDate} readOnly className="bg-muted" />
          </Field>
        ) : (
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Data</FieldLabel>
                <Input
                  type="date"
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    field.onChange(new Date(e.target.value + "T00:00:00"))
                  }
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        <FieldGroup className="grid grid-cols-2 gap-4">
          <Controller
            name="traysProduced"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Bandejas Fabricadas</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="eggsLeftover"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Ovos Sobrados</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="crackedEggs"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Ovos Trincados</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="feedUsed"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Rações Usadas</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="deadBirds"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Aves Mortas</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  aria-invalid={fieldState.invalid}
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
