"use client";

import { useEffect, useMemo, useState } from "react";
import ChatWidget from "../ChatWidget";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import snapshot from "../../pages-site/articles-snapshot.json";

export type PublicArticle = {
  articleId: string;
  title: string;
  slug: string;
  summary: string;
  html?: string;
  category: string;
  tags: string[];
  author: string;
  status: "Published";
  featuredImage?: string;
  publishedDate: string;
  createdDate: string;
  modifiedDate: string;
};

type Snapshot = { generatedAt: string | null; articles: PublicArticle[] };
const staticSnapshot = snapshot as Snapshot;
const apiUrl = (import.meta.env?.VITE_VOYAGER_API_URL as string | undefined)?.replace(/\/$/, "");
const listCacheKey = "ndp.articles.published.v1";

function isArticle(value: unknown): value is PublicArticle {
  if (!value || typeof value !== "object") return false;
  const article = value as Record<string, unknown>;
  return typeof article.articleId === "string" && typeof article.title === "string"
    && typeof article.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
    && typeof article.summary === "string" && typeof article.category === "string"
    && Array.isArray(article.tags) && article.tags.every((tag) => typeof tag === "string")
    && typeof article.author === "string" && article.status === "Published"
    && typeof article.publishedDate === "string" && typeof article.modifiedDate === "string"
    && (article.html === undefined || typeof article.html === "string");
}

function storedArticles(key: string): PublicArticle[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null") as unknown;
    return Array.isArray(value) ? value.filter(isArticle) : [];
  } catch {
    return [];
  }
}

function remember(key: string, value: PublicArticle[]): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* static fallback remains available */ }
}

async function api<T>(path: string): Promise<T> {
  if (!apiUrl) throw new Error("offline");
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`${apiUrl}${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 404 ? "not_found" : "unavailable");
    return await response.json() as T;
  } finally {
    window.clearTimeout(timer);
  }
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function setMeta(name: string, content: string, property = false): void {
  const attribute = property ? "property" : "name";
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  element.content = content;
}

function usePageMetadata(article?: PublicArticle, noindex = false): void {
  useEffect(() => {
    const canonicalPath = article ? `/articles/${article.slug}` : "/articles";
    const title = article ? `${article.title} | Netherwood Data Partners` : "Articles & Field Notes | Netherwood Data Partners";
    const description = article?.summary ?? "Practical notes on databases, performance, data projects, infrastructure and the problems that show up in real systems.";
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", article ? "article" : "website", true);
    setMeta("og:url", `https://netherwooddatapartners.com${canonicalPath}`, true);
    if (article?.featuredImage) setMeta("og:image", new URL(article.featuredImage, location.origin).href, true);
    if (article) {
      setMeta("article:published_time", article.publishedDate, true);
      setMeta("article:modified_time", article.modifiedDate, true);
      setMeta("article:author", article.author, true);
    }
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = `https://netherwooddatapartners.com${canonicalPath}`;
    const existing = document.getElementById("article-structured-data");
    existing?.remove();
    if (article) {
      const script = document.createElement("script");
      script.id = "article-structured-data";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.summary,
        datePublished: article.publishedDate,
        dateModified: article.modifiedDate,
        author: { "@type": "Person", name: article.author },
        publisher: { "@type": "Organization", name: "Netherwood Data Partners", url: "https://netherwooddatapartners.com" },
        mainEntityOfPage: `https://netherwooddatapartners.com${canonicalPath}`,
        ...(article.featuredImage ? { image: new URL(article.featuredImage, location.origin).href } : {}),
      }).replace(/</g, "\\u003c");
      document.head.append(script);
    }
  }, [article, noindex]);
}

function LoadingLine() {
  return <p className="articles-status" role="status">Loading the latest field notes…</p>;
}

