import { ReactNode } from "react";
import ArticleForm from "./form";

function Article({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

Article.Form = ArticleForm;

export default Article;
