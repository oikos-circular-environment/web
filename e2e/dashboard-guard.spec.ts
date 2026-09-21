import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 720 } });

test("sem cookie de sessão, /dashboard redireciona para /login", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
});

test("cookie de sessão inválido, /dashboard redireciona para /login", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "forjado",
      url: "http://localhost:3100",
    },
  ]);

  await page.goto("/dashboard/account");

  await expect(page).toHaveURL(/\/login$/);
});
