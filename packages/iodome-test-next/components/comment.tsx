import { deleteComment } from "@/actions/articles";
import prisma from "@/prisma/db";
import Link from "next/link";
import { ReactNode } from "react";

export default async function Comment({
  id,
  children,
}: {
  id: number;
  children: ReactNode;
}) {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id },
    include: {
      author: true,
    },
  });
  return (
    <>
      <div className="bg-gray-200 border p-4 rounded-lg flex justify-between items-center">
        <div className="flex flex-col gap-4">
          <span className="text-gray-500">{comment.author.email}</span>
          <span>{children}</span>
        </div>
        <div
          data-testid={`comment-actions-${comment.id}`}
          className="flex gap-4"
        >
          <Link href={`/comments/${comment.id}/edit`}>Edit</Link>
          <form action={deleteComment}>
            <input type="hidden" id="id" name="id" value={comment.id} />
            <input
              type="hidden"
              id="articleId"
              name="articleId"
              value={comment.articleId}
            />
            <button type="submit">Delete</button>
          </form>
        </div>
      </div>
    </>
  );
}
