import { authClient } from "@/libs/auth-client";

export const USERS_LIMIT = 10;

export type ModerationListParams = {
  offset: number;
  searchValue?: string;
};

type AdminResult<T> = {
  data: T | null;
  error: { message?: string } | null;
};

export function unwrap<T>(result: AdminResult<T>, fallback: string): T {
  if (result.error || result.data === null) {
    throw new Error(result.error?.message || fallback);
  }
  return result.data;
}

export async function listUsers({ offset, searchValue }: ModerationListParams) {
  const result = await authClient.admin.listUsers({
    query: {
      limit: USERS_LIMIT,
      offset,
      searchField: searchValue ? "email" : undefined,
      searchOperator: searchValue ? "contains" : undefined,
      searchValue: searchValue || undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });
  return unwrap(result, "Não foi possível listar os usuários.");
}

export async function getUser(id: string) {
  const result = await authClient.admin.getUser({ query: { id } });
  return unwrap(result, "Não foi possível carregar o usuário.");
}

export async function listUserSessions(userId: string) {
  const result = await authClient.admin.listUserSessions({ userId });
  return unwrap(result, "Não foi possível carregar as sessões.");
}

export async function banUser(input: {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
}) {
  const result = await authClient.admin.banUser(input);
  return unwrap(result, "Erro ao banir usuário.");
}

export async function unbanUser(userId: string) {
  const result = await authClient.admin.unbanUser({ userId });
  return unwrap(result, "Erro ao desbanir usuário.");
}

export async function setRole(input: { userId: string; role: string }) {
  const result = await authClient.admin.setRole({
    userId: input.userId,
    role: input.role as "user",
  });
  return unwrap(result, "Erro ao atualizar papel.");
}

export async function revokeUserSessions(userId: string) {
  const result = await authClient.admin.revokeUserSessions({ userId });
  return unwrap(result, "Erro ao revogar sessões.");
}

export async function removeUser(userId: string) {
  const result = await authClient.admin.removeUser({ userId });
  return unwrap(result, "Erro ao remover usuário.");
}
