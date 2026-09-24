import type { Metadata } from "next";
import { ArticlesIndex } from "./Articles";

const description = "Practical notes on software changes, moving business data, backups and the technical work behind reliable systems.";

export const metadata: Metadata = {
  title: "Articles & Field Notes | Netherwood Data Partners",
  description,
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "Articles & Field Notes | Netherwood Data Partners",
    description,
    type: "website",
    url: "/articles/",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles & Field Notes | Netherwood Data Partners",
    description,
    images: ["/og.png"],
  },
};

export default function ArticlesPage() {
  return <ArticlesIndex />;
}
