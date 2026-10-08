import type { Metadata } from "next";
import { MotionRelaySupportPage } from "../../components/MotionRelaySupportPage";
import { motionRelaySupportMetadata } from "../../content/site";

export const metadata: Metadata = {
  ...motionRelaySupportMetadata,
  alternates: { canonical: "/support/motion-relay/" },
  openGraph: {
    ...motionRelaySupportMetadata,
    type: "website",
    url: "/support/motion-relay/",
    images: ["/og.png"],
  },
  twitter: {
    ...motionRelaySupportMetadata,
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default MotionRelaySupportPage;
