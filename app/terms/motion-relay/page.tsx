import type { Metadata } from "next";
import { MotionRelayTermsPage } from "../../components/MotionRelayTermsPage";
import { motionRelayTermsMetadata } from "../../content/site";

export const metadata: Metadata = {
  ...motionRelayTermsMetadata,
  alternates: { canonical: "/terms/motion-relay/" },
  openGraph: { ...motionRelayTermsMetadata, type: "website", url: "/terms/motion-relay/", images: ["/og.png"] },
  twitter: { ...motionRelayTermsMetadata, card: "summary_large_image", images: ["/og.png"] },
};

export default MotionRelayTermsPage;
