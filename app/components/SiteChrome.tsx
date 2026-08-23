import Link from "next/link";

type SiteHeaderProps = {
  currentPage?: "home" | "about";
};

export function SiteHeader({ currentPage = "home" }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Netherwood Data Partners home">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span className="brand-name">Netherwood <strong>Data Partners</strong></span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link className="nav-about" href="/about" aria-current={currentPage === "about" ? "page" : undefined}>About</Link>
        <Link href="/#services">Services</Link>
        <Link href="/#insights">Insights</Link>
        <Link href="/#approach">Approach</Link>
        <Link className="nav-cta" href="/#contact">Start a conversation</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Link className="brand footer-brand" href="/" aria-label="Netherwood Data Partners home">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span className="brand-name">Netherwood <strong>Data Partners</strong></span>
      </Link>
      <p>Database engineering, performance & data services.</p>
      <p>© {new Date().getFullYear()} Netherwood Data Partners</p>
    </footer>
  );
}
