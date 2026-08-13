import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { verifyEmailAction } from "./actions";

export const metadata: Metadata = {
  title: "Confirmação de e-mail",
  description: "Confirme seu e-mail para concluir o cadastro no Oikos.",
  alternates: { canonical: "/verify-email" },
  robots: { index: false, follow: false },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const tokenValue = Array.isArray(token) ? token[0] : token;

  const result = tokenValue
    ? await verifyEmailAction(tokenValue)
    : {
        success: false as const,
        message: "Link de confirmação inválido: nenhum token foi informado.",
      };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      {result.success ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle2Icon className="text-primary" />
            </EmptyMedia>
            <EmptyTitle>E-mail confirmado!</EmptyTitle>
            <EmptyDescription>{result.message}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="lg">
              <Link href="/login">Ir para o login</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <XCircleIcon className="text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Não foi possível confirmar seu e-mail</EmptyTitle>
            <EmptyDescription>{result.message}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-sm text-muted-foreground">
              Volte para o cadastro no aplicativo Oikos para receber um novo
              link de verificação.
            </p>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
