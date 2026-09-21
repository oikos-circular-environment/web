import type { Metadata } from "next";

import { VerifyEmailStatus } from "./_components/verify-email-status";

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <VerifyEmailStatus token={tokenValue} />
    </div>
  );
}
