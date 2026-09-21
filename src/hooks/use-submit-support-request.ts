import { useMutation } from "@tanstack/react-query";

import { submitSupportRequestAction } from "@/app/(public)/(institutional)/suporte/actions";

type SubmitSupportRequestInput = {
  title: string;
  description: string;
  email: string;
  images: File[];
  turnstileToken: string;
};

async function submitSupportRequest({
  title,
  description,
  email,
  images,
  turnstileToken,
}: SubmitSupportRequestInput) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("email", email);
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
