import { expect, test } from "@playwright/test";

import { loginAs } from "./auth-helper";

test.use({ viewport: { width: 1280, height: 720 } });

test("conta mostra o painel para usuário logado", async ({ page }) => {
  await loginAs(page, "user@example.com");
  await page.goto("/dashboard/account");

  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Excluir conta" }),
  ).toBeVisible();
});

test("troca de senha com senha atual correta mostra sucesso", async ({
  page,
}) => {
  await loginAs(page, "user@example.com");
  await page.goto("/dashboard/account");

  await page.getByLabel("Senha atual").fill("password123");
  await page.getByLabel("Nova senha").fill("novasenha456");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();

  await expect(page.getByText("Senha alterada com sucesso.")).toBeVisible();
});

test("troca de senha com senha atual errada mostra erro", async ({ page }) => {
  await loginAs(page, "user@example.com");
  await page.goto("/dashboard/account");

  await page.getByLabel("Senha atual").fill("errada");
  await page.getByLabel("Nova senha").fill("novasenha456");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();

  await expect(page.getByText("Senha atual incorreta.")).toBeVisible();
});
