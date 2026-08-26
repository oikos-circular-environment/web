import type { Metadata } from "next";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no Oikos.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <div className="mx-auto mb-8 flex w-full max-w-md flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Entrar
        </h1>
        <p className="text-muted-foreground">
          Acesse sua conta para continuar no Oikos.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
