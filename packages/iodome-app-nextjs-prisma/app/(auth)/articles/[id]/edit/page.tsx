import { getArticle, updateArticle } from "@/actions/articles";

export default async function EditArticlePage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const article = await getArticle(parseInt(params.id));

  return (
    <>
      <header className="flex justify-between items-center">
        <h1 className="font-semibold text-xl">Edit Article</h1>
        <a href={`/articles/${article.id}`}>Back</a>
      </header>
      <form action={updateArticle} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={article.id} />
        <div className="flex flex-col gap-2">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            id="title"
            className="border rounded p-2"
            defaultValue={article.title}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="content">Content</label>
          <textarea
            name="content"
            id="content"
            defaultValue={article.content}
            className="border rounded p-2"
          ></textarea>
        </div>
        <button
          type="submit"
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-sm"
        >
          Submit
        </button>
      </form>
    </>
  );
}
