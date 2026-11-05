import type { Metadata } from "next";
import { HangInThereDadPage } from "../../components/HangInThereDadPage";
import { gameBanner, gameMetadata, gamePath } from "../../content/hang-in-there-dad";

export const metadata: Metadata = {
  ...gameMetadata,
  alternates: { canonical: gamePath },
  openGraph: { title: gameMetadata.title, description: gameMetadata.description, type: "website", url: gamePath,
    images: [{ url: gameBanner, width: 560, height: 256, alt: "Hang in There, Dad! — Dad hangs beside Oreo as the ladder tips away." }] },
  twitter: { title: gameMetadata.title, description: gameMetadata.description, card: "summary_large_image", images: [gameBanner] },
};

export default HangInThereDadPage;
