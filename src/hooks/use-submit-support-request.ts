import { useMutation } from "@tanstack/react-query";

import { submitSupportRequestAction } from "@/app/suporte/actions";

type SubmitSupportRequestInput = {
  title: string;
  description: string;
  images: File[];
};

async function submitSupportRequest({
  title,
  description,
  images,
}: SubmitSupportRequestInput) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
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
