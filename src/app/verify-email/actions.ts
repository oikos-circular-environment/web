"use server";

import { z } from "zod";

import { apiFetch } from "@/lib/api";

// Better Auth emite o token de verificação como um JWT (ver createEmailVerificationToken
// em better-auth/dist/api/routes/email-verification.mjs). A forma abaixo só descarta lixo
// óbvio antes de bater na API — quem decide se o token é válido/expirado é o backend.
const verificationTokenSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .regex(
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    "Token com formato inválido.",
  );

export type VerifyEmailResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function verifyEmailAction(
  token: string,
): Promise<VerifyEmailResult> {
  const parsedToken = verificationTokenSchema.safeParse(token);

  if (!parsedToken.success) {
    return {
      success: false,
      message: "Link de confirmação inválido ou corrompido.",
    };
  }

  const response = await apiFetch("/v2/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: parsedToken.data }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message:
        data?.message ??
        "Não foi possível confirmar seu e-mail. O link pode ser inválido ou ter expirado.",
    };
  }

  return {
    success: true,
    message: "Seu e-mail foi confirmado com sucesso.",
  };
}
