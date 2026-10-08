import { SiteFooter, SiteHeader } from "./SiteChrome";
import policies from "../content/motion-relay-policies.json";
import "../products.css";

export function MotionRelayPolicyPage({ kind }: { kind: keyof typeof policies.pages }) {
  const page = policies.pages[kind];
  return (
    <main className="products-page privacy-page">
      <SiteHeader />
      <section className="products-hero studio-wrap">
        <div><p className="eyebrow">Motion Relay</p><h1 id="main-content" tabIndex={-1}>{page.title}</h1></div>
        <div className="products-hero-copy"><p>{page.intro}</p><p className="privacy-updated">Updated {policies.updated}.</p></div>
      </section>
      <section className="privacy-content studio-wrap">
        {page.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.links.map((link) => <p key={link.href}><a href={link.href}>{link.label}</a></p>)}
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
