"use server";

import { z } from "zod";

import { createServerApiClient } from "@/libs/api/oikos-api";
import { postV2AuthVerifyEmail } from "@/libs/oikos-sdk";

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

  const { error } = await postV2AuthVerifyEmail({
    client: createServerApiClient(),
    body: { token: parsedToken.data },
  });

  if (error) {
    return {
      success: false,
      message:
        error.message ??
        "Não foi possível confirmar seu e-mail. O link pode ser inválido ou ter expirado.",
    };
  }

  return {
    success: true,
    message: "Seu e-mail foi confirmado com sucesso.",
  };
}
