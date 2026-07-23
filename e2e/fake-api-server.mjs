import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3335);

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || !req.url?.startsWith("/v1/moderation/support")) {
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
    res.writeHead(400, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message:
          "Support request attachment type is invalid. Allowed types: jpeg, png",
        code: "SUPPORT_REQUEST_ATTACHMENT_TYPE_INVALID",
        statusCode: 400,
      }),
    );
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  res.writeHead(200, { "content-type": "application/json" });
  res.end(
    JSON.stringify({
      supportRequest: {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Algo quebrou",
        description: "Descrição do problema",
        status: "PENDING",
        attachments: [],
        created_at: new Date().toISOString(),
      },
    }),
  );
});

server.listen(port, () => {
  console.log(`fake-api-server listening on ${port}`);
});
