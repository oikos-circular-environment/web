"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/libs/auth-client";
import {
  isServiceUnavailable,
  notifyServiceUnavailable,
} from "@/libs/auth-error";

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const { error: signInError } = await authClient.signIn
      .email(values)
      .catch(() => ({ error: { status: 0 } }));
    if (isServiceUnavailable(signInError)) {
      notifyServiceUnavailable();
      return;
    }
    if (signInError) {
      setError("Email ou senha inválidos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor={emailId}>E-mail</FieldLabel>
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            placeholder="voce@exemplo.com"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
          <Input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            placeholder="Sua senha"
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Entrando" : "Entrar"}
          {isSubmitting && <Spinner data-icon="inline-end" />}
        </Button>
      </FieldGroup>
    </form>
  );
}
