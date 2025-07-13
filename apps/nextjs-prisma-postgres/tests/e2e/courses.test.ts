import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("courses", async () => {
  test("has title", async ({ page }) => {
    await page.goto("/courses");
    await page.getByRole("link", { name: "New Course" }).click();
    await page.getByLabel("Name").fill("test name");
    await page.getByLabel("Description").fill("test description");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(/courses\/\d+/);
    await expect(page.locator("h1")).toContainText("test name");
    await expect(page.locator("text=test description")).toBeVisible();
  });
});
