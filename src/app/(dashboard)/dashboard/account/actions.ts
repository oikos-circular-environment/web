"use server";

import {
  deleteV1UsersMe,
  patchV1UsersMeCancelDeletion,
  patchV1UsersMeChangePassword,
} from "@oikos-circular-environment/oikos-sdk/sdk.gen";
import { z } from "zod";
import { getRequestApiClient } from "@/libs/api/oikos-api";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual."),
  newPassword: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres."),
});

export type ChangePasswordFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: string };

export async function changePasswordAction(
  _prevState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { error } = await patchV1UsersMeChangePassword({
    client: await getRequestApiClient(),
    body: {
      current_password: parsed.data.currentPassword,
      new_password: parsed.data.newPassword,
    },
  });

  if (error) {
    return {
      status: "error",
      error: error.message ?? "Não foi possível alterar sua senha.",
    };
  }

  return { status: "success" };
}

export type DeleteAccountResult =
  | { success: true; deletedAt: string }
  | { success: false; message: string };

export async function requestAccountDeletionAction(): Promise<DeleteAccountResult> {
  const { data, error } = await deleteV1UsersMe({
    client: await getRequestApiClient(),
  });

  if (error || !data) {
    const message =
      error && "message" in error && typeof error.message === "string"
        ? error.message
        : "Não foi possível agendar a exclusão da conta.";
    return { success: false, message };
  }

  return { success: true, deletedAt: new Date(data.deleted_at).toISOString() };
}

export async function cancelAccountDeletionAction(): Promise<DeleteAccountResult> {
  const { error } = await patchV1UsersMeCancelDeletion({
    client: await getRequestApiClient(),
  });

  if (error) {
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : "Não foi possível cancelar a exclusão da conta.";
    return { success: false, message };
  }

  return { success: true, deletedAt: "" };
}
