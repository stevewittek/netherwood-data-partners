import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "pages-dist");
const template = await readFile(resolve(output, "index.html"), "utf8");
const snapshot = JSON.parse(await readFile(resolve(root, "pages-site/articles-snapshot.json"), "utf8"));
const articles = Array.isArray(snapshot.articles) ? snapshot.articles : [];

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function metaPage({ title, description, canonical, type = "website", image, published, modified, noindex = false, structured }) {
  let html = template.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  const additions = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="${noindex ? "noindex, nofollow, noarchive" : "index, follow"}" />`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : "",
    published ? `<meta property="article:published_time" content="${published}" />` : "",
    modified ? `<meta property="article:modified_time" content="${modified}" />` : "",
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
  canonical: "https://netherwooddatapartners.com/articles",
}));

await page("admin/articles", metaPage({
  title: "Article publishing | Netherwood Data Partners",
  description: "Private Netherwood Data Partners article publishing.",
  canonical: "https://netherwooddatapartners.com/admin/articles",
  noindex: true,
}));

for (const article of articles) {
  if (!article || typeof article.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) continue;
  const canonical = `https://netherwooddatapartners.com/articles/${article.slug}`;
  const image = article.featuredImage ? new URL(article.featuredImage, "https://netherwooddatapartners.com").href : undefined;
  await page(`articles/${article.slug}`, metaPage({
    title: `${article.title} | Netherwood Data Partners`,
    description: article.summary,
    canonical,
    type: "article",
    image,
    published: article.publishedDate,
    modified: article.modifiedDate,
    structured: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary,
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate,
      author: { "@type": "Person", name: article.author },
      publisher: { "@type": "Organization", name: "Netherwood Data Partners", url: "https://netherwooddatapartners.com" },
      mainEntityOfPage: canonical,
      ...(image ? { image } : {}),
    },
  }));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.filter((article) => article?.slug).map((article) => `  <url><loc>https://netherwooddatapartners.com/articles/${escapeHtml(article.slug)}</loc><lastmod>${escapeHtml(article.modifiedDate)}</lastmod></url>`).join("\n")}
</urlset>
`;
await writeFile(resolve(output, "articles-sitemap.xml"), sitemap);
await writeFile(resolve(output, "404.html"), metaPage({
  title: "Page not found | Netherwood Data Partners",
  description: "The requested page is not available.",
  canonical: "https://netherwooddatapartners.com/404",
  noindex: true,
}));
