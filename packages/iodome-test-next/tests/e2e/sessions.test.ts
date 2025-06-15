import { signIn } from "@/tests/helpers/signIn";
import { SIGN_IN_PATH } from "@/utils/constants";
import { expect, test } from "@iodome/playwright";
import bcrypt from "bcrypt";

test.describe("sessions", async () => {
  test("create", async ({ page, prisma }) => {
    const user = await prisma.user.create({
      data: {
        email: "user@example.com",
        passwordDigest: bcrypt.hashSync("password", 10),
      },
    });

    await signIn(user, page);

    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible();
  });

  test("delete", async ({ page, prisma }) => {
    const user = await prisma.user.create({
      data: {
        email: "user@example.com",
        passwordDigest: bcrypt.hashSync("password", 10),
      },
    });

    await signIn(user, page);
    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(SIGN_IN_PATH);
    await expect(page.getByText("Sign in")).toBeVisible();
  });
});
