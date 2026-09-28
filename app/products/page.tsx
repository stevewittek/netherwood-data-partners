import type { Metadata } from "next";
import { ProductsIndex } from "../components/ProductPages";
import { productsMetadata } from "../content/products";

export const metadata: Metadata = {
  ...productsMetadata,
  alternates: { canonical: "/products/" },
  openGraph: {
    ...productsMetadata,
    type: "website",
    url: "/products/",
    images: ["/og.png"],
  },
  twitter: {
    ...productsMetadata,
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function ProductsPage() {
  return <ProductsIndex />;
}
