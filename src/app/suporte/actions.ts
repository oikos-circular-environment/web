"use server";

import { z } from "zod";

const supportRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2500),
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

export async function submitSupportRequestAction(
  formData: FormData,
): Promise<SupportRequest> {
  const { title, description } = supportRequestSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  const payload = new FormData();
  payload.append("title", title);
  payload.append("description", description);
  for (const image of formData.getAll("images")) {
    if (image instanceof File) {
      payload.append("images", image);
    }
  }

  const baseUrl = process.env.API_INTERNAL_URL;

  const response = await fetch(`${baseUrl}/v1/moderation/support`, {
    method: "POST",
    headers: {
      "X-Client-Key": process.env.CLIENT_API_KEY ?? "",
    },
    body: payload,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ?? "Não foi possível completar a solicitação.",
    );
  }

  return data.supportRequest as SupportRequest;
}
