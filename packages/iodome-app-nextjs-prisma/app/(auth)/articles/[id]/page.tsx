import { commentArticle, deleteArticle, getArticle } from "@/actions/articles";
import { getCurrentSession } from "@/actions/authentication";
import Comment from "@/components/comment";
import prisma from "@/prisma/db";
import Link from "next/link";
import CommentForm from "./comment-form";

export default async function ArticlePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await getCurrentSession();
  const article = await getArticle(parseInt(params.id));
  const comments = await prisma.comment.findMany({
    where: {
      articleId: article.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="font-semibold text-xl">{article.title}</h1>
        <div className="flex gap-4 items-center">
          <Link
            href={`/articles/${article.id}/edit`}
            className="bg-gray-200 hover:bg-gray-300 text-sm text-gray-950 px-3 py-1.5 rounded min-w-16 text-center"
          >
            Edit
          </Link>
          <form action={deleteArticle}>
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm rounded text-white"
            >
              Delete
            </button>
          </form>
        </div>
      </header>
      <article>
        <p>{article.content}</p>
      </article>
      <hr />
      <CommentForm
        action={commentArticle}
        articleId={article.id}
        userId={session.userId}
      />
      {comments.map((comment) => (
        <Comment id={comment.id} key={comment.id}>
          {comment.content}
        </Comment>
      ))}
    </div>
  );
}
