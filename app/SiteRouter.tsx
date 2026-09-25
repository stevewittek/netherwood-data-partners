import { useEffect } from "react";
import Home from "./page";
import { ArticlePage, ArticlesIndex } from "./articles/Articles";
import ArticlesAdmin from "./admin/ArticlesAdmin";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { ServiceDetailPage, ServicesIndex } from "./components/ServicePages";
import MigrationIntakePage from "./migration-intake/page";
import MigrationReadinessPage from "./migration-readiness/page";

export default function SiteRouter({ path }: { path?: string } = {}) {
  // On a direct /#contact (or cross-page CTA), the static shell has no anchor
  // until React mounts. Apply that initial fragment after its target exists.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const fragment = window.location.hash.slice(1);
      if (fragment)
        document
          .getElementById(fragment)
          ?.scrollIntoView({ behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const requestedPath =
    path ?? (typeof window === "undefined" ? "/" : window.location.pathname);
  const pathname =
    requestedPath.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
  if (pathname === "/") return <Home />;
  if (pathname === "/services") return <ServicesIndex />;
  if (pathname === "/migration-intake") return <MigrationIntakePage />;
  if (pathname === "/migration-readiness") return <MigrationReadinessPage />;
  const serviceMatch = pathname.match(
    /^\/services\/([a-z0-9]+(?:-[a-z0-9]+)*)$/,
  );
  if (serviceMatch) return <ServiceDetailPage slug={serviceMatch[1]} />;
  if (pathname === "/articles") return <ArticlesIndex />;
  if (pathname === "/admin/articles") return <ArticlesAdmin />;
  const articleMatch = pathname.match(
    /^\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)$/,
  );
  if (articleMatch) return <ArticlePage slug={articleMatch[1]} />;
  return (
    <main>
      <SiteHeader />
      <section className="article-not-found">
        <p className="eyebrow">Page not found</p>
        <h1>There is nothing at this address.</h1>
        <a className="button button-primary" href="/">
          Return home
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
