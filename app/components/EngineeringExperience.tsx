import { SiteFooter, SiteHeader } from "./SiteChrome";
import {
  engineeringExperience as content,
  engineeringStories,
  experiencePath,
  getEngineeringStory,
  getStoriesForService,
  storyPath,
  type EngineeringStory,
} from "../content/experience";
import { getService } from "../content/services";
import "../experience.css";

function StoryLink({ story, index = 0, headingLevel = 3 }: {
  story: EngineeringStory;
  index?: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="experience-story-link">
      <p className="eyebrow">{String(index + 1).padStart(2, "0")} · {story.category}</p>
      <Heading><a href={storyPath(story)}>{story.title}<span aria-hidden="true"> ↗</span></a></Heading>
      <p>{story.summary}</p>
      <a className="experience-read-link" href={storyPath(story)} aria-label={`Read story: ${story.title}`}>
        Read the story <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export function HomeEngineeringExperience() {
  const featured = content.homeTeaser.featuredStories
    .map(getEngineeringStory)
    .filter((story): story is EngineeringStory => Boolean(story));
  return (
    <section className="community-section studio-wrap experience-home" id="engineering-experience" aria-labelledby="home-experience-heading">
      <div className="community-section-heading">
        <div><p className="eyebrow">Engineering experience</p><h2 id="home-experience-heading">{content.homeTeaser.heading}</h2></div>
        <p>{content.homeTeaser.paragraph}</p>
      </div>
      <div className="experience-featured">
        {featured.map((story, index) => <StoryLink key={story.id} story={story} index={index} />)}
      </div>
      <p className="experience-attribution">Selected career work from prior employment and consulting engagements.</p>
      <div className="studio-actions"><a className="studio-text-link" href={experiencePath}>{content.homeTeaser.linkLabel} <span aria-hidden="true">↗</span></a></div>
    </section>
  );
}

function ExperienceContact() {
  return (
    <section className="experience-contact">
      <div className="studio-wrap experience-section-heading">
        <div><p className="eyebrow">Work with Netherwood</p><h2>{content.closing.heading}</h2></div>
        <div><p>{content.closing.paragraph}</p><a className="button button-primary" href={content.closing.href}>{content.closing.linkLabel} <span aria-hidden="true">↗</span></a><p className="experience-email"><a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a></p></div>
      </div>
    </section>
  );
}

function ModernEngineering() {
  const practice = content.currentPractice;
  return (
    <section className="experience-modern experience-section" id="modern-engineering" aria-labelledby="modern-engineering-heading">
      <div className="studio-wrap">
        <div className="experience-section-heading">
          <div><p className="eyebrow">Current independent development</p><h2 id="modern-engineering-heading">{practice.title}</h2></div>
          <div className="experience-prose">{practice.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
        <div className="experience-projects">
          {practice.projects.map((project) => (
            <article key={project.name}>
              <h3>{project.name}</h3><p>{project.text}</p>
              <a className="experience-read-link" href={project.href}>Explore {project.name} <span aria-hidden="true">↗</span></a>
              {project.evidenceUrl && <a className="experience-read-link" href={project.evidenceUrl}>Public project evidence <span aria-hidden="true">↗</span></a>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EngineeringExperienceIndex() {
  return (
    <main className="experience-page">
      <SiteHeader currentPage="experience" />
      <section className="studio-wrap experience-hero">
        <p className="eyebrow">{content.title}</p>
        <h1 id="main-content" tabIndex={-1}>{content.headline}</h1>
        <div className="experience-introduction">{content.introduction.map((paragraph, index) => <p className={index === 0 ? "experience-lede" : undefined} key={paragraph}>{paragraph}</p>)}</div>
        <p className="experience-attribution">{content.careerAttribution}</p>
        <div className="studio-actions"><a className="studio-text-link" href="#career-stories">Explore the stories <span aria-hidden="true">↓</span></a><a className="studio-text-link" href="#modern-engineering">How I work today <span aria-hidden="true">↓</span></a></div>
      </section>
      <section className="studio-wrap experience-highlights" aria-label="Selected results and engineering scale">
        {content.highlights.map((highlight) => <div key={highlight.value}><strong>{highlight.value}</strong><p>{highlight.label}</p><span>{highlight.kind}</span></div>)}
      </section>
      <section className="studio-wrap experience-section" id="career-stories" aria-labelledby="career-stories-heading">
        <p className="eyebrow">Career work</p><h2 id="career-stories-heading">The business. The engineering. The outcome.</h2>
        <div className="experience-story-list">{engineeringStories.map((story, index) => <StoryLink key={story.id} story={story} index={index} headingLevel={3} />)}</div>
      </section>
      <ModernEngineering /><ExperienceContact /><SiteFooter />
    </main>
  );
}

export function EngineeringStoryPage({ slug }: { slug: string }) {
  const story = getEngineeringStory(slug);
  if (!story) {
    return <main className="experience-page"><SiteHeader currentPage="experience" /><section className="studio-wrap experience-hero"><h1 id="main-content" tabIndex={-1}>Engineering story not found.</h1><a href={experiencePath}>Explore engineering experience</a></section><SiteFooter /></main>;
  }
  const related = engineeringStories.filter((item) => item.id !== story.id && item.relatedServices.some((service) => story.relatedServices.includes(service))).slice(0, 2);
  return (
    <main className="experience-page">
      <SiteHeader currentPage="experience" />
      <article>
        <header className="studio-wrap experience-hero experience-story-hero">
          <a className="experience-back" href={experiencePath}>← All engineering experience</a>
          <p className="eyebrow">{story.category}</p><h1 id="main-content" tabIndex={-1}>{story.title}</h1><p className="experience-lede">{story.summary}</p>
          <p className="experience-attribution">Steven Wittek’s prior employment and consulting experience · Organization anonymized</p>
        </header>
        <div className="studio-wrap experience-story-layout">
          <aside className="experience-ownership" aria-labelledby="contribution-heading">
            <h2 id="contribution-heading">My contribution</h2><p>{story.ownership}</p>
            <h2>Technologies and methods</h2><ul>{story.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
          </aside>
          <div className="experience-prose">
            <h2>The work</h2>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <section className="experience-outcome" aria-labelledby="outcome-heading"><h2 id="outcome-heading">Engineering outcome</h2><p>{story.outcome}</p></section>
            <section className="experience-service-connections" aria-labelledby="experience-services-heading">
              <h2 id="experience-services-heading">Related services</h2>
              <ul>{story.relatedServices.map((slug) => { const service = getService(slug); return service ? <li key={slug}><a href={`/services/${slug}/`}>{service.title} <span aria-hidden="true">↗</span></a></li> : null; })}</ul>
            </section>
          </div>
        </div>
      </article>
      {related.length > 0 && <section className="studio-wrap experience-section" aria-labelledby="related-experience-heading"><p className="eyebrow">More from the work</p><h2 id="related-experience-heading">Related engineering experience.</h2><div className="experience-featured experience-featured-two">{related.map((item, index) => <StoryLink key={item.id} story={item} index={index} />)}</div></section>}
      <ExperienceContact /><SiteFooter />
    </main>
  );
}

export function RelatedEngineeringExperience({ serviceSlug }: { serviceSlug?: string }) {
  const stories = serviceSlug ? getStoriesForService(serviceSlug).slice(0, 2) : engineeringStories.filter((story) => content.homeTeaser.featuredStories.includes(story.id));
  const currentPractice = serviceSlug && content.currentPractice.relatedServices.includes(serviceSlug);
  if (!stories.length && !currentPractice) return null;
  return (
    <section className="studio-wrap services-section experience-related" aria-labelledby="service-experience-heading">
      <p className="eyebrow">Experience behind the service</p><h2 id="service-experience-heading">Engineering in practice.</h2>
      <p className="experience-attribution">Selected work from prior employment and consulting engagements, alongside current independent development.</p>
      {stories.length > 0 && <div className="experience-featured experience-featured-two">{stories.map((story, index) => <StoryLink key={story.id} story={story} index={index} />)}</div>}
      {currentPractice && <p className="experience-current-link"><a href={`${experiencePath}#modern-engineering`}>Explore my current AI-assisted engineering approach and independent software <span aria-hidden="true">↗</span></a></p>}
      <a className="experience-read-link" href={experiencePath}>All engineering experience <span aria-hidden="true">↗</span></a>
    </section>
  );
}
