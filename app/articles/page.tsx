import type { Metadata } from "next";
import { ArticlesIndex } from "./Articles";

const description = "Notes on SQL Server performance, recovery and data migrations.";

export const metadata: Metadata = {
  title: "Articles | Netherwood Data Partners",
  description,
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "Articles | Netherwood Data Partners",
    description,
    type: "website",
    url: "/articles/",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles | Netherwood Data Partners",
    description,
    images: ["/og.png"],
  },
};

export default function ArticlesPage() {
  return <ArticlesIndex />;
}
