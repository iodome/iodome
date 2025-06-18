import { getCurrentSession } from "@/actions/authentication";
import Link from "next/link";
import Article from "../article";

export default async function NewArticlePage() {
  const session = await getCurrentSession();

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-xl">New Article</h1>
        <Link href="/articles">Back</Link>
      </div>
      <Article.Form userId={session.userId} />
    </>
  );
}
