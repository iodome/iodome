"use server";

import prisma from "@/prisma/db";
import { SIGN_IN_PATH } from "@/utils/constants";
import { Session, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

interface SessionWithUser {
  id: number;
  expires: Date;
  userId: number;
  user: Partial<User>;
}

function oneWeekInMilliseconds() {
  return 1000 * 60 * 60 * 24 * 7;
}
function expiry() {
  return new Date(Date.now() + oneWeekInMilliseconds());
}

async function ipAddress() {
  const headersList = await headers();
  return headersList.get("x-forwarded_for") ?? "127.0.0.1".split(",")[0];
}

async function userAgent() {
  const headersList = await headers();
  return headersList.get("user-agent") ?? "";
}

function inProduction() {
  return process.env.NODE_ENV === "production";
}

async function createSession(userId: number) {
  return await prisma.session.create({
    data: {
      expires: expiry(),
      userId: userId,
      ipAddress: await ipAddress(),
      userAgent: await userAgent(),
    },
  });
}

async function storeSessionInCookie(session: Session) {
  const cookiesStore = await cookies();
  cookiesStore.set("sessionId", session.id.toString(), {
    httpOnly: true,
    maxAge: oneWeekInMilliseconds(),
    path: "/",
    sameSite: "lax",
    secure: inProduction(),
  });
}

async function currentSession(): Promise<SessionWithUser | never> {
  const cookiesStore = await cookies();
  const sessionId = Number(cookiesStore.get("sessionId")?.value);
  try {
    return await prisma.session.findUniqueOrThrow({
      select: {
        id: true,
        expires: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      where: { id: sessionId },
    });
  } catch {
    redirect(SIGN_IN_PATH);
  }
}

export const getCurrentSession = cache(currentSession);

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  if (!bcrypt.compareSync(password, user.passwordDigest)) {
    throw new Error("Invalid credentials");
  }
  const session = await createSession(user.id);
  storeSessionInCookie(session);
  redirect("/articles");
}

export async function signOut() {
  const cookiesStore = await cookies();
  const sessionId = cookiesStore.get("sessionId")?.value;
  await prisma.session.delete({ where: { id: Number(sessionId) } });
  cookiesStore.delete("sessionId");
  redirect(SIGN_IN_PATH);
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordDigest = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordDigest },
  });
  const session = await createSession(user.id);
  storeSessionInCookie(session);
  redirect("/articles");
}
