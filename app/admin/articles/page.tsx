import type { Metadata } from "next";
import ArticlesAdmin from "../ArticlesAdmin";

export const metadata: Metadata = {
  title: "Article publishing | Netherwood Data Partners",
  description: "Private Netherwood Data Partners article publishing.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function ArticlePublishingPage() {
  return <ArticlesAdmin />;
}
