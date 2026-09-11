import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { validateArticleSnapshot } from "./validate-article-snapshot.mjs";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "pages-dist");
const template = await readFile(resolve(output, "index.html"), "utf8");
const snapshot = validateArticleSnapshot(JSON.parse(await readFile(resolve(root, "pages-site/articles-snapshot.json"), "utf8")));
const articles = Array.isArray(snapshot.articles) ? snapshot.articles : [];
const siteUrl = "https://netherwooddatapartners.com";
const defaultImage = `${siteUrl}/og.png`;

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function removeMeta(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`\\s*<meta\\s+[^>]*${attribute}=["']${escaped}["'][^>]*>`, "gi"), "");
}

function metaPage({ title, description, canonical, type = "website", image = defaultImage, published, modified, author, noindex = false, structured }) {
  let html = template.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`);
  for (const name of ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    html = removeMeta(html, "name", name);
  }
  for (const property of ["og:type", "og:title", "og:description", "og:url", "og:image", "article:published_time", "article:modified_time", "article:author"]) {
    html = removeMeta(html, "property", property);
  }
  html = html
    .replace(/\s*<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\s*<script\s+[^>]*id=["']article-structured-data["'][^>]*>[\s\S]*?<\/script>/gi, "");
  const additions = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${noindex ? "noindex, nofollow, noarchive" : "index, follow"}" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    published ? `<meta property="article:published_time" content="${escapeHtml(published)}" />` : "",
    modified ? `<meta property="article:modified_time" content="${escapeHtml(modified)}" />` : "",
    author ? `<meta property="article:author" content="${escapeHtml(author)}" />` : "",
    structured ? `<script id="article-structured-data" type="application/ld+json">${JSON.stringify(structured).replaceAll("<", "\\u003c")}</script>` : "",
  ].filter(Boolean).join("\n    ");
  return html.replace("</head>", `    ${additions}\n  </head>`);
}

async function page(path, html) {
  const target = resolve(output, path, "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
}

await page("articles", metaPage({
  title: "Articles & Field Notes | Netherwood Data Partners",
  description: "Practical notes on databases, performance, data projects, infrastructure and the problems that show up in real systems.",
  canonical: `${siteUrl}/articles`,
}));

await page("admin/articles", metaPage({
  title: "Article publishing | Netherwood Data Partners",
  description: "Private Netherwood Data Partners article publishing.",
  canonical: `${siteUrl}/admin/articles`,
  noindex: true,
}));

for (const article of articles) {
  if (!article || typeof article.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) continue;
  const canonical = `${siteUrl}/articles/${article.slug}`;
  const image = article.featuredImage ? new URL(article.featuredImage, siteUrl).href : defaultImage;
  const description = article.seoDescription || article.summary;
  await page(`articles/${article.slug}`, metaPage({
    title: `${article.title} | Netherwood Data Partners`,
    description,
    canonical,
    type: "article",
    image,
    published: article.publishedDate,
    modified: article.modifiedDate,
    author: article.author,
    structured: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description,
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate,
      author: { "@type": "Person", name: article.author },
      publisher: { "@type": "Organization", name: "Netherwood Data Partners", url: siteUrl },
      mainEntityOfPage: canonical,
      ...(image ? { image } : {}),
    },
  }));
}

const validArticles = articles.filter((article) => article && typeof article.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug));
const articleUrls = [
  `  <url><loc>${siteUrl}/articles</loc>${snapshot.generatedAt ? `<lastmod>${escapeHtml(snapshot.generatedAt)}</lastmod>` : ""}</url>`,
  ...validArticles.map((article) => `  <url><loc>${siteUrl}/articles/${escapeHtml(article.slug)}</loc>${article.modifiedDate ? `<lastmod>${escapeHtml(article.modifiedDate)}</lastmod>` : ""}</url>`),
];
const articleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articleUrls.join("\n")}
</urlset>
`;
await writeFile(resolve(output, "articles-sitemap.xml"), articleSitemap);

const rootSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc></url>
  <url><loc>${siteUrl}/about</loc></url>
${articleUrls.join("\n")}
</urlset>
`;
await writeFile(resolve(output, "sitemap.xml"), rootSitemap);
await writeFile(resolve(output, "robots.txt"), `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/articles-sitemap.xml
`);
await writeFile(resolve(output, "404.html"), metaPage({
  title: "Page not found | Netherwood Data Partners",
  description: "The requested page is not available.",
  canonical: `${siteUrl}/404`,
  noindex: true,
}));
