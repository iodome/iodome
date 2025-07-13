import { expect, Page } from "@playwright/test";
import { test } from "./fixtures";

async function createCourse(page: Page) {
  await page.goto("/courses");
  await page.getByRole("link", { name: "New Course" }).click();
  await page.getByLabel("Name").fill("test name");
  await page.getByLabel("Description").fill("test description");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/courses\/\d+/);
  await expect(page.locator("h1")).toContainText("test name");
  await expect(page.locator("text=test description")).toBeVisible();
}

test.describe("courses", async () => {
  for (let index = 0; index < 150; index++) {
    test(`create ${index}`, async ({ page }) => {
      await createCourse(page);
    });
  }
});
