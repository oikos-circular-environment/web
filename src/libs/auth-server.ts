import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { getApiUrl, getClientApiKey } from "@/libs/env";
import type {
  SessionOrganization,
  SessionUser,
} from "@/stores/use-session-store";

type Session = {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role?: string | null;
  };
  session: {
    id: string;
    expiresAt: string;
  };
} | null;

type ApiOrganization = { id: string; name: string; role?: string | null };

async function authFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getApiUrl()}/auth${path}`, {
      headers: {
        cookie: (await headers()).get("cookie") ?? "",
        "X-Client-Key": getClientApiKey(),
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T | null;
  } catch {
    return null;
  }
}

export const getSession = cache(async (): Promise<Session> => {
  return authFetch<Session>("/get-session");
});

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  if (!session) return null;
  const { user } = session;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.emailVerified,
    image: user.image,
    role: user.role === "moderator" ? "moderator" : "user",
  };
});

export const getOrganizations = cache(
  async (): Promise<SessionOrganization[]> => {
    const list = await authFetch<ApiOrganization[]>("/organization/list");
    return (list ?? []).map((org) => ({
      id: org.id,
      name: org.name,
      role: org.role ?? "member",
    }));
  },
);
