import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngineeringStoryPage } from "../../components/EngineeringExperience";
import { engineeringStories, getEngineeringStory, storyMetadata, storyPath, experienceSchema } from "../../content/experience";

type RouteProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return engineeringStories.map((story) => ({ slug: story.id })); }
export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getEngineeringStory(slug);
  if (!story) return { title: "Engineering story not found", robots: { index: false, follow: false } };
  const fields = storyMetadata(story);
  const url = storyPath(story);
  return { ...fields, alternates: { canonical: url }, openGraph: { ...fields, url, type: "article", images: ["/og.png"] }, twitter: { ...fields, card: "summary_large_image", images: ["/og.png"] } };
}
export default async function EngineeringStory({ params }: RouteProps) {
  const { slug } = await params;
  const story = getEngineeringStory(slug);
  if (!story) notFound();
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(experienceSchema(story)).replaceAll("<", "\\u003c") }} /><EngineeringStoryPage slug={slug} /></>;
}
