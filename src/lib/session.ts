import "server-only";
import { cookies } from "next/headers";
import { apiClient } from "@/libs/api/oikos-api";
import {
  getV2AuthSession,
  postV2AuthSignIn,
  postV2AuthSignOut,
} from "@/libs/oikos-sdk/sdk.gen";
import type { SessionUser } from "@/stores/use-session-store";

const SESSION_COOKIE = "oikos_session_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type ApiUser = NonNullable<
  Awaited<ReturnType<typeof postV2AuthSignIn>>["data"]
>["user"];

function toSessionUser(user: ApiUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified,
    image: user.image,
    role: user.role,
    organizations: user.organizations ?? [],
  };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<
  { success: true; user: SessionUser } | { success: false; message: string }
> {
  const { data, error } = await postV2AuthSignIn({
    client: apiClient,
    body: { email, password },
  });

  if (error || !data) {
    return {
      success: false,
      message: "Email ou senha inválidos.",
    };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { success: true, user: toSessionUser(data.user) };
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await getV2AuthSession({
    client: apiClient,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error || !data) return null;
  return toSessionUser(data.user);
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await postV2AuthSignOut({
      client: apiClient,
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  store.delete(SESSION_COOKIE);
}
