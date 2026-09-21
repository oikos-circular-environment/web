import { type NextRequest, NextResponse } from "next/server";

import { getApiUrl, getClientApiKey } from "@/libs/env";

const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  for (const name of SESSION_COOKIES) response.cookies.delete(name);
  return response;
}

export async function proxy(request: NextRequest) {
  const hasCookie = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasCookie) return redirectToLogin(request);

  let upstream: Response;
  try {
    upstream = await fetch(`${getApiUrl()}/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "X-Client-Key": getClientApiKey(),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return NextResponse.next();
  }

  if (upstream.status >= 500) return NextResponse.next();
  if (!upstream.ok) return redirectToLogin(request);

  const session = await upstream.json().catch(() => null);
  if (!session) return redirectToLogin(request);

  const response = NextResponse.next();
  for (const cookie of upstream.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

export const config = {
  matcher: "/dashboard/:path*",
};
