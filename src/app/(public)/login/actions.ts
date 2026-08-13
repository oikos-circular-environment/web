"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { signInWithPassword } from "@/lib/session";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const result = await signInWithPassword(
    parsed.data.email,
    parsed.data.password,
  );

  if (!result.success) {
    return { error: result.message };
  }

  redirect("/dashboard");
}
