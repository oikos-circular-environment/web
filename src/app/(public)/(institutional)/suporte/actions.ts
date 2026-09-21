"use server";

import type { AxiosError } from "axios";
import { z } from "zod";

import { getRequestApiClient } from "@/libs/api/oikos-api";
import { getTurnstileSecretKey } from "@/libs/env";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const supportRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2500),
  email: z.string().trim().pipe(z.email()),
  turnstileToken: z.string().min(1),
});

export type SupportRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
};

async function verifyTurnstileToken(token: string) {
  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: getTurnstileSecretKey(),
      response: token,
    }),
  });

  const outcome = (await response.json()) as { success: boolean };
  return outcome.success === true;
}

export async function submitSupportRequestAction(
  formData: FormData,
): Promise<SupportRequest> {
  const { title, description, email, turnstileToken } =
    supportRequestSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      email: formData.get("email"),
      turnstileToken: formData.get("turnstileToken"),
    });

  if (!(await verifyTurnstileToken(turnstileToken))) {
    throw new Error(
      "Não foi possível confirmar que você não é um robô. Tente novamente.",
    );
  }

  const api = (await getRequestApiClient()).instance;

  try {
    const response = await api.post("/v1/support", {
      title,
      description,
      type: "SUPPORT",
      reporter_email: email,
    });
    const support = response.data.support as SupportRequest;

    for (const image of formData.getAll("images")) {
      if (!(image instanceof File)) continue;
      const payload = new FormData();
      payload.append("file", image);
      await api.post(`/v1/support/${support.id}/attachments`, payload);
    }

    return support;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ??
        "Não foi possível completar a solicitação.",
    );
  }
}
