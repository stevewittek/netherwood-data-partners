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
    <div className="product-badges" aria-label="Product status">
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
        <a className="product-link-primary" href={product.productUrl}>
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

function MotionRelayDownloads() {
  return (
    <section className="product-downloads studio-wrap" aria-labelledby="motion-downloads-title">
      <div>
        <p className="eyebrow">Downloads</p>
        <h2 id="motion-downloads-title">Check access before installing.</h2>
        <p>Confirm phone access before installing the Garmin data field.</p>
      </div>
      <div className="platform-download-grid">
        {Object.values(motionRelayDownloads).map((entry) => (
          <article key={entry.storeName}>
            <p>{entry.storeName}</p>
            {entry.storeName === "Apple App Store" && <img className="platform-icon" src="/images/motion-relay/motion-relay-icon.webp" alt="Motion Relay phone app icon" width="640" height="640" loading="lazy" />}
            <h3>{entry.available ? entry.label : `${entry.storeName} — coming soon`}</h3>
            {entry.available && entry.url ? (
              <a className="button button-primary" href={entry.url} target="_blank" rel="noreferrer">
                {entry.label} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <button className="button platform-download-disabled" type="button" disabled aria-disabled="true">Coming soon</button>
            )}
          </article>
        ))}
      </div>
      <p className="product-download-note"><a href={motionRelayRoutes.setup}>Read setup instructions</a>.</p>
    </section>
  );
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
        <ul className="product-platforms" aria-label="Platforms and technologies">
          {product.platforms.map((platform) => (
            <li key={platform}>{platform}</li>
          ))}
        </ul>
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
          <h1>
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
            Motion connects activity readings. QueryVault and PageMover support database investigation.
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
          <h1>There is no product at this address.</h1>
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
          <h1>{product.name}</h1>
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
              <a className="studio-text-link" href="/privacy/">
                Read the website privacy overview <span aria-hidden="true">↗</span>
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
