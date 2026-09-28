import type { Metadata } from "next";
import PrivacyPage from "../components/PrivacyPage";
import { privacyMetadata } from "../content/site";

export const metadata: Metadata = {
  ...privacyMetadata,
  alternates: { canonical: "/privacy/" },
  openGraph: {
    ...privacyMetadata,
    type: "website",
    url: "/privacy/",
    images: ["/og.png"],
  },
  twitter: {
    ...privacyMetadata,
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default PrivacyPage;
