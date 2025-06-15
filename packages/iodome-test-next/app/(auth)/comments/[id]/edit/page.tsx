import { updateComment } from "@/actions/articles";
import CommentForm from "@/app/(auth)/articles/[id]/comment-form";
import prisma from "@/prisma/db";

export default async function CommentEditPage(props: {
  params: Promise<{ id: number }>;
}) {
  const params = await props.params;

  const { id } = params;

  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: Number(id) },
  });
  return (
    <CommentForm
      action={updateComment}
      id={comment.id}
      articleId={comment.articleId}
      userId={comment.authorId}
      content={comment.content}
    />
  );
}
