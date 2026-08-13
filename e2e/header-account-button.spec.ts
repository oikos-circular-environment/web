import { expect, test } from "@playwright/test";

import { loginAs } from "./auth-helper";

test.use({ viewport: { width: 1280, height: 720 } });

test("deslogado: mostra Entrar e Registrar", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Registrar" })).toBeVisible();
});

test("logado: mostra botão combinado Dashboard+Avatar", async ({ page }) => {
  await loginAs(page, "user@example.com");
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Ir para o dashboard" }),
  ).toBeVisible();
  await expect(page.getByLabel("Abrir menu da conta")).toBeVisible();
});
