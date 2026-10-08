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
      {kind === "support" && (
        <section className="product-screenshots studio-wrap" aria-labelledby="watch-status-help">
          <div>
            <p className="eyebrow">Watch status examples</p>
            <h2 id="watch-status-help">Check the connection stage.</h2>
            <p>These Garmin simulator screenshots illustrate the watch status display. They do not verify a physical connection or delivery to your assistant.</p>
          </div>
          <div className="product-screenshot-grid">
            <figure>
              <img src="/images/motion-relay/motion-connect-connecting.webp" alt="Garmin simulator showing Motion Connect with the status Connecting" width={484} height={686} loading="lazy" decoding="async" />
              <figcaption>Connecting: check Garmin Connect, your selected watch and the phone app.</figcaption>
            </figure>
            <figure>
              <img src="/images/motion-relay/motion-connect-phone-received.webp" alt="Garmin simulator showing Motion Connect with Phone received and Cloud not confirmed" width={484} height={686} loading="lazy" decoding="async" />
              <figcaption>Phone received — Cloud not confirmed: the phone acknowledged the watch message. This does not confirm assistant delivery; check the phone and assistant connection separately.</figcaption>
            </figure>
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
