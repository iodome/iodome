import { createArticle } from "@/actions/articles";

export default function ArticleForm({ userId }: { userId: number }) {
  return (
    <form action={createArticle} className="flex flex-col gap-4">
      <input type="hidden" name="authorId" value={userId} />
      <div className="space-y-2">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          className="border block w-full rounded p-2"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="content">Content</label>
        <textarea
          name="content"
          id="content"
          className="border block w-full rounded p-2"
        ></textarea>
      </div>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-2"
      >
        Submit
      </button>
    </form>
  );
}
