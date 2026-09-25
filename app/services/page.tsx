import type { Metadata } from "next";
import { ServicesIndex } from "../components/ServicePages";
import { servicesMetadata } from "../content/services";

export const metadata: Metadata = {
  ...servicesMetadata,
  alternates: { canonical: "/services/" },
  openGraph: {
    ...servicesMetadata,
    type: "website",
    url: "/services/",
    images: ["/og.png"],
  },
  twitter: {
    ...servicesMetadata,
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function ServicesPage() {
  return <ServicesIndex />;
}
