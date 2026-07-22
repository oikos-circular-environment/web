import { useMutation } from "@tanstack/react-query";

type SubmitSupportRequestInput = {
  title: string;
  description: string;
  images: File[];
};

type SupportRequestAttachment = {
  id: string;
  url: string;
  file_name: string;
  path: string;
  created_at: string;
};

type SupportRequest = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  attachments: SupportRequestAttachment[];
  created_at: string;
};

async function submitSupportRequest({
  title,
  description,
  images,
}: SubmitSupportRequestInput): Promise<SupportRequest> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  for (const image of images) {
    formData.append("images", image);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/moderation/support`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ?? "Não foi possível enviar sua solicitação.",
    );
  }

  const body = (await response.json()) as { supportRequest: SupportRequest };
  return body.supportRequest;
}

export function useSubmitSupportRequest() {
  return useMutation({
    mutationFn: submitSupportRequest,
  });
}
