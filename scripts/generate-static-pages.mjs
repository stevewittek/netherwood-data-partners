import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readArticleSnapshot } from "../backend/src/article-snapshot.ts";
import { services, servicesMetadata } from "../app/content/services.ts";
import {
  homeMetadata,
  aboutMetadata,
  intakeMetadata,
  readinessMetadata,
  organizationSchema,
} from "../app/content/site.ts";
import { renderContentDigest, renderPage } from "../.static-render/render.mjs";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "pages-dist");
const template = await readFile(resolve(output, "index.html"), "utf8");
const aboutTemplate = await readFile(
  resolve(output, "about/index.html"),
  "utf8",
);
const snapshot = await readArticleSnapshot(
  resolve(root, "pages-site/articles-snapshot.json"),
);
if (renderContentDigest !== snapshot.contentDigest)
  throw new Error(
    "Prerender bundle does not match the validated publication. Run the complete build:pages command.",
  );
const articles = snapshot.articles;
const siteUrl = "https://netherwooddatapartners.com";
const defaultImage = `${siteUrl}/og.png`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function removeMeta(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(
    new RegExp(`\\s*<meta\\s+[^>]*${attribute}=["']${escaped}["'][^>]*>`, "gi"),
    "",
  );
}

function metaPage({
  title,
  description,
  canonical,
  type = "website",
  image = defaultImage,
  published,
  modified,
  author,
  noindex = false,
  structured,
  source = template,
  schemaId = "article-structured-data",
}) {
  let html = source.replace(
    /<title>.*?<\/title>/s,
    `<title>${escapeHtml(title)}</title>`,
  );
  for (const name of [
    "description",
    "robots",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
  ]) {
    html = removeMeta(html, "name", name);
  }
  for (const property of [
    "og:type",
    "og:title",
    "og:description",
    "og:url",
    "og:image",
    "article:published_time",
    "article:modified_time",
    "article:author",
  ]) {
    html = removeMeta(html, "property", property);
  }
  html = html
    .replace(/\s*<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(
      /\s*<script\s+[^>]*id=["']article-structured-data["'][^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
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
    published
      ? `<meta property="article:published_time" content="${escapeHtml(published)}" />`
      : "",
    modified
      ? `<meta property="article:modified_time" content="${escapeHtml(modified)}" />`
      : "",
    author
      ? `<meta property="article:author" content="${escapeHtml(author)}" />`
      : "",
    structured
      ? `<script id="${schemaId}" type="application/ld+json">${JSON.stringify(structured).replaceAll("<", "\\u003c")}</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  return html.replace("</head>", `    ${additions}\n  </head>`);
}

async function page(path, html) {
  const target = resolve(output, path, "index.html");
  await mkdir(dirname(target), { recursive: true });
  const body = renderPage(`/${path}`);
  await writeFile(
    target,
    html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`),
  );
}

await page(
  "",
  metaPage({
    ...homeMetadata,
    canonical: `${siteUrl}/`,
    structured: organizationSchema,
    schemaId: "organization-structured-data",
  }),
);
await page(
  "about",
  metaPage({
    ...aboutMetadata,
    canonical: `${siteUrl}/about/`,
    source: aboutTemplate,
    schemaId: "about-structured-data",
    structured: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      url: `${siteUrl}/about/`,
      name: aboutMetadata.title,
      mainEntity: {
        "@type": "Person",
        name: "Steven Wittek",
        jobTitle: "Database engineer",
        worksFor: { "@id": `${siteUrl}/#organization` },
      },
    },
  }),
);
const marketingPages = [
  { path: "services", ...servicesMetadata },
  { path: "migration-intake", ...intakeMetadata },
  { path: "migration-readiness", ...readinessMetadata },
  ...services.map((service) => ({
    path: `services/${service.slug}`,
    title: `${service.title} | Netherwood Data Partners`,
    description: service.description,
    service,
  })),
];
for (const entry of marketingPages) {
  const canonical = `${siteUrl}/${entry.path}/`;
  const pageSchema = entry.service
    ? {
        "@type": "Service",
        name: entry.service.title,
        description: entry.description,
        url: canonical,
        provider: {
          "@id": `${siteUrl}/#organization`,
          "@type": "Organization",
          name: "Netherwood Data Partners",
        },
        areaServed: ["New Jersey", "New York City", "United States"],
      }
    : {
        "@type": entry.path === "migration-intake" ? "ContactPage" : "WebPage",
        name: entry.title,
        description: entry.description,
        url: canonical,
      };
  await page(
    entry.path,
    metaPage({
      ...entry,
      canonical,
      schemaId: "page-structured-data",
      structured: {
        "@context": "https://schema.org",
        "@graph": [
          pageSchema,
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${siteUrl}/`,
              },
              ...(entry.service
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Services",
                      item: `${siteUrl}/services/`,
                    },
                  ]
                : []),
              {
                "@type": "ListItem",
                position: entry.service ? 3 : 2,
                name: entry.service?.title || entry.title.split(" | ")[0],
                item: canonical,
              },
            ],
          },
        ],
      },
    }),
  );
}

await page(
  "articles",
  metaPage({
    title: "Articles & Field Notes | Netherwood Data Partners",
    description:
      "Practical notes on software changes, moving business data, backups and the technical work behind reliable systems.",
    canonical: `${siteUrl}/articles/`,
  }),
);

await page(
  "admin/articles",
  metaPage({
    title: "Article publishing | Netherwood Data Partners",
    description: "Private Netherwood Data Partners article publishing.",
    canonical: `${siteUrl}/admin/articles/`,
    noindex: true,
  }),
);

for (const article of articles) {
  const canonical = `${siteUrl}/articles/${article.slug}/`;
  const image = article.featuredImage
    ? new URL(article.featuredImage, siteUrl).href
    : defaultImage;
  const description = article.seoDescription || article.summary;
  await page(
    `articles/${article.slug}`,
    metaPage({
      title: article.seoTitle || `${article.title} | Netherwood Data Partners`,
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
        publisher: {
          "@type": "Organization",
          name: "Netherwood Data Partners",
          url: `${siteUrl}/`,
        },
        mainEntityOfPage: canonical,
        ...(image ? { image } : {}),
      },
    }),
  );
}

const validArticles = articles;
const articleUrls = [
  `  <url><loc>${siteUrl}/articles/</loc>${snapshot.generatedAt ? `<lastmod>${escapeHtml(snapshot.generatedAt)}</lastmod>` : ""}</url>`,
  ...validArticles.map(
    (article) =>
      `  <url><loc>${siteUrl}/articles/${escapeHtml(article.slug)}/</loc>${article.modifiedDate ? `<lastmod>${escapeHtml(article.modifiedDate)}</lastmod>` : ""}</url>`,
  ),
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
  <url><loc>${siteUrl}/about/</loc></url>
${marketingPages.map((entry) => `  <url><loc>${siteUrl}/${entry.path}/</loc></url>`).join("\n")}
${articleUrls.join("\n")}
</urlset>
`;
await writeFile(resolve(output, "sitemap.xml"), rootSitemap);
await writeFile(
  resolve(output, "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/articles-sitemap.xml
`,
);
await writeFile(
  resolve(output, "404.html"),
  metaPage({
    title: "Page not found | Netherwood Data Partners",
    description: "The requested page is not available.",
    canonical: `${siteUrl}/404.html`,
    noindex: true,
  }).replace(
    '<div id="root"></div>',
    () => `<div id="root" data-client-route="true">${renderPage("/404")}</div>`,
  ),
);

// This same complete export drives the browser bundle, routes, metadata and AI handoff.
await writeFile(
  resolve(output, "articles-snapshot.json"),
  `${JSON.stringify(snapshot)}\n`,
);
await writeFile(
  resolve(output, "publication.json"),
  `${JSON.stringify({
    format: "netherwood.website-release/v1",
    sourceCommit: process.env.GITHUB_SHA || "local",
    contentCommit: process.env.NDP_CONTENT_COMMIT || "local",
    contentDigest: snapshot.contentDigest,
    articleCount: snapshot.articleCount,
    generatedAt: snapshot.generatedAt,
    builtAt: new Date().toISOString(),
    runUrl: process.env.GITHUB_RUN_ID
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null,
    chatEnabled: false,
  })}\n`,
);
