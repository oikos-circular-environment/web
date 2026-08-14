"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useId } from "react";
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

import { type SignUpFormState, signUpAction } from "../actions";

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

const initialState: SignUpFormState = { status: "idle" };

export function SignUpForm() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const [formState, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  const {
    register,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "" },
  });

  if (formState.status === "success") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailCheckIcon className="text-primary" />
          </EmptyMedia>
          <EmptyTitle>Verifique seu e-mail</EmptyTitle>
          <EmptyDescription>
            Enviamos um link de confirmação para{" "}
            <strong>{formState.email}</strong>. Confirme seu e-mail para ativar
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
    <form action={formAction} noValidate>
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

        {formState.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {formState.error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Criando conta" : "Criar conta"}
          {isPending && <Spinner data-icon="inline-end" />}
        </Button>
      </FieldGroup>
    </form>
  );
}
