import { expect, test } from "@playwright/test";

import { loginAs } from "./auth-helper";

test.use({ viewport: { width: 1280, height: 720 } });

test("login com sucesso redireciona para /dashboard", async ({ page }) => {
  await loginAs(page, "user@example.com");

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("senha errada mostra erro inline e não navega", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("user@example.com");
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Email ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL("/login");
});
