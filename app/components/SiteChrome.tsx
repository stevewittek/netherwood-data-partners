import { CampaignAttributionCapture } from "./CampaignAttributionCapture";

type SiteHeaderProps = {
  currentPage?:
    | "home"
    | "about"
    | "articles"
    | "services"
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
          href="/migration-readiness/"
          aria-current={currentPage === "readiness" ? "page" : undefined}
        >
          Readiness check
        </a>
        <a
          href="/about/"
          aria-current={currentPage === "about" ? "page" : undefined}
        >
          About
        </a>
        <a
          href="/articles/"
          aria-current={currentPage === "articles" ? "page" : undefined}
        >
          Articles
        </a>
      </nav>
      <a
        className="nav-cta"
        href="/migration-intake/"
        aria-current={currentPage === "contact" ? "page" : undefined}
      >
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
          <p>Your platform. Your data. Your choice.</p>
        </div>
        <div className="studio-footer-links">
          <a href="/services/data-migration/">Data migration</a>
          <a href="/services/database-engineering/">Database engineering</a>
          <a href="/services/">All services</a>
          <a href="/migration-readiness/">Migration readiness</a>
          <a href="/about/">Meet Steven</a>
          <a href="/articles/">Articles & field notes</a>
        </div>
        <a className="studio-text-link" href="/migration-intake/">
          Talk about your migration <span aria-hidden="true">↗</span>
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
