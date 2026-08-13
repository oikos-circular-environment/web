import { expect, test } from "@playwright/test";

import { loginAs } from "./auth-helper";

test.use({ viewport: { width: 1280, height: 720 } });

test("usuário comum não vê Moderação e é redirecionado ao acessar URL", async ({
  page,
}) => {
  await loginAs(page, "user@example.com");

  await expect(page.getByRole("link", { name: "Usuários" })).not.toBeVisible();

  await page.goto("/dashboard/moderacao");
  await expect(page).toHaveURL("/dashboard");
});

test("moderador vê Moderação e a rota carrega a lista", async ({ page }) => {
  await loginAs(page, "moderator@example.com");

  await expect(page.getByText("Moderação", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Usuários" })).toBeVisible();

  await page.getByRole("link", { name: "Usuários" }).click();
  await expect(page).toHaveURL("/dashboard/moderacao");

  await expect(page.getByRole("heading", { name: "Moderação" })).toBeVisible();
  await expect(page.getByText("regular@example.com")).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText("banned@example.com")).toBeVisible({
    timeout: 10000,
  });
});
