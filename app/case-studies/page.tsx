import type { Metadata } from "next";
import { EngineeringExperienceIndex } from "../components/EngineeringExperience";
import { experienceMetadata, experiencePath, experienceSchema } from "../content/experience";

export const metadata: Metadata = {
  ...experienceMetadata,
  alternates: { canonical: experiencePath },
  openGraph: { ...experienceMetadata, url: experiencePath, type: "website", images: ["/og.png"] },
  twitter: { ...experienceMetadata, card: "summary_large_image", images: ["/og.png"] },
};
export default function EngineeringExperience() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(experienceSchema()).replaceAll("<", "\\u003c") }} /><EngineeringExperienceIndex /></>;
}
