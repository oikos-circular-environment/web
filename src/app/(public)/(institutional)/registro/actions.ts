"use server";

import { z } from "zod";

import { apiClient } from "@/libs/api/oikos-api";
import { postV2AuthSignUp } from "@/libs/oikos-sdk";

const signUpSchema = z.object({
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

export type SignUpFormState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "error"; error: string };

export async function signUpAction(
  _prevState: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { error } = await postV2AuthSignUp({
    client: apiClient,
    body: parsed.data,
  });

  if (error) {
    const conflict =
      error.code === "USER_ALREADY_EXISTS" ||
      error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";

    return {
      status: "error",
      error: conflict
        ? "Já existe uma conta com este e-mail."
        : (error.message ??
          "Não foi possível criar sua conta. Tente novamente."),
    };
  }

  return { status: "success", email: parsed.data.email };
}
