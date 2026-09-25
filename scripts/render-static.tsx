import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import SiteRouter from "../app/SiteRouter";
import AboutPage from "../app/about/page";
import snapshot from "../pages-site/articles-snapshot.json";

export const renderContentDigest = snapshot.contentDigest;

// Build-time rendering only. GitHub Pages continues to serve ordinary static files.
// The same React components hydrate on the browser; no runtime server is added.
export function renderPage(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return renderToString(
    <StrictMode>
      {normalized === "/about" ? (
        <AboutPage />
      ) : (
        <SiteRouter path={normalized} />
      )}
    </StrictMode>,
  );
}
