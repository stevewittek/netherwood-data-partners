import { useEffect } from "react";
import Home from "./page";
import { ArticlePage, ArticlesIndex } from "./articles/Articles";
import ArticlesAdmin from "./admin/ArticlesAdmin";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

export default function SiteRouter() {
  // On a direct /#contact (or cross-page CTA), the static shell has no anchor
  // until React mounts. Apply that initial fragment after its target exists.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const fragment = window.location.hash.slice(1);
      if (fragment) document.getElementById(fragment)?.scrollIntoView({ behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/") return <Home />;
  if (pathname === "/articles") return <ArticlesIndex />;
  if (pathname === "/admin/articles") return <ArticlesAdmin />;
  const articleMatch = pathname.match(/^\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (articleMatch) return <ArticlePage slug={articleMatch[1]} />;
  return (
    <main>
      <SiteHeader />
      <section className="article-not-found">
        <p className="eyebrow">Page not found</p>
        <h1>There is nothing at this address.</h1>
        <a className="button button-primary" href="/">Return home</a>
      </section>
      <SiteFooter />
    </main>
  );
}
