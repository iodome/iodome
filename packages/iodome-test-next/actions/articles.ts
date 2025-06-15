"use server";

import prisma from "@/prisma/db";
import { Article } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

export async function getArticle(id: number): Promise<Article> {
  const article = await prisma.article.findUnique({
    where: { id },
  });
  if (!article) notFound();
  return article;
}

export async function getComments(articleId: number) {
  return await prisma.comment.findMany({
    where: { articleId },
    orderBy: {
      id: "desc",
    },
  });
}

export async function updateArticle(formData: FormData): Promise<void> {
  const data = {
    id: parseInt(formData.get("id") as string),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };
  await prisma.article.update({
    where: { id: parseInt(formData.get("id") as string) },
    data,
  });
  revalidatePath("/articles");
  redirect(`/articles/${data.id}`);
}

export async function getArticles(authorId: number): Promise<Article[]> {
  return await prisma.article.findMany({ where: { authorId } });
}

export async function deleteArticle(formData: FormData): Promise<void> {
  const id = parseInt(formData.get("id") as string);
  await prisma.article.delete({ where: { id } });
  revalidatePath("/articles");
  redirect(`/articles`);
}

export async function createArticle(formData: FormData): Promise<void> {
  const data = {
    authorId: Number(formData.get("authorId")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };

  const article = await prisma.article.create({ data });

  revalidatePath("/articles");
  redirect(`/articles/${article.id}`);
}

export async function commentArticle(formData: FormData) {
  const data = {
    authorId: Number(formData.get("authorId")),
    articleId: Number(formData.get("articleId")),
    content: formData.get("content") as string,
  };

  await prisma.comment.create({ data });

  revalidatePath(`/articles/${data.articleId}`);
  redirect(`/articles/${data.articleId}`);
}

export async function updateComment(formData: FormData) {
  const data = {
    id: Number(formData.get("id")),
    authorId: Number(formData.get("authorId")),
    articleId: Number(formData.get("articleId")),
    content: formData.get("content") as string,
  };

  await prisma.comment.update({
    where: { id: data.id },
    data,
  });

  revalidatePath(`/articles/${data.articleId}`);
  redirect(`/articles/${data.articleId}`);
}

export async function deleteComment(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const articleId = parseInt(formData.get("articleId") as string);
  await prisma.comment.delete({ where: { id } });

  revalidatePath(`/articles/${articleId}`);
  redirect(`/articles/${articleId}`);
}
