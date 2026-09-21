"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { authClient } from "@/libs/auth-client";
import {
  type SessionOrganization,
  type SessionUser,
  useSessionStore,
} from "@/stores/use-session-store";

export function SessionSync({
  user,
  organizations,
}: {
  user: SessionUser | null;
  organizations: SessionOrganization[];
}) {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const hadSession = useRef(false);

  useEffect(() => {
    const { setSession, setSessionResolved } = useSessionStore.getState();
    setSession(user, organizations);
    setSessionResolved(true);
    hadSession.current = user !== null;
  }, [user, organizations]);

  useEffect(() => {
    if (isPending) return;
    if (data) {
      hadSession.current = true;
      return;
    }
    if (!hadSession.current) return;
    hadSession.current = false;
    useSessionStore.getState().clearSession();
    router.replace("/login");
  }, [data, isPending, router]);

  return null;
}
