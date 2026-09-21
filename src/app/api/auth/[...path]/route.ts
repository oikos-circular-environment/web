import type { NextRequest } from "next/server";
import { getApiUrl, getClientApiKey } from "@/libs/env";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;

  if (
    path.some(
      (seg) =>
        seg === ".." ||
        seg === "." ||
        seg === "" ||
        seg.includes("%") ||
        seg.includes("\\"),
    )
  ) {
    return new Response(null, { status: 404 });
  }

  const url = new URL(`/auth/${path.join("/")}`, getApiUrl());
  url.search = req.nextUrl.search;

  if (
    url.origin !== new URL(getApiUrl()).origin ||
    !url.pathname.startsWith("/auth/")
  ) {
    return new Response(null, { status: 404 });
  }

  const outReqHeaders = new Headers();
  outReqHeaders.set("X-Client-Key", getClientApiKey());

  const cookie = req.headers.get("cookie");
  if (cookie) outReqHeaders.set("cookie", cookie);

  const origin = req.headers.get("origin");
  if (origin) outReqHeaders.set("origin", origin);

  const contentType = req.headers.get("content-type");
  if (contentType) outReqHeaders.set("content-type", contentType);

  const accept = req.headers.get("accept");
  if (accept) outReqHeaders.set("accept", accept);

  const userAgent = req.headers.get("user-agent");
  if (userAgent) outReqHeaders.set("user-agent", userAgent);

  let body: ArrayBuffer | undefined;
  if (req.method === "POST") {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) body = buf;
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: outReqHeaders,
      body,
      redirect: "manual",
    });

    const headers = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower === "set-cookie" ||
        lower === "content-encoding" ||
        lower === "content-length" ||
        lower === "transfer-encoding" ||
        lower === "connection"
      )
        return;
      headers.set(key, value);
    });

    for (const c of upstream.headers.getSetCookie()) {
      headers.append("set-cookie", c);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return Response.json({ message: "upstream_unavailable" }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
