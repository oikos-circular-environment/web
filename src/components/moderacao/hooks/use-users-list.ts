"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  banUser,
  listUsers,
  removeUser,
  revokeUserSessions,
  setRole,
  unbanUser,
} from "./moderation-admin";

const usersQueryKey = ["moderation-users"];

export function useUsersList() {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const query = useQuery({
    queryKey: [...usersQueryKey, offset, searchValue],
    queryFn: () => listUsers({ offset, searchValue }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: usersQueryKey });
  };

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      setRole({ userId: id, role }),
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
    }) => banUser({ userId: id, banReason, banExpiresIn }),
    onSuccess: invalidate,
  });

  const unban = useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: invalidate,
  });

  const revokeSessions = useMutation({
    mutationFn: (id: string) => revokeUserSessions(id),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeUser(id),
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
