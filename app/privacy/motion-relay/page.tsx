import type { Metadata } from "next";
import { MotionRelayPrivacyPage } from "../../components/MotionRelayPrivacyPage";
import { motionRelayPrivacyMetadata } from "../../content/site";

export const metadata: Metadata = {
  ...motionRelayPrivacyMetadata,
  alternates: { canonical: "/privacy/motion-relay/" },
  openGraph: { ...motionRelayPrivacyMetadata, type: "website", url: "/privacy/motion-relay/", images: ["/og.png"] },
  twitter: { ...motionRelayPrivacyMetadata, card: "summary_large_image", images: ["/og.png"] },
};
export default MotionRelayPrivacyPage;
