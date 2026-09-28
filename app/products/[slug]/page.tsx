import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../components/ProductPages";
import { getProduct, products } from "../../content/products";

type ProductRouteProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product)
    return {
      title: "Product not found | Netherwood Data Partners",
      robots: { index: false, follow: false },
    };
  const title = product.name + " | Netherwood Data Partners";
  const description = product.summary;
  const url = product.productUrl;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: ["/og.png"],
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: ["/og.png"],
    },
  };
}

export default async function ProductPage({ params }: ProductRouteProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.summary,
    url: "https://netherwooddatapartners.com" + product.productUrl,
    applicationCategory: product.category,
    operatingSystem: product.platforms.join(", "),
    creator: {
      "@id": "https://netherwooddatapartners.com/#organization",
      "@type": "Organization",
      name: "Netherwood Data Partners",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
        }}
      />
      <ProductDetailPage slug={slug} />
    </>
  );
}
