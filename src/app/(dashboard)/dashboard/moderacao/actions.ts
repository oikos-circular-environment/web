"use server";

import { cookies } from "next/headers";
import { createServerApiClient } from "@/libs/api/oikos-api";
import {
  deleteV2ModerationUsersById,
  getV2ModerationUsers,
  patchV2ModerationUsersByIdRole,
  postV2ModerationUsersByIdBan,
  postV2ModerationUsersByIdRevokeSessions,
  postV2ModerationUsersByIdUnban,
} from "@/libs/oikos-sdk/sdk.gen";
import type {
  DeleteV2ModerationUsersByIdData,
  GetV2ModerationUsersData,
  GetV2ModerationUsersResponse,
  PatchV2ModerationUsersByIdRoleData,
  PostV2ModerationUsersByIdBanData,
  PostV2ModerationUsersByIdRevokeSessionsData,
  PostV2ModerationUsersByIdUnbanData,
} from "@/libs/oikos-sdk/types.gen";

const SESSION_COOKIE = "oikos_session_token";

async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

async function buildServerClient() {
  const store = await cookies();
  const headers = new Headers();
  const cookie = store.toString();
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return createServerApiClient(headers);
}

function handleError(error: unknown): never {
  const message =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "Não foi possível completar a operação.";
  throw new Error(message);
}

export async function getUsersAction(
  params: GetV2ModerationUsersData["query"],
): Promise<GetV2ModerationUsersResponse | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await getV2ModerationUsers({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    query: params,
  });

  if (error || !data) return null;
  return data;
}

export async function updateUserRoleAction(
  id: string,
  role: string,
): Promise<void> {
  const token = await getSessionToken();
  if (!token) throw new Error("Sessão expirada.");

  const { error } = await patchV2ModerationUsersByIdRole({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    path: { id } satisfies PatchV2ModerationUsersByIdRoleData["path"],
    body: { role } satisfies PatchV2ModerationUsersByIdRoleData["body"],
  });

  if (error) handleError(error);
}

export async function banUserAction(
  id: string,
  body: PostV2ModerationUsersByIdBanData["body"],
): Promise<void> {
  const token = await getSessionToken();
  if (!token) throw new Error("Sessão expirada.");

  const { error } = await postV2ModerationUsersByIdBan({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    path: { id } satisfies PostV2ModerationUsersByIdBanData["path"],
    body,
  });

  if (error) handleError(error);
}

export async function unbanUserAction(id: string): Promise<void> {
  const token = await getSessionToken();
  if (!token) throw new Error("Sessão expirada.");

  const { error } = await postV2ModerationUsersByIdUnban({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    path: { id } satisfies PostV2ModerationUsersByIdUnbanData["path"],
  });

  if (error) handleError(error);
}

export async function revokeUserSessionsAction(id: string): Promise<void> {
  const token = await getSessionToken();
  if (!token) throw new Error("Sessão expirada.");

  const { error } = await postV2ModerationUsersByIdRevokeSessions({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    path: { id } satisfies PostV2ModerationUsersByIdRevokeSessionsData["path"],
  });

  if (error) handleError(error);
}

export async function removeUserAction(id: string): Promise<void> {
  const token = await getSessionToken();
  if (!token) throw new Error("Sessão expirada.");

  const { error } = await deleteV2ModerationUsersById({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    path: { id } satisfies DeleteV2ModerationUsersByIdData["path"],
  });

  if (error) handleError(error);
}
