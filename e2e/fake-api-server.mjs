import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3335);

const VALID_PASSWORD = "password123";
const CLIENT_KEY = "e2e-test-client-key";
const SESSION_COOKIE = "better-auth.session_token";
const EXISTING_EMAIL = "existing@example.com";

function createUser(email) {
  const role = email.includes("moderator") ? "moderator" : "user";
  const now = new Date().toISOString();
  return {
    id: `user-${email}`,
    email,
    name: role === "moderator" ? "Moderador Teste" : "Usuário Teste",
    emailVerified: true,
    image: null,
    role,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: now,
    updatedAt: now,
  };
}

function tokenFor(email) {
  return `token-${email}`;
}

function userFromToken(token) {
  if (!token?.startsWith("token-")) return null;
  return createUser(token.slice("token-".length));
}

function sessionToken(req) {
  const cookies = (req.headers.cookie ?? "").split(";");
  for (const entry of cookies) {
    const [name, ...rest] = entry.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function sessionUser(req) {
  const token = sessionToken(req);
  return token ? userFromToken(token) : null;
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf-8") || "{}");
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(data));
}

function sendError(res, status, code, message) {
  sendJson(res, status, { code, message });
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`;
}

function requireModerator(req, res) {
  const user = sessionUser(req);
  if (user?.role !== "moderator") {
    sendError(res, 403, "FORBIDDEN", "Forbidden");
    return null;
  }
  return user;
}

const bannedEmail = "banned@example.com";
const listedUsers = () => [
  { ...createUser("regular@example.com"), name: "Usuário Regular" },
  {
    ...createUser(bannedEmail),
    name: "Usuário Banido",
    banned: true,
    banReason: "Spam",
  },
];

const server = createServer(async (req, res) => {
  const url = req.url ?? "";
  const path = url.split("?")[0];
  console.log(`[fake-api] ${req.method} ${url} cookie=${req.headers.cookie}`);

  if (path.startsWith("/auth/") && req.headers["x-client-key"] !== CLIENT_KEY) {
    sendError(res, 401, "INVALID_CLIENT_KEY", "Invalid client key");
    return;
  }

  if (req.method === "POST" && path === "/auth/sign-in/email") {
    const { email, password } = await readJson(req);

    if (password !== VALID_PASSWORD) {
      sendError(
        res,
        401,
        "INVALID_EMAIL_OR_PASSWORD",
        "Invalid email or password",
      );
      return;
    }

    const token = tokenFor(email);
    sendJson(
      res,
      200,
      { redirect: false, token, user: createUser(email) },
      { "set-cookie": sessionCookie(token) },
    );
    return;
  }

  if (req.method === "POST" && path === "/auth/sign-up/email") {
    const { email, name } = await readJson(req);

    if (email === EXISTING_EMAIL) {
      sendError(
        res,
        422,
        "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
        "User already exists. Use another email.",
      );
      return;
    }

    sendJson(res, 200, {
      token: null,
      user: { ...createUser(email), name, emailVerified: false },
    });
    return;
  }

  if (req.method === "GET" && path === "/auth/get-session") {
    const user = sessionUser(req);
    sendJson(
      res,
      200,
      user
        ? {
            user,
            session: {
              id: `session-${user.id}`,
              userId: user.id,
              expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
            },
          }
        : null,
    );
    return;
  }

  if (req.method === "POST" && path === "/auth/sign-out") {
    sendJson(
      res,
      200,
      { success: true },
      {
        "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
      },
    );
    return;
  }

  if (req.method === "GET" && path === "/auth/verify-email") {
    const token = new URL(url, "http://fake-api").searchParams.get("token");

    if (token !== "aaaaaaaa.bbbbbbbb.cccccccc") {
      sendError(res, 400, "INVALID_TOKEN", "Invalid or expired reset token");
      return;
    }

    sendJson(res, 200, { status: true });
    return;
  }

  if (req.method === "GET" && path === "/auth/organization/list") {
    if (!sessionUser(req)) {
      sendError(res, 401, "UNAUTHORIZED", "Unauthorized");
      return;
    }
    const user = sessionUser(req);
    sendJson(
      res,
      200,
      user.email.includes("org")
        ? [
            {
              id: "org-1",
              name: "Organização Teste",
              slug: "organizacao-teste",
              role: "owner",
            },
          ]
        : [],
    );
    return;
  }

  if (path.startsWith("/auth/admin/")) {
    if (!requireModerator(req, res)) return;

    if (req.method === "GET" && path === "/auth/admin/list-users") {
      const users = listedUsers();
      sendJson(res, 200, { users, total: users.length, limit: 10, offset: 0 });
      return;
    }

    if (req.method === "GET" && path === "/auth/admin/get-user") {
      const id = new URL(url, "http://fake-api").searchParams.get("id");
      const user = listedUsers().find((entry) => entry.id === id);
      if (!user) {
        sendError(res, 404, "USER_NOT_FOUND", "User not found");
        return;
      }
      sendJson(res, 200, user);
      return;
    }

    if (req.method === "POST" && path === "/auth/admin/list-user-sessions") {
      sendJson(res, 200, { sessions: [] });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const target =
        listedUsers().find((entry) => entry.id === body.userId) ??
        createUser("regular@example.com");

      if (path === "/auth/admin/ban-user") {
        sendJson(res, 200, { user: { ...target, banned: true } });
        return;
      }
      if (path === "/auth/admin/unban-user") {
        sendJson(res, 200, { user: { ...target, banned: false } });
        return;
      }
      if (path === "/auth/admin/set-role") {
        sendJson(res, 200, { user: { ...target, role: body.role } });
        return;
      }
      if (path === "/auth/admin/revoke-user-sessions") {
        sendJson(res, 200, { success: true });
        return;
      }
      if (path === "/auth/admin/remove-user") {
        sendJson(res, 200, { success: true });
        return;
      }
    }
  }

  if (req.method === "PATCH" && path === "/v1/users/me/change-password") {
    if (!sessionUser(req)) {
      sendError(res, 401, "UNAUTHORIZED", "Unauthorized");
      return;
    }
    const { current_password: currentPassword } = await readJson(req);
    if (currentPassword !== VALID_PASSWORD) {
      sendJson(res, 400, {
        message: "Senha atual incorreta.",
        code: "INVALID_PASSWORD",
        statusCode: 400,
      });
      return;
    }
    sendJson(res, 200, { message: "Password changed" });
    return;
  }

  if (req.method !== "POST" || !url?.startsWith("/v1/moderation/support")) {
    res.writeHead(404).end();
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const request = new Request("http://fake-api/v1/moderation/support", {
    method: "POST",
    headers: { "content-type": req.headers["content-type"] ?? "" },
    body,
  });

  const formData = await request.formData();
  const hasImage = formData
    .getAll("images")
    .some((value) => value instanceof File && value.size > 0);

  if (!hasImage) {
    sendJson(res, 400, {
      message:
        "Support request attachment type is invalid. Allowed types: jpeg, png",
      code: "SUPPORT_REQUEST_ATTACHMENT_TYPE_INVALID",
      statusCode: 400,
    });
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  sendJson(res, 200, {
    supportRequest: {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Algo quebrou",
      description: "Descrição do problema",
      status: "PENDING",
      attachments: [],
      created_at: new Date().toISOString(),
    },
  });
});

server.listen(port, () => {
  console.log(`fake-api-server listening on ${port}`);
});
