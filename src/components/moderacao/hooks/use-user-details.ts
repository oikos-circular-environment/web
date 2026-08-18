"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getUserDetailsAction,
  getUserSessionsAction,
} from "@/app/(dashboard)/dashboard/moderacao/actions";

export function useUserDetails(userId: string | null) {
  const detailsQuery = useQuery({
    queryKey: ["moderation-user-details", userId],
    queryFn: () => getUserDetailsAction(userId as string),
    enabled: userId !== null,
  });

  const sessionsQuery = useQuery({
    queryKey: ["moderation-user-sessions", userId],
    queryFn: () => getUserSessionsAction(userId as string),
    enabled: userId !== null,
  });

  return {
    user: detailsQuery.data?.user ?? null,
    profile: detailsQuery.data?.profile ?? null,
    accounts: detailsQuery.data?.accounts ?? [],
    sessions: sessionsQuery.data?.sessions ?? [],
    isLoading: detailsQuery.isLoading || sessionsQuery.isLoading,
  };
}
