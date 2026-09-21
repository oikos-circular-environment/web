import type { Metadata } from "next";
import { connection } from "next/server";

import { getSessionUser } from "@/libs/auth-server";
import { getTurnstileSiteKey } from "@/libs/env";
import { SupportForm } from "./support-form";

export const metadata: Metadata = {
  title: "Suporte",
  description: "Fale com o suporte do aplicativo Oikos.",
  alternates: { canonical: "/suporte" },
};

export default async function SupportPage() {
  // `connection()` força renderização dinâmica: sem ela a página é pré-renderizada
  // no `next build` e a env seria congelada no valor de build time. Lida no servidor
  // e repassada como prop (em vez de NEXT_PUBLIC_, que o Next embute no bundle):
  // a imagem Docker é construída uma vez e a chave chega por env em runtime.
  await connection();

  const turnstileSiteKey = getTurnstileSiteKey();
  const user = await getSessionUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Suporte
        </h1>
        <p className="text-muted-foreground">
          Encontrou um problema ou tem alguma dúvida sobre o Oikos? Conte pra
          gente pelo formulário abaixo ou envie um e-mail para{" "}
          <a
            href="mailto:suporte@oikos.company"
            className="font-medium text-primary underline underline-offset-4"
          >
            suporte@oikos.company
          </a>
          .
        </p>
      </div>
      <SupportForm
        turnstileSiteKey={turnstileSiteKey}
        defaultEmail={user?.email ?? ""}
      />
    </div>
  );
}
