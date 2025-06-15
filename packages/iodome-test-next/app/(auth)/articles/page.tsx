import { getArticles } from "@/actions/articles";
import { getCurrentSession } from "@/actions/authentication";
import { Article } from "@prisma/client";
import Link from "next/link";

export default async function ArticlesPage() {
  const session = await getCurrentSession();
  const articles = await getArticles(session.userId);

  function hasArticles() {
    return articles.length > 0;
  }

  return (
    <>
      <header className="flex justify-between items-center gap-4">
        <h1 className="font-semibold text-xl">Articles</h1>
        <Link
          href="/articles/new"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          New Article
        </Link>
      </header>
      <ul>
        {hasArticles() ? (
          articles.map((article) => (
            <ArticleListing article={article} key={article.id} />
          ))
        ) : (
          <EmptyState>No articles exist yet.</EmptyState>
        )}
      </ul>
    </>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="p-4 bg-gray-200 rounded-lg">{children}</div>;
}

function ArticleListing({ article }: { article: Article }) {
  return (
    <li>
      <Link
        href={`/articles/${article.id}`}
        className="text-blue-600 hover:text-blue-700 underline"
      >
        {article.title}
      </Link>
    </li>
  );
}
