import type { Metadata } from "next";
import snapshot from "../../../pages-site/articles-snapshot.json";
import { ArticlePage, type PublicArticle } from "../Articles";

type ArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

type ArticleSnapshot = {
  articles: PublicArticle[];
};

const published = (snapshot as ArticleSnapshot).articles;

export function generateStaticParams() {
  return published.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = published.find((candidate) => candidate.slug === slug);
  if (!article) {
    return {
      title: "Article not found | Netherwood Data Partners",
      description: "This article is not available.",
      alternates: { canonical: `/articles/${slug}` },
      robots: { index: false, follow: false, nocache: true },
    };
  }

  const title = `${article.title} | Netherwood Data Partners`;
  const description = article.seoDescription || article.summary;
  const images = [article.featuredImage || "/og.png"];
  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/articles/${article.slug}`,
      publishedTime: article.publishedDate,
      modifiedTime: article.modifiedDate,
      authors: [article.author],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function PublishedArticlePage({ params }: ArticleRouteProps) {
  const { slug } = await params;
  return <ArticlePage slug={slug} />;
}
