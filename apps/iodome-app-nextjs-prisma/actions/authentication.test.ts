import {
    getCurrentSession,
    register,
    signIn,
    signOut,
} from "@/actions/authentication";
import prisma from "@/prisma/db";
import { SIGN_IN_PATH } from "@/utils/constants";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, MockedFunction, vi } from "vitest";

let cookiesGetMock: MockedFunction<typeof cookies>;
let cookiesDeleteMock: MockedFunction<typeof cookies>;

describe("authentication", () => {
  beforeEach(async () => {
    cookiesGetMock = vi.fn();
    cookiesDeleteMock = vi.fn();

    vi.mock("next/navigation", () => ({
      redirect: vi.fn(),
    }));
    vi.mock("next/headers", () => ({
      headers: vi.fn(() => ({
        get: vi.fn((name) => {
          if (name === "x-forwarded-for") return "127.0.0.1";
          if (name === "user-agent") return "test-user-agent";
          return null;
        }),
      })),
      cookies: vi.fn(() => ({
        get: cookiesGetMock,
        set: vi.fn(),
        delete: cookiesDeleteMock,
      })),
    }));
  });

  describe("getCurrentSession", () => {
    it("redirects if not found", async () => {
      cookiesGetMock.mockReturnValue({
        value: 1,
      } as any);

      await getCurrentSession();

      expect(redirect).toHaveBeenCalledWith(SIGN_IN_PATH);
    });

    it("returns the current session", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "password",
        },
      });
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          expires: new Date(Date.now()),
          ipAddress: "",
          userAgent: "",
        },
      });
      cookiesGetMock.mockReturnValue({
        value: session.id,
      } as any);

      const currentSession = await getCurrentSession();

      expect(currentSession).toMatchObject({
        id: session.id,
        expires: session.expires,
        userId: session.userId,
        user: {
          email: user.email,
        },
      });
    });

    it("includes the current user", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "password",
        },
      });
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          expires: new Date(Date.now()),
          ipAddress: "",
          userAgent: "",
        },
      });
      cookiesGetMock.mockReturnValue({
        value: session.id,
      } as any);

      const currentSession = await getCurrentSession();

      expect(currentSession.user.email).toBe(user.email);
    });
  });

  describe("signIn", () => {
    it("creates a session attached to the signed in user", async () => {
      const user = await prisma.user.create({
        data: {
          email: "user@example.com",
          passwordDigest: bcrypt.hashSync("password", 10),
        },
      });
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("password", "password");

      await signIn(formData);
      const session = await prisma.session.findFirstOrThrow({
        where: { user },
      });

      expect(session.userId).toBe(user.id);
      expect(session.id).toBeTruthy();
      expect(redirect).toHaveBeenCalledWith(`/articles`);
    });

    it("throws an error if the email isn't found", async () => {
      const formData = new FormData();
      formData.append("email", "not_found@example.com");
      formData.append("password", "not_a_password");

      await expect(signIn(formData)).rejects.toThrow(
        /An operation failed because it depends on one or more records that were required but not found/,
      );
    });

    it("throws an error if the password doesn't match", async () => {
      const user = await prisma.user.create({
        data: {
          email: "user@example.com",
          passwordDigest: bcrypt.hashSync("password", 10),
        },
      });
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("password", "wrongpassword");

      await expect(signIn(formData)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("signOut", () => {
    it("deletes the given session", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "password",
        },
      });
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          expires: new Date(Date.now()),
          ipAddress: "",
          userAgent: "",
        },
      });
      cookiesGetMock.mockReturnValue({
        value: session.id,
      } as any);

      await signOut();
      const sessionCount = await prisma.session.count();

      expect(cookiesDeleteMock).toHaveBeenCalledWith("sessionId");
      expect(sessionCount).toBe(0);
      expect(redirect).toHaveBeenCalledWith(SIGN_IN_PATH);
    });
  });

  describe("register", () => {
    it("creates a new user and logs them in", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password");

      await register(formData);
      const user = await prisma.user.findFirstOrThrow({ where: {} });
      const session = await prisma.session.findFirstOrThrow({
        where: { user },
      });

      expect(redirect).toHaveBeenCalledWith(`/articles`);
      expect(user.id).toBeTruthy();
      expect(user.email).toBe("test@example.com");
      expect(user.passwordDigest).toBeTruthy();
      expect(session.userId).toBe(user.id);
      expect(session.id).toBeTruthy();
    });
  });
});
