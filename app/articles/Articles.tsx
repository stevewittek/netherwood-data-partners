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
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  publishedDate: string;
  createdDate: string;
  modifiedDate: string;
};

type Snapshot = { generatedAt: string | null; articles: PublicArticle[] };
type StoredArticleCache = { articles: PublicArticle[]; savedAt: number };
const staticSnapshot = snapshot as Snapshot;
const apiUrl = (import.meta.env?.VITE_VOYAGER_API_URL as string | undefined)?.replace(/\/$/, "");
const listCacheKey = "ndp.articles.published.v1";
const indexDescription = "Practical notes on databases, performance, data projects, infrastructure and the problems that show up in real systems.";

function isArticle(value: unknown): value is PublicArticle {
  if (!value || typeof value !== "object") return false;
  const article = value as Record<string, unknown>;
  return typeof article.articleId === "string" && typeof article.title === "string"
    && typeof article.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
    && typeof article.summary === "string" && typeof article.category === "string"
    && Array.isArray(article.tags) && article.tags.every((tag) => typeof tag === "string")
    && typeof article.author === "string" && article.status === "Published"
    && (article.seoTitle === undefined || typeof article.seoTitle === "string")
    && (article.seoDescription === undefined || typeof article.seoDescription === "string")
    && typeof article.isFeatured === "boolean"
    && typeof article.publishedDate === "string" && typeof article.modifiedDate === "string"
    && (article.html === undefined || typeof article.html === "string");
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortArticles(articles: PublicArticle[]): PublicArticle[] {
  return [...articles].sort((left, right) => (
    timestamp(right.publishedDate) - timestamp(left.publishedDate)
    || timestamp(right.modifiedDate) - timestamp(left.modifiedDate)
    || left.slug.localeCompare(right.slug)
  ));
}

function fallbackArticles(): PublicArticle[] {
  const exported = staticSnapshot.articles.filter(isArticle);
  return sortArticles(exported);
}

function storedArticleCache(key: string): StoredArticleCache {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null") as unknown;
    if (Array.isArray(value)) {
      const articles = value.filter(isArticle);
      return { articles, savedAt: Math.max(0, ...articles.map((article) => timestamp(article.modifiedDate))) };
    }
    if (value && typeof value === "object") {
      const cached = value as Record<string, unknown>;
      const articles = Array.isArray(cached.articles) ? cached.articles.filter(isArticle) : [];
      return { articles, savedAt: typeof cached.savedAt === "string" ? timestamp(cached.savedAt) : 0 };
    }
    return { articles: [], savedAt: 0 };
  } catch {
    return { articles: [], savedAt: 0 };
  }
}

function remember(key: string, value: PublicArticle[]): void {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), articles: value }));
  } catch { /* static fallback remains available */ }
}

function browserFallbackArticles(): PublicArticle[] {
  const exported = fallbackArticles();
  const cached = storedArticleCache(listCacheKey);
  const exportTime = staticSnapshot.generatedAt ? timestamp(staticSnapshot.generatedAt) : 0;
  if (cached.articles.length > 0 && (exported.length === 0 || cached.savedAt > exportTime)) {
    return sortArticles(cached.articles);
  }
  return exported;
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
  const elements = [...document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${name}"]`)];
  let element = elements.shift();
  elements.forEach((duplicate) => duplicate.remove());
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  element.content = content;
}

function removeMeta(name: string, property = false): void {
  const attribute = property ? "property" : "name";
  document.head.querySelectorAll(`meta[${attribute}="${name}"]`).forEach((element) => element.remove());
}

function absoluteImage(value?: string): string {
  try {
    return new URL(value || "/og.png", location.origin).href;
  } catch {
    return new URL("/og.png", location.origin).href;
  }
}

function usePageMetadata(article?: PublicArticle, noindex = false, requestedSlug?: string): void {
  useEffect(() => {
    const canonicalPath = article ? `/articles/${article.slug}` : requestedSlug ? `/articles/${requestedSlug}` : "/articles";
    const title = article
      ? article.seoTitle || `${article.title} | Netherwood Data Partners`
      : requestedSlug && noindex
        ? "Article not found | Netherwood Data Partners"
        : "Articles & Field Notes | Netherwood Data Partners";
    const description = article?.seoDescription || article?.summary || indexDescription;
    const socialImage = absoluteImage(article?.featuredImage);
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", article ? "article" : "website", true);
    setMeta("og:url", `https://netherwooddatapartners.com${canonicalPath}`, true);
    setMeta("og:image", socialImage, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", socialImage);
    if (article) {
      setMeta("article:published_time", article.publishedDate, true);
      setMeta("article:modified_time", article.modifiedDate, true);
      setMeta("article:author", article.author, true);
    } else {
      removeMeta("article:published_time", true);
      removeMeta("article:modified_time", true);
      removeMeta("article:author", true);
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
        description,
        datePublished: article.publishedDate,
        dateModified: article.modifiedDate,
        author: { "@type": "Person", name: article.author },
        publisher: { "@type": "Organization", name: "Netherwood Data Partners", url: "https://netherwooddatapartners.com" },
        mainEntityOfPage: `https://netherwooddatapartners.com${canonicalPath}`,
        image: socialImage,
      }).replace(/</g, "\\u003c");
      document.head.append(script);
    }
  }, [article, noindex, requestedSlug]);
}

