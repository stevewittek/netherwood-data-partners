import { CampaignAttributionCapture } from "./CampaignAttributionCapture";

type SiteHeaderProps = {
  skipTarget?: string;
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
    <a className="brand" href="/">
      <span className="brand-mark" aria-hidden="true">
        N
      </span>
      <span className="brand-name">
        Netherwood{" "}<strong>Data Partners</strong>
      </span>
    </a>
  );
}
export function SiteHeader({ currentPage = "home", skipTarget = "main-content" }: SiteHeaderProps) {
  return (
    <header className="site-header studio-header">
      <CampaignAttributionCapture />
      <a className="skip-link" href={`#${skipTarget}`}>
        Skip to content
      </a>
      <Brand />
      <nav aria-label="Primary navigation">
        <a
          href="/products/"
          aria-current={currentPage === "products" ? "page" : undefined}
        >
          Products
        </a>
        <a
          href="/services/"
          aria-current={currentPage === "services" ? "page" : undefined}
        >
          Services
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
        Contact <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="studio-footer">
      <div className="studio-footer-top">
        <div>
          <Brand />
          <p>Independent software and data engineering.</p>
        </div>
        <div className="studio-footer-links">
          <a href="/products/">Products</a>
          <a href="/services/">Services</a>
          <a href="/articles/">Articles</a>
          <a href="/about/">About</a>
          <a href="/#contact">Contact</a>
          <a href="/privacy/">Privacy</a>
        </div>
        <a className="studio-text-link" href="/#contact">
          Contact Netherwood <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="studio-footer-bottom">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          Netherwood Data Partners
        </p>
        <p>New Jersey based. Meetings by appointment.</p>
      </div>
    </footer>
  );
}
