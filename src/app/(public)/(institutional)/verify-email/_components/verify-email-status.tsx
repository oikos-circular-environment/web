"use client";

import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/libs/auth-client";
import { isServiceUnavailable } from "@/libs/auth-error";

const verificationTokenSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .regex(
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    "Token com formato inválido.",
  );

const UNAVAILABLE_MESSAGE =
  "Não conseguimos confirmar seu e-mail agora. Tente novamente em instantes ou fale com o suporte.";

type VerifyState =
  | { status: "pending" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type VerifyEmailStatusProps = {
  token?: string;
};

export function VerifyEmailStatus({ token }: VerifyEmailStatusProps) {
  const [state, setState] = useState<VerifyState>({ status: "pending" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!token) {
      setState({
        status: "error",
        message: "Link de confirmação inválido: nenhum token foi informado.",
      });
      return;
    }

    const parsedToken = verificationTokenSchema.safeParse(token);
    if (!parsedToken.success) {
      setState({
        status: "error",
        message: "Link de confirmação inválido ou corrompido.",
      });
      return;
    }

    authClient
      .verifyEmail({ query: { token: parsedToken.data } })
      .then(({ error }) => {
        setState(
          isServiceUnavailable(error)
            ? { status: "error", message: UNAVAILABLE_MESSAGE }
            : error
              ? {
                  status: "error",
                  message:
                    error.message ??
                    "Não foi possível confirmar seu e-mail. O link pode ser inválido ou ter expirado.",
                }
              : {
                  status: "success",
                  message: "Seu e-mail foi confirmado com sucesso.",
                },
        );
      })
      .catch(() => {
        setState({
          status: "error",
          message: UNAVAILABLE_MESSAGE,
        });
      });
  }, [token]);

  if (state.status === "pending") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Confirmando seu e-mail</EmptyTitle>
          <EmptyDescription>
            Aguarde enquanto validamos o seu link de confirmação.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (state.status === "success") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle2Icon className="text-primary" />
          </EmptyMedia>
          <EmptyTitle>E-mail confirmado!</EmptyTitle>
          <EmptyDescription>{state.message}</EmptyDescription>
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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <XCircleIcon className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Não foi possível confirmar seu e-mail</EmptyTitle>
        <EmptyDescription>{state.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-sm text-muted-foreground">
          Volte para o cadastro no aplicativo Oikos para receber um novo link de
          verificação.
        </p>
      </EmptyContent>
    </Empty>
  );
}
