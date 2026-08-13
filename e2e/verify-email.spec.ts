import { expect, test } from "@playwright/test";

test("confirma o e-mail com um token válido e exibe CTA para login", async ({
  page,
}) => {
  await page.goto("/verify-email?token=valid-token");

  await expect(page.getByText("E-mail confirmado!")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ir para o login" }),
  ).toBeVisible();
});

test("exibe erro e permite reenviar o e-mail quando o token é inválido", async ({
  page,
}) => {
  await page.goto("/verify-email?token=expired-token");

  await expect(
    page.getByText("Não foi possível confirmar seu e-mail"),
  ).toBeVisible();
  await expect(page.getByText("Invalid or expired reset token")).toBeVisible();

  await page.getByLabel("E-mail").fill("usuario@example.com");
  await page.getByRole("button", { name: "Reenviar e-mail" }).click();

  await expect(
    page.getByText(
      "Se este e-mail estiver cadastrado, você vai receber um novo link de verificação em instantes.",
    ),
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
