"use client";

import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { SpinnerIcon } from "@phosphor-icons/react";

// import { ForgotPasswordForm } from "./forgot-password-form";

interface SignInFormProps {
  appVersion: string;
}

const formSchema = z.object({
  email: z.email("E-mail inválido!"),
  password: z.string("Senha inválida!").min(8, "Senha inválida!"),
});

type FormValues = z.infer<typeof formSchema>;

export function SignInForm({ appVersion }: SignInFormProps) {
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: async () => {
          await fetch("/api/auth/mark-email-verified", {
            method: "POST",
          });

          router.push("/dashboard");
        },
        // ctx significa context
        onError: (ctx) => {
          if (ctx.error.code === "USER_NOT_FOUND") {
            toast.error("E-mail não encontrado.");
            return form.setError("email", {
              message: "E-mail não encontrado.",
            });
          }
          if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
            toast.error("E-mail ou senha inválidos.");
            form.setError("password", {
              message: "E-mail ou senha inválidos.",
            });
            return form.setError("email", {
              message: "E-mail ou senha inválidos.",
            });
          }

          if (ctx.error.statusText.toUpperCase() === "INTERNAL SERVER ERROR") {
            toast.error(
              "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
            );
            return;
          }

          toast.error(ctx.error.message ?? ctx.error.statusText);
        },
      },
    });
  }

  // if (showForgotPassword) {
  //   return (
  //     <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
  //   );
  // }

  return (
    <div className="w-5/6 sm:w-1/2 lg:w-1/3 xl:w-1/4">
      <Card>
        <CardHeader>
          <CardTitle>Granja Barreto</CardTitle>
          <CardDescription>Faça login para continuar.</CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="grid gap-6">
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Digite seu email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Senha</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Digite sua senha"
                    type="password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {form.formState.isSubmitting ? (
                <SpinnerIcon className="size-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-muted-foreground hover:text-primary text-sm"
              onClick={() => setShowForgotPassword(true)}
            >
              Esqueci minha senha
            </Button>
          </CardFooter>
        </form>
        <span className="text-muted-foreground text-center text-xs">
          Versão {appVersion}
        </span>
      </Card>
    </div>
  );
}
