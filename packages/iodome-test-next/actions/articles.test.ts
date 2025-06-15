import prisma from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import {
    commentArticle,
    createArticle,
    deleteArticle,
    deleteComment,
    getArticle,
    getArticles,
    getComments,
    updateArticle,
    updateComment,
} from "./articles";

describe("actions", () => {
  describe("getComments", () => {
    it("returns comments for an article in descending order", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "password",
        },
      });
      const article = await prisma.article.create({
        data: {
          title: "title",
          content: "content",
          authorId: user.id,
        },
      });
      const firstComment = await prisma.comment.create({
        data: {
          content: "first comment",
          articleId: article.id,
          authorId: user.id,
        },
      });
      const secondComment = await prisma.comment.create({
        data: {
          content: "second comment",
          articleId: article.id,
          authorId: user.id,
        },
      });
      const thirdComment = await prisma.comment.create({
        data: {
          content: "third comment",
          articleId: article.id,
          authorId: user.id,
        },
      });

      const comments = await getComments(article.id);

      expect(comments).toStrictEqual([
        thirdComment,
        secondComment,
        firstComment,
      ]);
    });
  });
  describe("commentArticle", () => {
    it("should comment on an article", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "password",
        },
      });
      const article = await prisma.article.create({
        data: {
          title: "title",
          content: "content",
          authorId: user.id,
        },
      });
      const formData = new FormData();
      formData.append("articleId", article.id.toString());
      formData.append("authorId", user.id.toString());
      formData.append("content", "new comment");
      await commentArticle(formData);
      const comment = await prisma.comment.findFirstOrThrow({
        where: {
          articleId: article.id,
          authorId: user.id,
        },
      });

      expect(comment.content).toBe("new comment");
    });
  });

  describe("updateArticle", () => {
    it("should update an article", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "hash",
        },
      });
      const article = await prisma.article.create({
        data: {
          title: "Test Article 1",
          content: "Test Content 1",
          authorId: user.id,
        },
      });
      const formData = new FormData();
      formData.append("id", article.id.toString());
      formData.append("authorId", article.authorId.toString());
      formData.append("title", "Test Article 2");
      formData.append("content", "Test Content 2");
      await updateArticle(formData);
      const updatedArticle = await getArticle(article.id);

      expect(updatedArticle.title).toBe("Test Article 2");
      expect(updatedArticle.content).toBe("Test Content 2");
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article", async () => {
      vi.mock("next/navigation", () => ({
        notFound: vi.fn(),
      }));
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "hash",
        },
      });
      const article = await prisma.article.create({
        data: {
          title: "title 1",
          content: "content 1",
          authorId: user.id,
        },
      });
      const formData = new FormData();
      formData.append("id", article.id.toString());

      await deleteArticle(formData);

      expect(await getArticle(article.id)).toBeNull();
    });
  });

  describe("getArticles", () => {
    it("should return an empty array if no articles exist", async () => {
      const articles = await getArticles(1);

      expect(articles.length).toBe(0);
    });

    it("should return an array of articles", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "hash",
        },
      });
      await prisma.article.create({
        data: {
          title: "title 1",
          content: "content 1",
          authorId: user.id,
        },
      });
      await prisma.article.create({
        data: {
          title: "title 2",
          content: "content 2",
          authorId: user.id,
        },
      });

      const articles = await getArticles(user.id);

      expect(articles.length).toBe(2);
    });
  });

  describe("createArticle", () => {
    it("should create an article and redirect to the article page", async () => {
      vi.mock("next/navigation", () => ({
        redirect: vi.fn(),
        notFound: vi.fn(),
      }));
      vi.mock("next/cache", () => ({
        revalidatePath: vi.fn(),
      }));
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "hash",
        },
      });
      const formData = new FormData();
      formData.append("authorId", user.id.toString());
      formData.append("title", "Test Article");
      formData.append("content", "Test Content");

      await createArticle(formData);
      const articles = await getArticles(user.id);

      expect(articles.length).toBe(1);
      expect(revalidatePath).toHaveBeenCalledWith("/articles");
      expect(redirect).toHaveBeenCalledWith(`/articles/${articles[0].id}`);
    });
  });

  describe("updateComment", () => {
    it("should update a comment", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "hash",
        },
      });
      const article = await prisma.article.create({
        data: {
          title: "Test Article 1",
          content: "Test Content 1",
          authorId: user.id,
        },
      });
      const comment = await prisma.comment.create({
        data: {
          articleId: article.id,
          authorId: user.id,
          content: "comment",
        },
      });
      const formData = new FormData();
      formData.append("id", comment.id.toString());
      formData.append("articleId", comment.articleId.toString());
      formData.append("authorId", comment.authorId.toString());
      formData.append("content", "updated comment");
      await updateComment(formData);
      const updatedComment = await prisma.comment.findUniqueOrThrow({
        where: { id: comment.id },
      });

      expect(updatedComment.content).toBe("updated comment");

      expect(revalidatePath).toHaveBeenCalledWith(`/articles/${article.id}`);
      expect(redirect).toHaveBeenCalledWith(`/articles/${article.id}`);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment", async () => {
      vi.mock("next/navigation", () => ({
        notFound: vi.fn(),
        redirect: vi.fn(),
      }));
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordDigest: "hash",
        },
      });
      const article = await prisma.article.create({
        data: {
          title: "title 1",
          content: "content 1",
          authorId: user.id,
        },
      });
      const comment = await prisma.comment.create({
        data: {
          content: "content 1",
          authorId: user.id,
          articleId: article.id,
        },
      });
      const formData = new FormData();
      formData.append("id", comment.id.toString());
      formData.append("articleId", comment.articleId.toString());

      await deleteComment(formData);

      expect(
        await prisma.comment.findUnique({ where: { id: comment.id } }),
      ).toBeNull();
    });
  });
});
