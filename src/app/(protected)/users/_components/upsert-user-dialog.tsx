"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { upsertUser } from "@/actions/upsert-user";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rolesTable, userTable } from "@/db/schema";

interface UpsertUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  roles: (typeof rolesTable.$inferSelect)[];
  user?: typeof userTable.$inferSelect;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  email: z.email("E-mail inválido"),
  image: z.string().optional(),
  roleId: z.string().min(1, "Selecione um perfil"),
});

type FormData = z.infer<typeof formSchema>;

export const UpsertUserDialog = ({
  isOpen,
  setIsOpen,
  roles,
  user,
}: UpsertUserDialogProps) => {
  const defaultRoleId =
    user?.roleId ?? roles.find((r) => r.slug === "member")?.id ?? "";

  const form = useForm<FormData>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      image: user?.image ?? "",
      roleId: user?.roleId ?? defaultRoleId,
    },
  });

  const upsertUserAction = useAction(upsertUser, {
    onSuccess: () => {
      toast.success(
        user?.id
          ? "Usuário atualizado com sucesso"
          : "Usuário adicionado com sucesso",
      );
      setIsOpen(false);
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Erro ao salvar usuário. Tente novamente.",
      );
    },
  });

  const onSubmit = (values: FormData) => {
    upsertUserAction.execute({
      ...values,
      id: user?.id,
      image: values.image || null,
    });
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        image: user?.image ?? "",
        roleId: user?.roleId ?? defaultRoleId,
      });
    }
  }, [isOpen, user, form, defaultRoleId]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {user?.id ? "Editar Usuário" : "Adicionar Usuário"}
        </DialogTitle>
        <DialogDescription>
          {user?.id
            ? "Edite as informações do usuário abaixo"
            : "Adicione um novo usuário ao sistema"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  placeholder="Digite o nome do usuário..."
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

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>E-mail</FieldLabel>
              <Input
                type="email"
                placeholder="Digite o e-mail..."
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="roleId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Perfil</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant="default"
            disabled={upsertUserAction.isPending}
          >
            {user?.id ? "Atualizar" : "Adicionar"}
            {upsertUserAction.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
