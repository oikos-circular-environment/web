import { useMutation } from "@tanstack/react-query";

import { submitSupportRequestAction } from "@/app/(public)/suporte/actions";

type SubmitSupportRequestInput = {
  title: string;
  description: string;
  images: File[];
  turnstileToken: string;
};

async function submitSupportRequest({
  title,
  description,
  images,
  turnstileToken,
}: SubmitSupportRequestInput) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("turnstileToken", turnstileToken);
  for (const image of images) {
    formData.append("images", image);
  }

  return submitSupportRequestAction(formData);
}

export function useSubmitSupportRequest() {
  return useMutation({
    mutationFn: submitSupportRequest,
  });
}
