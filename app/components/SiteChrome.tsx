import { CampaignAttributionCapture } from "./CampaignAttributionCapture";

type SiteHeaderProps = {
  currentPage?:
    | "home"
    | "about"
    | "articles"
    | "services"
    | "products"
    | "readiness"
    | "contact";
};
function Brand() {
  return (
    <a className="brand" href="/" aria-label="Netherwood Data Partners home">
      <span className="brand-mark" aria-hidden="true">
        N
      </span>
      <span className="brand-name">
        Netherwood<strong>Data Partners</strong>
      </span>
    </a>
  );
}
export function SiteHeader({ currentPage = "home" }: SiteHeaderProps) {
  return (
    <header className="site-header studio-header">
      <CampaignAttributionCapture />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Brand />
      <nav aria-label="Primary navigation">
        <a
          href="/services/"
          aria-current={currentPage === "services" ? "page" : undefined}
        >
          Services
        </a>
        <a
          href="/products/"
          aria-current={currentPage === "products" ? "page" : undefined}
        >
          Products
        </a>
        <a
          href="/articles/"
          aria-current={currentPage === "articles" ? "page" : undefined}
        >
          Articles
        </a>
        <a
          href="/about/"
          aria-current={currentPage === "about" ? "page" : undefined}
        >
          About
        </a>
      </nav>
      <a className="nav-cta" href="/#contact">
        Let’s talk <span aria-hidden="true">↗</span>
      </a>
      <span id="main-content" tabIndex={-1} />
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="studio-footer">
      <div className="studio-footer-top">
        <div>
          <Brand />
          <p>Consulting, software and data tools. Rooted in Netherwood.</p>
        </div>
        <div className="studio-footer-links">
          <a href="/services/">Services</a>
          <a href="/products/">Products</a>
          <a href="/articles/">Articles</a>
          <a href="/about/">About</a>
          <a href="/#contact">Contact</a>
          <a href="/privacy/">Privacy</a>
          <a href="/privacy/motion-relay/">Motion Relay privacy</a>
          <a href="/privacy/motion-relay/delete/">Delete Motion Relay membership</a>
          <a href="/terms/motion-relay/">Motion Relay terms</a>
        </div>
        <a className="studio-text-link" href="/#contact">
          Talk about your business <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="studio-footer-bottom">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          Netherwood Data Partners
        </p>
        <p>Founder-led. New Jersey based. Meetings by appointment.</p>
      </div>
    </footer>
  );
}