function LoadingLine() {
  return <p className="articles-status" role="status">Loading the latest field notes…</p>;
}

function ArticlePreview({ article, featured = false }: { article: PublicArticle; featured?: boolean }) {
  return (
    <article className={featured ? "article-preview article-preview-featured" : "article-preview"}>
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
  );
}

export function ArticlesIndex() {
  const [articles, setArticles] = useState<PublicArticle[]>(fallbackArticles);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  usePageMetadata();

  useEffect(() => {
    const fallback = browserFallbackArticles();
    queueMicrotask(() => { if (fallback.length > 0) setArticles(fallback); });
    if (!apiUrl) return;
    void api<{ articles: PublicArticle[] }>("/api/articles?page=1&pageSize=50")
      .then((payload) => {
        const valid = sortArticles(payload.articles.filter(isArticle));
        setArticles(valid);
        remember(listCacheKey, valid);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const sortedArticles = useMemo(() => sortArticles(articles), [articles]);
  const categories = useMemo(() => [...new Set(sortedArticles.map((article) => article.category))]
    .sort((left, right) => left.localeCompare(right)), [sortedArticles]);
  const filteredArticles = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return sortedArticles.filter((article) => {
      if (category !== "all" && article.category !== category) return false;
      if (terms.length === 0) return true;
      const searchable = [article.title, article.summary, article.category, article.author, ...article.tags]
        .join(" ").toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [category, search, sortedArticles]);
  const filtersActive = category !== "all" || search.trim().length > 0;
  const featuredArticle = filtersActive
    ? undefined
    : filteredArticles.find((article) => article.isFeatured) ?? filteredArticles[0];
  const remainingArticles = featuredArticle
    ? filteredArticles.filter((article) => article.articleId !== featuredArticle.articleId)
    : filteredArticles;

  function clearFilters(): void {
    setCategory("all");
    setSearch("");
  }

  return (
    <main>
      <SiteHeader currentPage="articles" />
      <header className="articles-masthead">
        <p className="eyebrow">Netherwood insights</p>
        <h1>Articles &amp; Field Notes</h1>
        <p>Practical notes on databases, performance, data projects, infrastructure and the problems that show up in real systems.</p>
      </header>
      <section className="articles-publication">
        {loading && articles.length === 0 ? <LoadingLine /> : null}
        {articles.length > 0 ? (
          <>
            <form className="articles-tools" role="search" onSubmit={(event) => event.preventDefault()}>
              <label className="article-search" htmlFor="article-search">
                <span>Search articles</span>
                <input
                  id="article-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by topic, title, or tag"
                />
              </label>
              <label className="article-category-filter" htmlFor="article-category">
                <span>Category</span>
                <select id="article-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">All categories</option>
                  {categories.map((value) => <option value={value} key={value}>{value}</option>)}
                </select>
              </label>
            </form>
            <p className="articles-results-summary" role="status">
              {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
              {filtersActive ? " match your filters" : " published"}
            </p>
            {filteredArticles.length > 0 ? (
              <>
                {featuredArticle ? (
                  <section className="articles-featured" aria-labelledby="featured-article-heading">
                    <p className="eyebrow" id="featured-article-heading">Featured insight</p>
                    <ArticlePreview article={featuredArticle} featured />
                  </section>
                ) : null}
                {remainingArticles.length > 0 ? (
                  <section className="articles-list" aria-labelledby="latest-articles-heading">
                    <h2 className="articles-list-heading" id="latest-articles-heading">
                      {filtersActive ? "Matching articles" : "Latest articles"}
                    </h2>
                    {remainingArticles.map((article) => <ArticlePreview article={article} key={article.articleId} />)}
                  </section>
                ) : null}
              </>
            ) : (
              <div className="articles-empty articles-no-results">
                <p className="eyebrow">No matching field notes</p>
                <h2>Try a broader search.</h2>
                <p>No published articles match the current category and search terms.</p>
                <button className="button articles-clear-filters" type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </>
        ) : null}
        {!loading && articles.length === 0 ? (
          <div className="articles-empty">
            <p className="eyebrow">Publication desk</p>
            <h2>Field notes are being prepared.</h2>
            <p>The first practical articles will appear here after publication.</p>
          </div>
        ) : null}
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const staticArticle = staticSnapshot.articles.find((article) => article.slug === slug);
  const [article, setArticle] = useState<PublicArticle | undefined>(staticArticle);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [missing, setMissing] = useState(!apiUrl && !staticArticle);
  const [relatedPool, setRelatedPool] = useState<PublicArticle[]>(fallbackArticles);
  usePageMetadata(article, missing || (!loading && !article), slug);

  useEffect(() => {
    const cached = storedArticleCache(`ndp.article.${slug}.v1`);
    const exportTime = staticSnapshot.generatedAt ? timestamp(staticSnapshot.generatedAt) : 0;
    const cachedArticle = cached.articles[0];
    const localFallback = cachedArticle && (!staticArticle || cached.savedAt > exportTime)
      ? cachedArticle
      : staticArticle;
    queueMicrotask(() => {
      if (localFallback) setArticle(localFallback);
      setMissing(!localFallback && !apiUrl);
    });
    if (!apiUrl) return;
    void api<{ article: PublicArticle }>(`/api/articles/${encodeURIComponent(slug)}`)
      .then((payload) => {
        if (!isArticle(payload.article) || typeof payload.article.html !== "string") throw new Error("invalid");
        setArticle(payload.article);
        setMissing(false);
        remember(`ndp.article.${slug}.v1`, [payload.article]);
      })
      .catch((error: Error) => {
        if (error.message === "not_found") {
          setArticle(undefined);
          setMissing(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, staticArticle]);

  useEffect(() => {
    if (!article?.category) return;
    if (!apiUrl) {
      const fallback = browserFallbackArticles();
      queueMicrotask(() => setRelatedPool(fallback));
      return;
    }
    let active = true;
    void api<{ articles: PublicArticle[] }>("/api/articles?page=1&pageSize=50")
      .then((payload) => {
        if (!active) return;
        const valid = sortArticles(payload.articles.filter(isArticle));
        setRelatedPool(valid);
        remember(listCacheKey, valid);
      })
      .catch(() => {
        if (!active) return;
        const fallback = browserFallbackArticles();
        if (fallback.length > 0) setRelatedPool(fallback);
      });
    return () => { active = false; };
  }, [article?.category]);

  const related = useMemo(() => {
    const articleTags = new Set(article?.tags.map((tag) => tag.toLocaleLowerCase()) ?? []);
    return sortArticles(relatedPool)
      .filter((candidate) => candidate.slug !== slug)
      .map((candidate) => ({
        candidate,
        score: (candidate.category === article?.category ? 4 : 0)
          + candidate.tags.filter((tag) => articleTags.has(tag.toLocaleLowerCase())).length,
      }))
      .sort((left, right) => right.score - left.score || timestamp(right.candidate.publishedDate) - timestamp(left.candidate.publishedDate))
      .slice(0, 3)
      .map(({ candidate }) => candidate);
  }, [article?.category, article?.tags, relatedPool, slug]);

  if (!article && loading) return <main><SiteHeader currentPage="articles" /><div className="article-shell"><LoadingLine /></div><SiteFooter /></main>;
  if (!article) return (
    <main>
      <SiteHeader currentPage="articles" />
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
      <SiteHeader currentPage="articles" />
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
