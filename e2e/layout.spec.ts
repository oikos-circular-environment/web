import { expect, test } from "@playwright/test";

const routes = ["/", "/politica-de-privacidade", "/termos-de-uso", "/suporte"];

for (const route of routes) {
  test(`sem overflow horizontal em ${route}`, async ({ page }) => {
    await page.goto(route);
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });
}

test("alterna entre tema claro e escuro", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Alternar tema" });
  await expect(toggle).toBeVisible();

  const initialIsDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );

  await toggle.click();

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark")),
    )
    .toBe(!initialIsDark);
});

test("footer exibe direitos autorais centralizados", async ({ page }) => {
  await page.goto("/");
  const footerText = page.locator("footer div");
  await expect(footerText).toHaveText(/Todos os direitos reservados/);
  await expect(footerText).toHaveClass(/text-center/);
});
