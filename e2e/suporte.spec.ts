import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const fixturesDir = path.join(__dirname, "fixtures");
const validImage = path.join(fixturesDir, "valid-image.png");
const invalidFile = path.join(fixturesDir, "invalid.txt");

// Com a sitekey de teste da Cloudflare o desafio se resolve sozinho, mas o token
// só existe depois que o widget carrega — sem esperar por ele o envio é abortado.
async function waitForTurnstile(page: Page) {
  await expect(
    page.locator('input[name="cf-turnstile-response"]'),
  ).not.toHaveValue("");
}

test("exibe os campos e as restrições do dropzone", async ({ page }) => {
  await page.goto("/suporte");

  await expect(page.getByLabel("Título")).toBeVisible();
  await expect(page.getByLabel("Descrição")).toBeVisible();
  await expect(
    page.getByText("Arraste imagens aqui ou clique para selecionar"),
  ).toBeVisible();

  await expect(page.getByText("PNG, JPG ou JPEG")).toBeVisible();
  await expect(page.getByText("0/5 arquivos")).toBeVisible();
  await expect(page.getByText("10MB")).toBeVisible();
});

test("ação principal (Enviar solicitação) fica à direita da secundária", async ({
  page,
}) => {
  await page.goto("/suporte");

  const limpar = page.getByRole("button", { name: "Limpar formulário" });
  const enviar = page.getByRole("button", { name: "Enviar solicitação" });
  await expect(limpar).toBeVisible();
  await expect(enviar).toBeVisible();

  const limparBox = await limpar.boundingBox();
  const enviarBox = await enviar.boundingBox();
  expect(limparBox).not.toBeNull();
  expect(enviarBox).not.toBeNull();
  expect(limparBox?.x ?? 0).toBeLessThan(enviarBox?.x ?? 0);
});

test("contador de caracteres da descrição atualiza ao digitar", async ({
  page,
}) => {
  await page.goto("/suporte");

  await expect(page.getByText("0 / 2500")).toBeVisible();
  await page.getByLabel("Descrição").fill("Relato de teste");
  await expect(page.getByText("15 / 2500")).toBeVisible();
});

test("anexa uma imagem válida e permite removê-la", async ({ page }) => {
  await page.goto("/suporte");

  await page.locator('input[type="file"]').setInputFiles(validImage);

  await expect(page.getByText("valid-image.png")).toBeVisible();
  await expect(page.getByText("1/5 arquivos")).toBeVisible();

  await page.getByRole("button", { name: "Remover valid-image.png" }).click();

  await expect(page.getByText("valid-image.png")).toHaveCount(0);
  await expect(page.getByText("0/5 arquivos")).toBeVisible();
});

test("exibe o tamanho em KB para arquivos pequenos e em MB para grandes", async ({
  page,
}) => {
  await page.goto("/suporte");

  await page.locator('input[type="file"]').setInputFiles({
    name: "pequena.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(200 * 1024),
  });
  await expect(page.getByText(/^200 KB$/)).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "grande.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(Math.round(2.5 * 1024 * 1024)),
  });
  await expect(page.getByText(/^2,5 MB$/)).toBeVisible();
});

test("rejeita arquivo fora do tipo aceito e não anexa", async ({ page }) => {
  await page.goto("/suporte");

  await page.locator('input[type="file"]').setInputFiles(invalidFile);

  await expect(page.getByText(/não é PNG, JPG ou JPEG/)).toBeVisible();
  await expect(page.getByText("invalid.txt")).toHaveCount(0);
  await expect(page.getByText("0/5 arquivos")).toBeVisible();
});

test("exibe erros de validação ao enviar título e descrição vazios", async ({
  page,
}) => {
  await page.goto("/suporte");
  await waitForTurnstile(page);

  await page.getByRole("button", { name: "Enviar solicitação" }).click();

  await expect(page.getByText("Informe um título.")).toBeVisible();
  await expect(page.getByText("Descreva o problema.")).toBeVisible();
  await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
});

test("Enviar solicitação fica desabilitado enquanto o Turnstile não resolve", async ({
  page,
}) => {
  // Bloqueia o script da Cloudflare: sem ele o desafio nunca resolve, que é o
  // único jeito determinístico de observar o estado - a sitekey de teste resolve
  // rápido demais para se apostar em ver o botão desabilitado antes disso.
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.abort(),
  );
  await page.goto("/suporte");

  await page.getByLabel("Título").fill("Algo quebrou");
  await page.getByLabel("Descrição").fill("Descrição do problema");

  await expect(
    page.getByRole("button", { name: "Enviar solicitação" }),
  ).toBeDisabled();
});

test("Limpar formulário reseta título e descrição", async ({ page }) => {
  await page.goto("/suporte");

  await page.getByLabel("Título").fill("Algo quebrou");
  await page.getByLabel("Descrição").fill("Descrição do problema");

  await page.getByRole("button", { name: "Limpar formulário" }).click();

  await expect(page.getByLabel("Título")).toHaveValue("");
  await expect(page.getByLabel("Descrição")).toHaveValue("");
});

test("envia a solicitação com anexo, mostra o load state e reseta ao concluir", async ({
  page,
}) => {
  await page.goto("/suporte");
  await page.getByLabel("Título").fill("Algo quebrou");
  await page.getByLabel("Descrição").fill("Descrição do problema");
  await page.getByLabel("E-mail").fill("pessoa@example.com");
  await page.locator('input[type="file"]').setInputFiles(validImage);
  await expect(page.getByText("valid-image.png")).toBeVisible();
  await waitForTurnstile(page);

  await page.getByRole("button", { name: "Enviar solicitação" }).click();

  await expect(page.getByRole("button", { name: "Enviando" })).toBeVisible();

  await expect(
    page.getByText(
      "Solicitação enviada! Nossa equipe vai te responder em breve.",
    ),
  ).toBeVisible();

  await expect(page.getByLabel("Título")).toHaveValue("");
  await expect(page.getByText("valid-image.png")).toHaveCount(0);
});

test("mostra erro e não reseta o formulário quando a api falha", async ({
  page,
}) => {
  await page.goto("/suporte");
  await page.getByLabel("Título").fill("Algo quebrou");
  await page.getByLabel("Descrição").fill("Descrição do problema");
  await page.getByLabel("E-mail").fill("falha@example.com");
  await waitForTurnstile(page);

  await page.getByRole("button", { name: "Enviar solicitação" }).click();

  await expect(page.getByText("Falha simulada da API.")).toBeVisible();

  await expect(page.getByLabel("Título")).toHaveValue("Algo quebrou");
  await expect(page.getByLabel("Descrição")).toHaveValue(
    "Descrição do problema",
  );
});

test("renderiza o desafio do Turnstile", async ({ page }) => {
  await page.goto("/suporte");

  await waitForTurnstile(page);
});
