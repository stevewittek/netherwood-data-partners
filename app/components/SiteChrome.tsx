/* eslint-disable @next/next/no-html-link-for-pages */

type SiteHeaderProps = {
  currentPage?: "home" | "about";
};

export function SiteHeader({ currentPage = "home" }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Netherwood Data Partners home">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span className="brand-name">Netherwood <strong>Data Partners</strong></span>
      </a>
      <nav aria-label="Primary navigation">
        <a className="nav-about" href="/about" aria-current={currentPage === "about" ? "page" : undefined}>About</a>
        <a href="/#services">Services</a>
        <a href="/#insights">Insights</a>
        <a href="/#approach">Approach</a>
        <a className="nav-cta" href="/#contact">Start a conversation</a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <a className="brand footer-brand" href="/" aria-label="Netherwood Data Partners home">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span className="brand-name">Netherwood <strong>Data Partners</strong></span>
      </a>
      <p>Database engineering, performance & data services.</p>
      <p>© {new Date().getFullYear()} Netherwood Data Partners</p>
    </footer>
  );
}
