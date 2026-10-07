import assert from "node:assert/strict";
import { products } from "../app/content/products.ts";
import { motionRelayDownloads, motionRelayRoutes } from "../app/content/motion-relay.ts";
import { readFile, readdir, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

const root = resolve(process.argv[2] || "pages-dist");
const snapshot = JSON.parse(
  await readFile(resolve(root, "articles-snapshot.json"), "utf8"),
);
const manifest = JSON.parse(
  await readFile(resolve(root, "publication.json"), "utf8"),
);
assert.equal(snapshot.contentDigest, manifest.contentDigest);
assert.equal(snapshot.articles.length, manifest.articleCount);
assert.equal(manifest.chatEnabled, false);
const origin = "https://netherwooddatapartners.com";
const serviceSlugs = [
  "software-systems-support",
  "data-migration",
  "legacy-application-modernization",
  "business-software-migration",
  "legacy-systems-assessment",
  "database-engineering",
  "workflow-automation",
  "practical-ai",
];
const productSlugs = products.map((product) => product.slug);
const expected = [
  "/",
  "/about/",
  "/articles/",
  "/services/",
  "/products/",
  "/privacy/",
  "/motionrelay/setup/",
  "/migration-intake/",
  "/migration-readiness/",
  ...serviceSlugs.map((slug) => `/services/${slug}/`),
  ...productSlugs.map((slug) => `/products/${slug}/`),
  ...snapshot.articles.map((a) => `/articles/${a.slug}/`),
];
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.deepEqual(
  locations.sort(),
  expected.map((path) => `${origin}${path}`).sort(),
);
const articleSitemap = await readFile(
  resolve(root, "articles-sitemap.xml"),
  "utf8",
);
assert.deepEqual(
  [...articleSitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).sort(),
  expected
    .filter((p) => p.startsWith("/articles"))
    .map((p) => `${origin}${p}`)
    .sort(),
);
const titles = new Set();
const checks = [];
const documents = new Map(
  await Promise.all(
    expected.map(async (route) => [
      route,
      await readFile(resolve(root, `.${route}`, "index.html"), "utf8"),
    ]),
  ),
);
function escape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
async function checkUrl(value, currentRoute = "/") {
  const url = new URL(value, `${origin}${currentRoute}`);
  if (url.origin !== origin || url.protocol !== "https:") return;
  const decoded = decodeURIComponent(url.pathname);
  const path = resolve(root, `.${decoded}`);
  const withinRoot = relative(root, path);
  assert.ok(
    withinRoot !== ".." &&
      !withinRoot.startsWith(`..${sep}`) &&
      !isAbsolute(withinRoot),
    "Asset traversal rejected",
  );
  if (/\.[a-z0-9]+$/i.test(decoded)) {
    assert.ok((await stat(path)).isFile(), decoded);
  } else {
    assert.ok(
      decoded === "/" || decoded.endsWith("/"),
      `Non-canonical internal route ${decoded}`,
    );
    assert.ok(
      expected.includes(decoded) || decoded.startsWith("/admin/"),
      `Missing local route ${decoded}`,
    );
    if (url.hash && documents.has(decoded)) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(
        documents.get(decoded).includes(`id="${escape(id)}"`),
        `Missing anchor ${decoded}${url.hash}`,
      );
    }
  }
}
for (const route of expected) {
  const html = await readFile(resolve(root, `.${route}`, "index.html"), "utf8");
  assert.doesNotMatch(html, /\b(?:RunBridge(?: AI)?|One Bridge|PaceRelay)\b/i, `Obsolete customer name ${route}`);
  const title = /<title>(.*?)<\/title>/s.exec(html)?.[1];
  assert.ok(title && !titles.has(title), `Missing/duplicate title ${route}`);
  titles.add(title);
  if (route === "/") assert.equal(title, "Netherwood Data Partners", "Company homepage tab title");
  assert.match(html, /<html[^>]+lang="en"/, `Document language ${route}`);
  assert.match(html, /<link[^>]+rel="icon"[^>]+href="\/favicon-netherwood\.svg"/, `Company favicon ${route}`);
  assert.match(html, /<h1[^>]+id="main-content"[^>]+tabindex="-1"/, `Keyboard skip target ${route}`);
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\balt="[^"]*"/, `Image alternative text ${route}`);
  }
  assert.ok(
    html.includes(`rel="canonical" href="${origin}${route}"`),
    `Canonical ${route}`,
  );
  assert.match(html, /name="description" content="[^"\n]+"/);
  assert.equal(
    [...html.matchAll(/<h1(?:\s|>)/g)].length,
    1,
    `Prerendered h1 ${route}`,
  );
  assert.ok(html.includes("<main"), `Readable static content ${route}`);
  for (const [, json] of html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  ))
    assert.ok(JSON.parse(json)["@context"]);
  if (route.startsWith("/services/") && route !== "/services/") {
    const data = JSON.parse(
      /<script[^>]+id="page-structured-data"[^>]*>(.*?)<\/script>/s.exec(
        html,
      )?.[1],
    );
    assert.equal(data["@graph"][0]["@type"], "Service");
    assert.equal(data["@graph"][0].url, `${origin}${route}`);
    assert.equal(data["@graph"][1]["@type"], "BreadcrumbList");
  }
  if (route.startsWith("/products/") && route !== "/products/") {
    const product = products.find((entry) => entry.productUrl === route);
    assert.ok(product, 'Catalog entry ' + route);
    assert.ok(html.includes(product.name), 'Product name ' + route);
    assert.ok(html.includes(product.status), 'Product status ' + route);
    for (const key of ['githubUrl', 'docsUrl', 'downloadUrl']) {
      if (product[key]) {
        assert.equal(new URL(product[key]).protocol, 'https:');
        assert.ok(html.includes(product[key]), 'Configured link ' + route + ': ' + key);
      }
    }
    if (!product.downloadUrl) assert.ok(!html.includes('>Download<'), 'Unavailable download ' + route);
    const data = JSON.parse(
      /<script[^>]+id="product-structured-data"[^>]*>(.*?)<\/script>/s.exec(
        html,
      )?.[1],
    );
    assert.equal(data["@graph"][0]["@type"], "SoftwareApplication");
    assert.equal(data["@graph"][0].name, product.name);
    assert.ok(title.includes(product.name), `Product title ${route}`);
    if (product.id === "garmin-ai-connector") {
      assert.equal(product.name, "Motion Connect");
      assert.ok(html.includes(`href="${motionRelayRoutes.setup}"`), "Motion setup remains reachable");
      assert.ok(html.includes(motionRelayDownloads.garmin.url));
      assert.ok(html.includes('id="beta-signup"'));
      assert.ok(html.includes('name="phone_platform"'));
      assert.ok(html.includes('name="garmin_watch_model"'));
      assert.ok(html.includes('name="chatgpt_voice_available"'));
      assert.ok(html.includes(motionRelayRoutes.betaSignup));
      for (const platform of [motionRelayDownloads.iphone, motionRelayDownloads.android]) {
        if (platform.available && platform.url) assert.ok(html.includes(platform.url));
        else {
          assert.ok(html.includes(`${platform.storeName} — coming soon`));
          assert.ok(!html.includes(`href="${platform.url}"`));
        }
      }
      assert.equal((html.match(/aria-disabled="true"/g) || []).length,
        [motionRelayDownloads.iphone, motionRelayDownloads.android].filter((platform) => !platform.available || !platform.url).length);
    }
    assert.equal(
      data["@graph"][0].creator.name,
      "Netherwood Data Partners",
    );
    assert.equal(data["@graph"][1]["@type"], "BreadcrumbList");
  }
  for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g))
    await checkUrl(value, route);
  const article = snapshot.articles.find(
    (a) => route === `/articles/${a.slug}/`,
  );
  if (article) {
    assert.ok(
      article.html && html.includes(article.html),
      `Complete current article body ${route}`,
    );
    assert.equal(
      title,
      escape(article.seoTitle || `${article.title} | Netherwood Data Partners`),
    );
    const structured =
      /<script[^>]+id="article-structured-data"[^>]*>(.*?)<\/script>/s.exec(
        html,
      )?.[1];
    const data = JSON.parse(structured);
    assert.equal(data.headline, article.title);
    assert.equal(data.dateModified, article.modifiedDate);
    assert.equal(data.mainEntityOfPage, `${origin}${route}`);
    for (const [, value] of article.html.matchAll(/(?:src|href)="([^"]+)"/g))
      await checkUrl(value.replaceAll("&amp;", "&"), route);
    if (article.featuredImage) await checkUrl(article.featuredImage);
  }
  checks.push(route);
}
for (const file of await readdir(resolve(root, "assets"))) {
  if (!file.endsWith(".js")) continue;
  const javascript = await readFile(resolve(root, "assets", file), "utf8");
  assert.doesNotMatch(javascript, /\b(?:RunBridge(?: AI)?|One Bridge|PaceRelay)\b/i, `Obsolete bundled name ${file}`);
}
assert.ok(
  documents
    .get("/products/queryvault/")
    .includes("https://github.com/stevewittek/Databases"),
  "QueryVault has its verified public source link",
);
for (const route of ["/products/sql-server-index-maintenance-visualizer/"]) {
  assert.ok(
    !documents.get(route).includes("github.com/"),
    route + " does not advertise an unverified repository",
  );
  assert.ok(
    !documents.get(route).includes(">Download<"),
    route + " does not advertise a fake download",
  );
}
for (const file of ["404.html", "admin/articles/index.html"])
  assert.match(await readFile(resolve(root, file), "utf8"), /noindex/);
const robots = await readFile(resolve(root, "robots.txt"), "utf8");
assert.match(robots, /Disallow: \/admin\//);
assert.ok(robots.includes(`${origin}/articles-sitemap.xml`));
assert.equal(
  (await readFile(resolve(root, "CNAME"), "utf8")).trim(),
  "netherwooddatapartners.com",
);
for (const path of ["internal", "prospecting", ".data"]) {
  await assert.rejects(
    stat(resolve(root, path)),
    { code: "ENOENT" },
    `Private ${path} excluded`,
  );
}
console.log(
  JSON.stringify({
    event: "static_release_checked",
    routes: checks,
    articleCount: snapshot.articleCount,
    contentDigest: snapshot.contentDigest,
  }),
);
