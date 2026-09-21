"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/libs/auth-client";

const signUpFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe seu nome.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const { error: signUpError } = await authClient.signUp.email(values);
    if (signUpError) {
      const conflict =
        signUpError.code === "USER_ALREADY_EXISTS" ||
        signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";
      setError(
        conflict
          ? "Já existe uma conta com este e-mail."
          : (signUpError.message ??
              "Não foi possível criar sua conta. Tente novamente."),
      );
      return;
    }
    setRegisteredEmail(values.email);
  });

  if (registeredEmail) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailCheckIcon className="text-primary" />
          </EmptyMedia>
          <EmptyTitle>Verifique seu e-mail</EmptyTitle>
          <EmptyDescription>
            Enviamos um link de confirmação para{" "}
            <strong>{registeredEmail}</strong>. Confirme seu e-mail para ativar
            sua conta.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="lg">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor={nameId}>Nome</FieldLabel>
          <Input
            id={nameId}
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            placeholder="Seu nome"
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            placeholder="Mínimo de 6 caracteres"
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
          {isSubmitting ? "Criando conta" : "Criar conta"}
          {isSubmitting && <Spinner data-icon="inline-end" />}
        </Button>
      </FieldGroup>
    </form>
  );
}
