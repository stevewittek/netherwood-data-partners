import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "../../components/ServicePages";
import { getService, services } from "../../content/services";

type ServiceRouteProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service)
    return {
      title: "Service not found | Netherwood Data Partners",
      robots: { index: false, follow: false },
    };
  const title = `${service.title} | Netherwood Data Partners`;
  const description = service.description;
  const url = `/services/${slug}/`;
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

export default async function ServicePage({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: `https://netherwooddatapartners.com/services/${slug}/`,
    provider: { "@id": "https://netherwooddatapartners.com/#organization" },
    areaServed: ["New Jersey", "New York City", "United States"],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
        }}
      />
      <ServiceDetailPage slug={slug} />
    </>
  );
}
