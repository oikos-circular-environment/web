import type { Metadata } from "next";

import { SignUpForm } from "./_components/sign-up-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta no Oikos e comece a colaborar.",
  alternates: { canonical: "/registro" },
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <div className="mx-auto mb-8 flex w-full max-w-md flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Criar conta
        </h1>
        <p className="text-muted-foreground">
          Crie sua conta para começar a colaborar com a economia circular.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
