import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3335);

const VALID_PASSWORD = "password123";
const SESSION_COOKIE = "oikos_session_token";

function createUser(role, email, hasOrganization = false) {
  return {
    id: crypto.randomUUID(),
    email,
    name: role === "moderator" ? "Moderador Teste" : "Usuário Teste",
    email_verified: true,
    image: null,
    role,
    organizations: hasOrganization
      ? [
          {
            id: crypto.randomUUID(),
            company_id: crypto.randomUUID(),
            name: "Organização Teste",
            role: "owner",
          },
        ]
      : [],
  };
}

function tokenFor(email) {
  return `token-${email}`;
}

function userFromToken(token) {
  if (!token?.startsWith("token-")) return null;
  const email = token.slice("token-".length);
  const role = email.includes("moderator") ? "moderator" : "user";
  const hasOrganization = email.includes("org");
  return createUser(role, email, hasOrganization);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf-8") || "{}");
}

// The real api authenticates v2 routes via "Authorization: Bearer <token>",
// never via cookie (see api/src/modules/auth/routes/v2/auth-v2-routes.ts).
// Session/moderation handlers below must check this header to match reality.
function bearerToken(req) {
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
}

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "";
  console.log(`[fake-api] ${req.method} ${url} cookie=${req.headers.cookie}`);

  if (req.method === "POST" && url === "/v2/auth/sign-in") {
    const { email, password } = await readJson(req);

    if (password !== VALID_PASSWORD) {
      sendJson(res, 401, {
        message: "Email ou senha inválidos.",
        code: "INVALID_CREDENTIALS",
        statusCode: 401,
      });
      return;
    }

    const role = email.includes("moderator") ? "moderator" : "user";
    const hasOrganization = email.includes("org");
    const user = createUser(role, email, hasOrganization);
    const token = tokenFor(email);

    res.writeHead(200, {
      "content-type": "application/json",
      "set-cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax`,
    });
    res.end(JSON.stringify({ token, user }));
    return;
  }

  if (req.method === "GET" && url === "/v2/auth/session") {
    const token = bearerToken(req);
    const user = token ? userFromToken(token) : null;

    if (!user) {
      sendJson(res, 401, {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
      return;
    }

    sendJson(res, 200, { user });
    return;
  }

  if (req.method === "GET" && url.startsWith("/v2/moderation/users")) {
    const token = bearerToken(req);
    const user = token ? userFromToken(token) : null;

    if (user?.role !== "moderator") {
      sendJson(res, 403, {
        message: "Forbidden",
        code: "FORBIDDEN",
        statusCode: 403,
      });
      return;
    }

    sendJson(res, 200, {
      users: [
        {
          id: crypto.randomUUID(),
          email: "regular@example.com",
          name: "Usuário Regular",
          email_verified: true,
          image: null,
          role: "user",
          banned: false,
          ban_reason: null,
          ban_expires: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          email: "banned@example.com",
          name: "Usuário Banido",
          email_verified: true,
          image: null,
          role: "user",
          banned: true,
          ban_reason: "Spam",
          ban_expires: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      total: 2,
      limit: 10,
      offset: 0,
    });
    return;
  }

  if (req.method === "POST" && url === "/v2/auth/sign-out") {
    sendJson(res, 200, { message: "Signed out" });
    return;
  }

  if (req.method === "POST" && url === "/v2/auth/verify-email") {
    const { token } = await readJson(req);

    if (token !== "aaaaaaaa.bbbbbbbb.cccccccc") {
      sendJson(res, 400, {
        message: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
        statusCode: 400,
      });
      return;
    }

    sendJson(res, 200, { message: "Email verified successfully" });
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
