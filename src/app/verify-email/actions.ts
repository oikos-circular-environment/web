"use server";

import { z } from "zod";

const emailSchema = z.email("Informe um e-mail válido.");

export type VerifyEmailResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function verifyEmailAction(
  token: string,
): Promise<VerifyEmailResult> {
  const baseUrl = process.env.API_INTERNAL_URL;

  const response = await fetch(`${baseUrl}/v2/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": process.env.CLIENT_API_KEY ?? "",
    },
    body: JSON.stringify({ token }),
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

export type ResendVerificationEmailState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function resendVerificationEmailAction(
  _prevState: ResendVerificationEmailState,
  formData: FormData,
): Promise<ResendVerificationEmailState> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Informe um e-mail válido.",
    };
  }

  const baseUrl = process.env.API_INTERNAL_URL;

  const response = await fetch(`${baseUrl}/v2/auth/send-verification-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": process.env.CLIENT_API_KEY ?? "",
    },
    body: JSON.stringify({ email: parsed.data }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      status: "error",
      message:
        data?.message ??
        "Não foi possível reenviar o e-mail de verificação. Tente novamente.",
    };
  }

  return {
    status: "success",
    message:
      "Se este e-mail estiver cadastrado, você vai receber um novo link de verificação em instantes.",
  };
}
