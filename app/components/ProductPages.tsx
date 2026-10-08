import ChatWidget from "../ChatWidget";
import {
  featuredProducts,
  getProduct,
  products,
  type Product,
} from "../content/products";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { motionRelayDownloads, motionRelayRoutes } from "../content/motion-relay";
import { MotionRelayBetaSignup } from "./MotionRelayBetaSignup";
import "../products.css";

function ProductVisual({ product }: { product: Product }) {
  if (product.image)
    return (
      <div className="product-visual product-visual-image">
        <img
          src={product.image.src}
          alt={product.image.alt}
          width={product.image.width}
          height={product.image.height}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  const visualCode = {
    queryvault: "QV",
    "index-maintenance-visualizer": "PM",
  }[product.id] ?? product.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  return (
    <div
      className={`product-visual product-visual-${product.id}`}
      aria-hidden="true"
    >
      <div className="product-visual-topline">
        <span>{product.shortName}</span>
        <i />
      </div>
      <div className="product-visual-grid">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <strong>{visualCode}</strong>
    </div>
  );
}

function ProductBadges({ product }: { product: Product }) {
  return (
    <div className="product-badges" role="group" aria-label="Product status">
      <span>{product.status}</span>
      {product.openSource && <span>Open source</span>}
      {!product.openSource && product.sourceAvailable && (
        <span>Public source</span>
      )}
    </div>
  );
}

function ProductLinks({ product, includeDetail = true }: {
  product: Product;
  includeDetail?: boolean;
}) {
  if (
    !includeDetail &&
    !product.githubUrl &&
    !product.docsUrl &&
    !product.downloadUrl
  )
    return null;
  return (
    <div className="product-links">
      {includeDetail && (
        <a className="product-link-primary" href={product.productUrl} aria-label={`Learn more about ${product.name}`}>
          Learn more <span aria-hidden="true">↗</span>
        </a>
      )}
      {product.githubUrl && (
        <a href={product.githubUrl} target="_blank" rel="noreferrer">
          View source <span aria-hidden="true">↗</span>
        </a>
      )}
      {product.docsUrl && (
        <a href={product.docsUrl} target="_blank" rel="noreferrer">
          Documentation <span aria-hidden="true">↗</span>
        </a>
      )}
      {product.downloadUrl && (
        <a href={product.downloadUrl}>
          Download <span aria-hidden="true">↓</span>
        </a>
      )}
    </div>
  );
}

function PlatformMark({ platform }: { platform: string }) {
  if (platform === "garmin") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 23 21H1Z" fill="currentColor" /></svg>;
  if (platform === "iphone") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.1 12.5c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.2 8.9.8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.6-1-2.6-3.7ZM14.8 6.2c.6-.8 1.1-1.8 1-2.9-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.8 1.1.1 2.2-.6 2.9-1.4Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2 14 12 3 22Z" fill="#4285f4"/><path d="m3 2 14 8-3 2Z" fill="#34a853"/><path d="m14 12 3 2-14 8Z" fill="#ea4335"/><path d="m17 10 4 2-4 2-3-2Z" fill="#fbbc04"/></svg>;
}

function MotionRelayPlatformLinks() {
  return <ul className="motion-platform-links" aria-label="Motion Relay apps">
    {Object.entries(motionRelayDownloads).map(([platform, entry]) => {
      const available = entry.available && entry.url;
      const label = platform === "garmin" ? "Garmin" : platform === "iphone" ? "iPhone" : "Android";
      return <li key={platform}><a href={available ? entry.url! : "storeHome" in entry ? entry.storeHome : motionRelayRoutes.betaSignup}
        aria-label={available ? "Garmin Connect IQ — Motion Relay" : `${label} ${platform === "iphone" ? "App Store" : "Google Play"} homepage — Motion Relay listing pending`}
        target="_blank" rel="noreferrer">
        <PlatformMark platform={platform} /><span><strong>{label}</strong>{" "}<small>{available ? "Connect IQ" : platform === "iphone" ? "App Store" : "Google Play"}</small></span>
      </a></li>;
    })}
  </ul>;
}

function MotionRelayDownloads() {
  return (
    <section className="product-downloads studio-wrap" aria-labelledby="motion-downloads-title">
      <div>
        <p className="eyebrow motion-download-brand"><img src="/images/motion-relay/motion-relay-icon.webp" alt="" width="40" height="40" loading="lazy" />Get Motion Relay</p>
        <h2 id="motion-downloads-title">Your watch. Your phone. One conversation.</h2>
        <p>The Garmin data field is available on Connect IQ. iPhone and Android access requires a beta invitation, which confirms your supported ChatGPT Voice setup.</p>
      </div>
      <MotionRelayPlatformLinks />
      <p className="product-download-note">Phone listings are pending; the store links open their homepages. <a href={motionRelayRoutes.betaSignup}>Request beta access</a> or <a href={motionRelayRoutes.setup}>read setup instructions</a>.</p>
    </section>
  );
}

function MotionRelayQuestions() {
  const questions = [
    "How am I tracking against my race pace, and what could I adjust?",
    "At this pace, when will I finish my 10K?",
    "How much more climbing do I need to reach my 300-metre goal today?",
    "Am I within the heart-rate range I set for this easy run?",
    "Is my current pace faster or slower than my average so far?",
    "Give me a quick check-in: my pace, distance and progress toward my goal."
  ];
  return <section className="product-detail-overview studio-wrap motion-questions">
    <div><p className="eyebrow">Just ask.</p><h2>Turn your workout into a conversation.</h2></div>
    <div className="product-prose"><p>Start with a question. Follow up as your workout unfolds.</p>
      <ul>{questions.map(question => <li key={question}>“{question}”</li>)}</ul>
      <p className="motion-question-note">Example prompts for a supported beta setup. Share your race distance, target pace or climbing goal in the conversation. Answers depend on the live readings your watch provides and the connection; climbing means recorded ascent toward your target, not a prediction of the terrain ahead.</p>
    </div>
  </section>;
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  return (
    <article className={`product-card${compact ? " product-card-compact" : ""}`}>
      <ProductVisual product={product} />
      <div className="product-card-body">
        <div className="product-card-meta">
          <p>{product.category}</p>
          <ProductBadges product={product} />
        </div>
        <h3>{product.name}</h3>
        {product.namingNote && <p className="product-working-name">Working name</p>}
        <p className="product-summary">{product.summary}</p>
        {product.downloadExperience === "motion-relay" ? <MotionRelayPlatformLinks /> : <ul className="product-platforms" aria-label="Platforms and technologies">
          {product.platforms.map((platform) => (
            <li key={platform}>{platform}</li>
          ))}
        </ul>}
        {product.downloadExperience === "motion-relay" && <p className="motion-store-note">Phone listings pending. <a href={motionRelayRoutes.betaSignup}>Request beta access</a>.</p>}
        <ProductLinks product={product} />
      </div>
    </article>
  );
}

export function ProductGrid({ home = false }: { home?: boolean }) {
  const entries = [...(home ? featuredProducts : products)].sort((a, b) =>
    Number(b.id === "garmin-ai-connector") - Number(a.id === "garmin-ai-connector"),
  );
  return (
    <div className={`product-grid${home ? " product-grid-home" : ""}`}>
      {entries.map((product) => (
        <ProductCard key={product.id} product={product} compact={home} />
      ))}
    </div>
  );
}

export function ProductsIndex() {
  return (
    <main className="products-page">
      <SiteHeader currentPage="products" />
      <section className="products-hero studio-wrap">
        <div>
          <p className="eyebrow">Independent software</p>
          <h1 id="main-content" tabIndex={-1}>
            Apps and tools<br />built around data.
          </h1>
        </div>
        <div className="products-hero-copy">
          <p>
            I build software for problems I encounter in database work and while running. Each product connects useful information to a specific task.
          </p>
          <p>
            Check each product’s availability before getting started.
          </p>
          <div className="products-hero-actions">
            <a className="button button-primary" href="#product-list">
              Explore the products <span aria-hidden="true">↓</span>
            </a>
            <a className="studio-text-link" href="/services/">
              Looking for consulting? <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
      <section className="products-list studio-wrap" id="product-list">
        <div className="products-section-heading">
          <div>
            <p className="eyebrow">Current products</p>
            <h2>Running data and database tools.</h2>
          </div>
          <p>
            Motion Relay brings live workouts into the conversation. QueryVault and PageMover support database investigation.
          </p>
        </div>
        <ProductGrid />
      </section>
      <section className="products-contact studio-wrap">
        <p>Developed by Netherwood Data Partners</p>
        <div>
          <h2>Questions or product feedback?</h2>
          <a className="button button-primary" href="/#contact">
            Contact Netherwood <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product)
    return (
      <main className="products-page">
        <SiteHeader currentPage="products" />
        <section className="product-not-found studio-wrap">
          <p className="eyebrow">Product not found</p>
          <h1 id="main-content" tabIndex={-1}>There is no product at this address.</h1>
          <a className="button button-primary" href="/products/">
            View products
          </a>
        </section>
        <SiteFooter />
      </main>
    );

  return (
    <main className="products-page product-detail-page">
      <SiteHeader currentPage="products" />
      <section className="product-detail-hero studio-wrap">
        <div className="product-detail-copy">
          <nav className="product-breadcrumb" aria-label="Breadcrumb">
            <a href="/products/">Products</a>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </nav>
          <p className="eyebrow">{product.category}</p>
          <h1 id="main-content" tabIndex={-1}>{product.name}</h1>
          {product.namingNote && (
            <p className="product-name-note">{product.namingNote}</p>
          )}
          <p className="product-detail-summary">{product.summary}</p>
          <ProductBadges product={product} />
          <ProductLinks product={product} includeDetail={false} />
          {product.downloadExperience === "motion-relay" && <div className="product-links"><a className="product-link-primary" href={motionRelayRoutes.betaSignup}>Request beta access <span aria-hidden="true">↗</span></a><a href={motionRelayRoutes.setup}>Setup and help <span aria-hidden="true">↗</span></a></div>}
        </div>
        <ProductVisual product={product} />
      </section>
      <section className="product-detail-overview studio-wrap">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Why I’m building it.</h2>
        </div>
        <div className="product-prose">
          {product.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {product.availabilityNote && (
            <div className="product-availability" role="note" aria-label="Availability">
              <strong>Availability</strong>
              <p>{product.availabilityNote}</p>
            </div>
          )}
        </div>
      </section>
      {product.downloadExperience === "motion-relay" && <MotionRelayQuestions />}
      {product.downloadExperience === "motion-relay" && <MotionRelayDownloads />}
      {product.downloadExperience === "motion-relay" && <MotionRelayBetaSignup />}
      {product.features.length > 0 && (
        <section className="product-detail-features">
          <div className="studio-wrap">
            <div className="products-section-heading">
              <div>
                <p className="eyebrow">Product scope</p>
                <h2>{product.featureHeading}</h2>
              </div>
            </div>
            <div className="product-feature-grid">
              {product.features.map((feature, index) => (
                <article key={feature.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {product.setup && product.setup.notes.length > 0 && (
        <section className="product-detail-overview studio-wrap">
          <div>
            <p className="eyebrow">Getting started</p>
            <h2>{product.setup.title}</h2>
          </div>
          <div className="product-prose">
            {product.setup.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>
      )}
      {product.screenshots && product.screenshots.length > 0 && (
        <section className="product-screenshots studio-wrap">
          <div>
            <p className="eyebrow">Screenshots</p>
            <h2>Watch preview.</h2>
          </div>
          <div className="product-screenshot-grid">
            {product.screenshots.map((screenshot) => (
              <figure key={screenshot.src}>
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={screenshot.width}
                  height={screenshot.height}
                  loading="lazy"
                  decoding="async"
                />
                {screenshot.caption && (
                  <figcaption>{screenshot.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
      {product.privacy && product.privacy.length > 0 && (
        <section className="product-privacy">
          <div className="studio-wrap">
            <div>
              <p className="eyebrow">Privacy direction</p>
              <h2>Activity data and sharing.</h2>
            </div>
            <div className="product-prose">
              {product.privacy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <a className="studio-text-link" href={product.downloadExperience === "motion-relay" ? motionRelayRoutes.privacy : "/privacy/"}>
                Read the privacy notice <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      )}
      {((product.releaseNotes && product.releaseNotes.length > 0) ||
        (product.relatedArticles && product.relatedArticles.length > 0)) && (
        <section className="product-resources studio-wrap">
          <div>
            <p className="eyebrow">Resources</p>
            <h2>Updates and related reading.</h2>
          </div>
          <div className="product-resource-groups">
            {product.releaseNotes && product.releaseNotes.length > 0 && (
              <div>
                <h3>Release notes</h3>
                {product.releaseNotes.map((item) => (
                  <a key={item.url} href={item.url}>
                    {item.title} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
            {product.relatedArticles && product.relatedArticles.length > 0 && (
              <div>
                <h3>Related articles</h3>
                {product.relatedArticles.map((item) => (
                  <a key={item.url} href={item.url}>
                    {item.title} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <section className="product-support studio-wrap">
        <div>
          <p className="eyebrow">Support & questions</p>
          <h2>Contact the developer.</h2>
        </div>
        <div>
          <p>{product.support}</p>
          <a href="mailto:contact@NetherwoodDataPartners.com">
            contact@NetherwoodDataPartners.com
          </a>
        </div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
