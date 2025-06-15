import { expect, test } from "@iodome/playwright";

test.describe("users", async () => {
  test("create", async ({ page }) => {
    await page.goto("/users/new");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible();
  });
});
