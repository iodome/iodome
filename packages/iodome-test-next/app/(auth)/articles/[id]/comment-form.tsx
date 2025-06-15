export default function CommentForm({
  id,
  articleId,
  userId,
  content,
  action,
}: {
  id?: number;
  articleId: number;
  userId: number;
  content?: string;
  action: string | ((formData: FormData) => void | Promise<void> | undefined);
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="authorId" value={userId} />
      <div className="flex flex-col gap-4">
        <label htmlFor="content">New Comment</label>
        <input
          type="text"
          id="content"
          name="content"
          defaultValue={content}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-sm text-white px-3 py-1.5 rounded min-w-16 text-center"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
