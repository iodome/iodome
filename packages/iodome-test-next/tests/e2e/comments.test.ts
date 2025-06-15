import { signIn } from "@/tests/helpers/signIn";
import { expect, test } from "@iodome/playwright";
import bcrypt from "bcrypt";

test.describe("comments", async () => {
  test("create", async ({ page, prisma }) => {
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
    await page.getByLabel("Comment").fill("new comment");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(`/articles/${article.id}`);
    await expect(page.locator("text=new comment")).toBeVisible();
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
    const comment = await prisma.comment.create({
      data: {
        authorId: user.id,
        articleId: article.id,
        content: "comment",
      },
    });

    await signIn(user, page);
    await page.getByRole("link", { name: article.title }).click();
    await page
      .getByTestId(`comment-actions-${comment.id}`)
      .getByRole("link", { name: "Edit" })
      .click();
    await expect(page).toHaveURL(`/comments/${comment.id}/edit`);

    await page.getByLabel("Comment").fill("updated comment");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(`/articles/${article.id}`);
    await expect(page.locator("text=updated comment")).toBeVisible();
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
    const comment = await prisma.comment.create({
      data: {
        authorId: user.id,
        articleId: article.id,
        content: "comment",
      },
    });

    await signIn(user, page);
    await page.getByRole("link", { name: article.title }).click();
    await page
      .getByTestId(`comment-actions-${comment.id}`)
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(page).toHaveURL(`/articles/${article.id}`);
    await expect(page.locator("body")).not.toContainText(comment.content);
  });
});
