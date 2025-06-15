import { signIn } from "@/tests/helpers/signIn";
import { expect, test } from "@iodome/playwright";
import bcrypt from "bcrypt";

test.describe("articles", async () => {
  test("create", async ({ page, prisma }) => {
    const user = await prisma.user.create({
      data: {
        email: "user@example.com",
        passwordDigest: bcrypt.hashSync("password", 10),
      },
    });

    await signIn(user, page);
    await page.getByRole("link", { name: "New Article" }).click();
    await page.getByLabel("title").fill("Test Article");
    await page.getByLabel("content").fill("Test Content");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(/articles\/\d+/);
    await expect(page.locator("h1")).toContainText("Test Article");
    await expect(page.locator("text=Test Content")).toBeVisible();
  });

  test("update", async ({ page, prisma }) => {
    const user = await prisma.user.create({
      data: {
        email: "user@example.com",
        passwordDigest: bcrypt.hashSync("password", 10),
      },
    });
    const article = await prisma.article.create({
      data: {
        authorId: user.id,
        title: "test article 123",
        content: "content",
      },
    });

    await signIn(user, page);
    await page.getByRole("link", { name: article.title }).click();
    await page.getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("title").fill("new title");
    await page.getByLabel("content").fill("new content");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(`articles/${article.id}`);
    await expect(page.locator("h1")).toContainText("new title");
    await expect(page.locator("text=new content")).toBeVisible();
  });

  test("delete", async ({ page, prisma }) => {
    const user = await prisma.user.create({
      data: {
        email: "user@example.com",
        passwordDigest: bcrypt.hashSync("password", 10),
      },
    });
    const article = await prisma.article.create({
      data: {
        authorId: user.id,
        title: "test article 123",
        content: "content",
      },
    });

    await signIn(user, page);
    await page.getByRole("link", { name: article.title }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/articles\/\d+/);
    await expect(page.locator("body")).not.toContainText(article.title);
    await expect(page.locator("body")).toContainText("No articles exist yet.");
  });
});
