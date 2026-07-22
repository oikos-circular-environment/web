import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

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

  const { data } = await apiClient.post<{ supportRequest: SupportRequest }>(
    "/v1/moderation/support",
    formData,
  );

  return data.supportRequest;
}

export function useSubmitSupportRequest() {
  return useMutation({
    mutationFn: submitSupportRequest,
  });
}
