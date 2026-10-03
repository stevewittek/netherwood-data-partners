import type { Metadata } from "next";
import { MotionRelayDeletionPage } from "../../../components/MotionRelayPrivacyPage";
import { motionRelayDeletionMetadata } from "../../../content/site";

export const metadata: Metadata = {
  ...motionRelayDeletionMetadata,
  alternates: { canonical: "/privacy/motion-relay/delete/" },
  openGraph: { ...motionRelayDeletionMetadata, type: "website", url: "/privacy/motion-relay/delete/", images: ["/og.png"] },
  twitter: { ...motionRelayDeletionMetadata, card: "summary_large_image", images: ["/og.png"] },
};
export default MotionRelayDeletionPage;
