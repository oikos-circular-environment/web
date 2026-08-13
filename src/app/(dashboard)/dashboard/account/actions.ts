"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { apiClient } from "@/libs/api/oikos-api";
import {
  deleteV2AccountsMe,
  patchV2AccountsMeCancelDeletion,
  postV2AuthChangePassword,
} from "@/libs/oikos-sdk/sdk.gen";

const SESSION_COOKIE = "oikos_session_token";

async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

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

  const token = await getSessionToken();
  if (!token) {
    return { status: "error", error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await postV2AuthChangePassword({
    client: apiClient,
    headers: { Authorization: `Bearer ${token}` },
    body: parsed.data,
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
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      message: "Sessão expirada. Faça login novamente.",
    };
  }

  const { data, error } = await deleteV2AccountsMe({
    client: apiClient,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error || !data) {
    const message =
      error && "message" in error && typeof error.message === "string"
        ? error.message
        : "Não foi possível agendar a exclusão da conta.";
    return { success: false, message };
  }

  return { success: true, deletedAt: data.deleted_at.toISOString() };
}

export async function cancelAccountDeletionAction(): Promise<DeleteAccountResult> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      message: "Sessão expirada. Faça login novamente.",
    };
  }

  const { error } = await patchV2AccountsMeCancelDeletion({
    client: apiClient,
    headers: { Authorization: `Bearer ${token}` },
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
