"use client";

import { useEffect } from "react";

import { type SessionUser, useSessionStore } from "@/stores/use-session-store";

export function SessionSync({ user }: { user: SessionUser | null }) {
  const setSession = useSessionStore((state) => state.setSession);
  const setSessionResolved = useSessionStore(
    (state) => state.setSessionResolved,
  );

  useEffect(() => {
    setSession(user);
    setSessionResolved(true);
  }, [user, setSession, setSessionResolved]);

  return null;
}
