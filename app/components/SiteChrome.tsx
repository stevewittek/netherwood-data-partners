type SiteHeaderProps = { currentPage?: "home" | "about" | "articles" };
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
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Brand />
      <nav aria-label="Primary navigation">
        <a href="/#business-systems">Business help</a>
        <a href="/#database-services">Database help</a>
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
          <p>Serious expertise. Down-to-earth help.</p>
        </div>
        <div className="studio-footer-links">
          <a href="/#business-systems">Business systems</a>
          <a href="/#database-services">Database engineering</a>
          <a href="/about/">Meet Steven</a>
          <a href="/articles/">Articles & field notes</a>
        </div>
        <a className="studio-text-link" href="/#contact">
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="studio-footer-bottom">
        <p>© {new Date().getFullYear()} Netherwood Data Partners</p>
        <p>Founder-led. New Jersey based. Meetings by appointment.</p>
      </div>
    </footer>
  );
}
