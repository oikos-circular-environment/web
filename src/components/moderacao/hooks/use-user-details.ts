"use client";

import { useQuery } from "@tanstack/react-query";

import { getUser, listUserSessions } from "./moderation-admin";

export function useUserDetails(userId: string | null) {
  const detailsQuery = useQuery({
    queryKey: ["moderation-user-details", userId],
    queryFn: () => getUser(userId as string),
    enabled: userId !== null,
  });

  const sessionsQuery = useQuery({
    queryKey: ["moderation-user-sessions", userId],
    queryFn: () => listUserSessions(userId as string),
    enabled: userId !== null,
  });

  return {
    user: detailsQuery.data ?? null,
    sessions: sessionsQuery.data?.sessions ?? [],
    isLoading: detailsQuery.isLoading || sessionsQuery.isLoading,
  };
}
