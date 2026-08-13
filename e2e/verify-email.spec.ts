import { expect, test } from "@playwright/test";

test("confirma o e-mail com um token válido e exibe CTA para login", async ({
  page,
}) => {
  await page.goto("/verify-email?token=aaaaaaaa.bbbbbbbb.cccccccc");

  await expect(page.getByText("E-mail confirmado!")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ir para o login" }),
  ).toBeVisible();
});

test("exibe erro quando o token tem formato de JWT mas é rejeitado pela API", async ({
  page,
}) => {
  await page.goto("/verify-email?token=xxxxxxxx.yyyyyyyy.zzzzzzzz");

  await expect(
    page.getByText("Não foi possível confirmar seu e-mail"),
  ).toBeVisible();
  await expect(page.getByText("Invalid or expired reset token")).toBeVisible();
});

test("rejeita localmente um token com formato inválido, sem chamar a API", async ({
  page,
}) => {
  await page.goto("/verify-email?token=nao-parece-um-jwt");

  await expect(
    page.getByText("Não foi possível confirmar seu e-mail"),
  ).toBeVisible();
});

test("exibe erro quando nenhum token é informado na querystring", async ({
  page,
}) => {
  await page.goto("/verify-email");

  await expect(
    page.getByText("Link de confirmação inválido: nenhum token foi informado."),
  ).toBeVisible();
});
