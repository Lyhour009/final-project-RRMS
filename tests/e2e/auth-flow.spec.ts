import { expect, test } from "@playwright/test";

test("unauthenticated users cannot open an admin page", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("tenant login remains isolated from admin routes", async ({ page }) => {
  const email = process.env.E2E_TENANT_EMAIL;
  const password = process.env.E2E_TENANT_PASSWORD;
  test.skip(!email || !password, "Set E2E_TENANT_EMAIL and E2E_TENANT_PASSWORD");

  await page.goto("/login");
  await page.getByLabel(/Email/i).fill(email!);
  await page.getByLabel(/Password/i).fill(password!);
  await page.getByRole("button", { name: /login|ចូល/i }).click();
  await expect(page).toHaveURL(/\/tenant\/dashboard/);

  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/tenant\/dashboard/);
});
