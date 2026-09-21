import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 720 } });

async function fillSignUp(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.goto("/registro");
  await page.getByLabel("Nome").fill("Fulano de Tal");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("password123");
  await page.getByRole("button", { name: "Criar conta" }).click();
}

test("cadastro com sucesso pede verificação de e-mail", async ({ page }) => {
  await fillSignUp(page, "novo@example.com");

  await expect(page.getByText("Verifique seu e-mail")).toBeVisible();
  await expect(page.getByText("novo@example.com")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ir para o login" }),
  ).toBeVisible();
});

test("cadastro com e-mail existente mostra erro inline", async ({ page }) => {
  await fillSignUp(page, "existing@example.com");

  await expect(
    page.getByText("Já existe uma conta com este e-mail."),
  ).toBeVisible();
  await expect(page).toHaveURL("/registro");
});