export function ArticlesIndex() {
  const initial = staticSnapshot.articles.length > 0 ? staticSnapshot.articles : (typeof window === "undefined" ? [] : storedArticles(listCacheKey));
  const [articles, setArticles] = useState<PublicArticle[]>(initial);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  usePageMetadata();

  useEffect(() => {
    if (!apiUrl) return;
    void api<{ articles: PublicArticle[] }>("/api/articles?page=1&pageSize=50")
      .then((payload) => {
        const valid = payload.articles.filter(isArticle);
        setArticles(valid);
        remember(listCacheKey, valid);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <SiteHeader />
      <header className="articles-masthead">
        <p className="eyebrow">Netherwood insights</p>
        <h1>Articles &amp; Field Notes</h1>
        <p>Practical notes on databases, performance, data projects, infrastructure and the problems that show up in real systems.</p>
      </header>
      <section className="articles-publication" aria-live="polite">
        {loading && articles.length === 0 ? <LoadingLine /> : null}
        {!loading && articles.length === 0 ? (
          <div className="articles-empty">
            <p className="eyebrow">Publication desk</p>
            <h2>Field notes are being prepared.</h2>
            <p>The first practical articles will appear here after publication.</p>
          </div>
        ) : null}
        {articles.map((article, index) => (
          <article className={index === 0 ? "article-preview article-preview-featured" : "article-preview"} key={article.articleId}>
            {article.featuredImage ? <img src={article.featuredImage} alt="" /> : null}
            <div className="article-preview-meta">
              <span>{article.category}</span>
              <time dateTime={article.publishedDate}>{dateLabel(article.publishedDate)}</time>
            </div>
            <div className="article-preview-copy">
              <h2><a href={`/articles/${article.slug}`}>{article.title}</a></h2>
              <p>{article.summary}</p>
              <a className="article-read-link" href={`/articles/${article.slug}`}>Read field note <span aria-hidden="true">→</span></a>
            </div>
          </article>
        ))}
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const staticArticle = staticSnapshot.articles.find((article) => article.slug === slug);
  const cached = typeof window === "undefined" ? undefined : storedArticles(`ndp.article.${slug}.v1`)[0];
  const hadFallback = Boolean(staticArticle ?? cached);
  const [article, setArticle] = useState<PublicArticle | undefined>(staticArticle ?? cached);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [missing, setMissing] = useState(!apiUrl && !hadFallback);
  usePageMetadata(article, missing);

  useEffect(() => {
    if (!apiUrl) {
      return;
    }
    void api<{ article: PublicArticle }>(`/api/articles/${encodeURIComponent(slug)}`)
      .then((payload) => {
        if (!isArticle(payload.article) || typeof payload.article.html !== "string") throw new Error("invalid");
        setArticle(payload.article);
        remember(`ndp.article.${slug}.v1`, [payload.article]);
      })
      .catch((error: Error) => { if (!hadFallback && error.message === "not_found") setMissing(true); })
      .finally(() => setLoading(false));
  }, [hadFallback, slug]);

  const related = useMemo(() => staticSnapshot.articles
    .filter((candidate) => candidate.slug !== slug && candidate.category === article?.category)
    .slice(0, 3), [article?.category, slug]);

  if (!article && loading) return <main><SiteHeader /><div className="article-shell"><LoadingLine /></div><SiteFooter /></main>;
  if (!article) return (
    <main>
      <SiteHeader />
      <section className="article-not-found">
        <p className="eyebrow">Article not found</p>
        <h1>This field note is not available.</h1>
        <p>It may still be a draft, may have been archived, or the address may be incorrect.</p>
        <a className="button button-primary" href="/articles">View published articles</a>
      </section>
      <SiteFooter />
    </main>
  );

  return (
    <main>
      <SiteHeader />
      <article>
        <header className="article-header">
          <a href="/articles" className="article-back">← Articles &amp; Field Notes</a>
          <div className="article-kicker"><span>{article.category}</span><time dateTime={article.publishedDate}>{dateLabel(article.publishedDate)}</time></div>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.summary}</p>
          <div className="article-byline"><span>By {article.author}</span><span className="byline-divider" aria-hidden="true">·</span><span>Updated {dateLabel(article.modifiedDate)}</span></div>
          {article.featuredImage ? <img className="article-hero-image" src={article.featuredImage} alt="" /> : null}
        </header>
        <div className="article-layout">
          <aside className="article-rail" aria-label="Article details">
            <span>Filed under</span>
            <strong>{article.category}</strong>
            {article.tags.length ? <ul>{article.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
          </aside>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.html ?? "" }} />
        </div>
      </article>
      {related.length ? (
        <section className="related-articles">
          <p className="eyebrow">Continue reading</p>
          <h2>Related field notes</h2>
          <div>{related.map((item) => <a href={`/articles/${item.slug}`} key={item.articleId}><span>{item.category}</span><strong>{item.title}</strong></a>)}</div>
        </section>
      ) : null}
      <section className="article-cta">
        <div><p className="eyebrow">Working through a similar problem?</p><h2>Bring us the system, the symptoms and the stakes.</h2></div>
        <a className="button button-light" href="mailto:contact@netherwooddatapartners.com">Start a conversation</a>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
