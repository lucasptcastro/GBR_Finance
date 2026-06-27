"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPerson } from "@/actions/upsert-person";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  peopleTable,
  personCategoryEnum,
  personSexEnum,
  personTypeEnum,
} from "@/db/schema";
import { parseBirthDate } from "@/helpers/format-date";

interface UpsertCustomerDialogProps {
  isOpen: boolean;
  onSuccess?: () => void;
  customer?: typeof peopleTable.$inferSelect;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  nickname: z.string().trim().optional(),
  type: z.enum(personTypeEnum.enumValues),
  sex: z.enum(personSexEnum.enumValues).optional(),
  isPcd: z.boolean().optional(),
  birthDate: z.date().optional(),
  rg: z.string().trim().optional(),
  stateRegistration: z.string().trim().optional(),
  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  mobile: z.string().trim().min(1, { message: "O celular é obrigatório." }),
  cpf: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  observation: z
    .string()
    .trim()
    .max(2000, {
      message: "A observação deve ter no máximo 2000 caracteres.",
    })
    .optional(),

  // Endereço
  zipCode: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  reference: z.string().trim().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const UpsertCustomerDialog = ({
  isOpen,
  onSuccess,
  customer,
}: UpsertCustomerDialogProps) => {
  const form = useForm<FormData>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name ?? "",
      nickname: customer?.nickname ?? "",
      type: customer?.type ?? "individual",
      sex: customer?.sex ?? "male",
      isPcd: customer?.isPcd ?? false,
      birthDate: parseBirthDate(customer?.birthDate),
      rg: customer?.rg ?? "",
      stateRegistration: customer?.stateRegistration ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      mobile: customer?.mobile ?? "",
      cpf: customer?.cpf ?? "",
      cnpj: customer?.cnpj ?? "",
      status: customer?.status ?? "active",
      zipCode: customer?.zipCode ?? "",
      state: customer?.state ?? "",
      city: customer?.city ?? "",
      street: customer?.street ?? "",
      number: customer?.number ?? "",
      complement: customer?.complement ?? "",
      neighborhood: customer?.neighborhood ?? "",
      reference: customer?.reference ?? "",
      observation: customer?.observation ?? "",
    },
  });

  const personType = form.watch("type");

  const upsertPersonAction = useAction(upsertPerson, {
    onSuccess: () => {
      toast.success(
        customer
          ? "Cliente atualizado com sucesso"
          : "Cliente adicionado com sucesso",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar cliente. Tente novamente.");
    },
  });

  const onSubmit = (values: FormData) => {
    upsertPersonAction.execute({
      ...values,
      id: customer?.id,
      category: personCategoryEnum.enumValues[0], // 'customer'
      status: values.status ?? "active",
    });
  };

  const onInvalid = (errors: FieldErrors<FormData>) => {
    const first = Object.values(errors)[0];
    toast.error(first?.message ?? "Preencha todos os campos obrigatórios.");
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: customer?.name ?? "",
        nickname: customer?.nickname ?? "",
        type: customer?.type ?? "individual",
        sex: customer?.sex ?? "male",
        isPcd: customer?.isPcd ?? false,
        birthDate: parseBirthDate(customer?.birthDate),
        rg: customer?.rg ?? "",
        stateRegistration: customer?.stateRegistration ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        mobile: customer?.mobile ?? "",
        cpf: customer?.cpf ?? "",
        cnpj: customer?.cnpj ?? "",
        status: customer?.status ?? "active",
        observation: customer?.observation ?? "",
      });
    }
  }, [isOpen, customer, form]);

  return (
    <>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Atualizar Cliente" : "Adicionar Cliente"}
          </DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nome *</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Digite o nome..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="nickname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Apelido</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Digite o apelido..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tipo *</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">
                          Pessoa Física
                        </SelectItem>
                        <SelectItem value="company">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="sex"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Sexo</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="isPcd"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>PCD</FieldLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Informações pessoais */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {personType === "individual" && (
                <>
                  <Controller
                    name="cpf"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>CPF</FieldLabel>
                        <Input placeholder="000.000.000-00" {...field} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="rg"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>RG</FieldLabel>
                        <Input placeholder="00.000.000-0" {...field} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </>
              )}

              {personType === "company" && (
                <>
                  <Controller
                    control={form.control}
                    name="cnpj"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>CNPJ</FieldLabel>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="stateRegistration"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Inscrição Estadual</FieldLabel>
                        <Input placeholder="Digite a inscrição..." {...field} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </>
              )}

              <Controller
                control={form.control}
                name="birthDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Data de Nascimento</FieldLabel>
                    <DatePicker
                      selected={field.value ?? undefined}
                      onSelect={(date) => {
                        field.onChange(date ?? undefined);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Telefone</FieldLabel>
                    <Input placeholder="(00) 0000-0000" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="mobile"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Celular *</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="(00) 00000-0000"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Endereço</h3>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="zipCode"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>CEP</FieldLabel>
                      <Input placeholder="00000-000" {...field} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="state"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Estado</FieldLabel>
                      <Input placeholder="UF" {...field} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Cidade</FieldLabel>
                    <Input placeholder="Nome da cidade" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="street"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Logradouro</FieldLabel>
                    <Input placeholder="Rua, avenida, etc." {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="number"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Número</FieldLabel>
                      <Input placeholder="123" {...field} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="complement"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Complemento</FieldLabel>
                      <Input placeholder="Apto, bloco, etc." {...field} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="neighborhood"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Bairro</FieldLabel>
                    <Input placeholder="Nome do bairro" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="reference"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Referência</FieldLabel>
                    <Input placeholder="Ponto de referência" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Observação */}
            <Controller
              control={form.control}
              name="observation"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Observação</FieldLabel>
                  <Textarea
                    placeholder="Digite observações adicionais..."
                    className="resize-none"
                    maxLength={2000}
                    rows={6}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Status */}
            {customer && (
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={upsertPersonAction.isPending}
                className="gap-1"
              >
                {upsertPersonAction.isPending && (
                  <Loader2 className="animate-spin" />
                )}
                {customer ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </>
  );
};
