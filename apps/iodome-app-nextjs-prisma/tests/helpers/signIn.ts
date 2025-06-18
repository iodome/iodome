import { SIGN_IN_PATH } from "@/utils/constants";
import { Page } from "@playwright/test";
import { User } from "@prisma/client";

export async function signIn(user: User, page: Page, path = SIGN_IN_PATH) {
  await page.goto(path);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}
