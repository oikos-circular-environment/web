"use server";

import type { AxiosError } from "axios";
import { z } from "zod";

import { createServerApiClient } from "@/libs/api/oikos-api";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const supportRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2500),
  turnstileToken: z.string().min(1),
});

export type SupportRequestAttachment = {
  id: string;
  url: string;
  file_name: string;
  path: string;
  created_at: string;
};

export type SupportRequest = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  attachments: SupportRequestAttachment[];
  created_at: string;
};

async function verifyTurnstileToken(token: string) {
  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY ?? "",
      response: token,
    }),
  });

  const outcome = (await response.json()) as { success: boolean };
  return outcome.success === true;
}

export async function submitSupportRequestAction(
  formData: FormData,
): Promise<SupportRequest> {
  const { title, description, turnstileToken } = supportRequestSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    turnstileToken: formData.get("turnstileToken"),
  });

  if (!(await verifyTurnstileToken(turnstileToken))) {
    throw new Error(
      "Não foi possível confirmar que você não é um robô. Tente novamente.",
    );
  }

  const payload = new FormData();
  payload.append("title", title);
  payload.append("description", description);
  for (const image of formData.getAll("images")) {
    if (image instanceof File) {
      payload.append("images", image);
    }
  }

  try {
    const response = await createServerApiClient().instance.post(
      "/v1/moderation/support",
      payload,
    );
    return response.data.supportRequest as SupportRequest;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ??
        "Não foi possível completar a solicitação.",
    );
  }
}
