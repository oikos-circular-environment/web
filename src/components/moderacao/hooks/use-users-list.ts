"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  banUserAction,
  getUsersAction,
  removeUserAction,
  revokeUserSessionsAction,
  unbanUserAction,
  updateUserRoleAction,
} from "@/app/(dashboard)/dashboard/moderacao/actions";

const USERS_LIMIT = 10;
const usersQueryKey = ["moderation-users"];

export function useUsersList(
  initialData?: Awaited<ReturnType<typeof getUsersAction>>,
) {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const query = useQuery({
    queryKey: [usersQueryKey, offset, searchValue],
    queryFn: async () => {
      return getUsersAction({
        limit: USERS_LIMIT,
        offset,
        searchField: searchValue ? "email" : undefined,
        searchOperator: "contains",
        searchValue: searchValue || undefined,
        sortBy: "created_at",
        sortDirection: "desc",
      });
    },
    initialData,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: usersQueryKey });
  };

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateUserRoleAction(id, role),
    onSuccess: invalidate,
  });

  const ban = useMutation({
    mutationFn: ({
      id,
      banReason,
      banExpiresIn,
    }: {
      id: string;
      banReason?: string;
      banExpiresIn?: number;
    }) =>
      banUserAction(id, {
        ban_reason: banReason,
        ban_expires_in: banExpiresIn,
      }),
    onSuccess: invalidate,
  });

  const unban = useMutation({
    mutationFn: (id: string) => unbanUserAction(id),
    onSuccess: invalidate,
  });

  const revokeSessions = useMutation({
    mutationFn: (id: string) => revokeUserSessionsAction(id),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeUserAction(id),
    onSuccess: invalidate,
  });

  return {
    users: query.data?.users ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    offset,
    setOffset,
    searchValue,
    setSearchValue,
    updateRole: updateRole.mutateAsync,
    isUpdatingRole: updateRole.isPending,
    ban: ban.mutateAsync,
    isBanning: ban.isPending,
    unban: unban.mutateAsync,
    isUnbanning: unban.isPending,
    revokeSessions: revokeSessions.mutateAsync,
    isRevokingSessions: revokeSessions.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
}
