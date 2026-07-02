import type { Metadata } from "next";

import { SupportForm } from "./support-form";

export const metadata: Metadata = {
  title: "Suporte | Oikos",
  description: "Fale com o suporte do aplicativo Oikos.",
};

export default function SupportPage() {
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
            href="mailto:suporte@oikos.app"
            className="font-medium text-primary underline underline-offset-4"
          >
            suporte@oikos.app
          </a>
          .
        </p>
      </div>
      <SupportForm />
    </div>
  );
}
