# Netherwood Data Partners site architecture

## Migration revision — September 25, 2026

The owner requested migration/modernization positioning, public lead-generation
tools and a private prospecting foundation. The existing React/Vite static Pages
deployment and Next/Vinext alternative are retained.

New public routes: `/services/`, seven `/services/{slug}/` detail pages,
`/migration-intake/` and `/migration-readiness/`. Shared navigation exposes these
paths. Home/About and company knowledge now lead with vendor-neutral migration;
all ten SQL-owned published articles, their routes and old homepage anchors remain.

`build:pages` validates the same publication export, builds browser assets, builds
a temporary Vite SSR bundle, and renders the public pages to HTML at build time.
There is no runtime SSR service. React hydrates the same components. The renderer
digest must match the validated article export, and `check-pages.mjs` checks full
article-body parity as well as routes, metadata, schema and links. The custom 404
uses client rendering for route-specific missing states. The temporary renderer
lives in ignored `.static-render/` and is never deployed.

Contact and guided intake reuse one Formspark transport with native POST,
honeypot, validation, timeout/error status and visible business email. They do
not depend on Voyager. The readiness result is computed locally without contact
details. Only an explicit user action places enumerated answers in sessionStorage
for an optional, expiring intake attachment. No inquiry is sent automatically.
No general analytics package was present; existing disabled telemetry stays disabled.

`internal/prospecting/` is a separate local Node application, excluded from every
public build import/asset path. It binds only to `127.0.0.1`, uses owner-only data
storage outside the checkout and has no collector or sender. See its README for
the evidence model, human-review gates, suppression and operating limits. Public
inquiries remain in the existing Formspark workflow and are not silently copied
into prospecting.

## September 19, 2026 public design update

The owner-approved redesign keeps the same production/static publishing
architecture and routes. Home now offers two equal service paths:
`/#business-systems` and `/#database-services`. Navigation also includes About,
Articles, and `/#contact`. The former homepage anchors (`services`,
`engagements`, `when-to-call-us`, `approach`, `about`, `insights`, `contact`)
remain valid. No dead Services/Tools routes are introduced.

Home contains the dual offer, illustrative scenarios, process, engagement
scope, founder introduction, native FAQ disclosures, article link, and contact.
About contains the founder biography and anonymized professional experience.
`app/studio.css` is imported by both Pages entries and the Vinext layout.
`app/content/founder.ts` is the single real-portrait configuration point.
No backend, SQL, DNS, timer, authentication, or public-exposure changes belong
to this design release. The older navigation targets below are historical.

Status: publication is live following the September 11 release at `58136f8`.
The owner has requested small-business positioning with the same structure. See
[publication operations](PUBLICATION_OPERATIONS.md).

## Publishing boundary

GitHub Pages is the public production channel. `pages-site/` supplies the Vite
entries, `vite.pages.config.ts` builds `pages-dist`, and
`scripts/generate-static-pages.mjs` creates article routes, sitemaps, robots,
and the 404 page. The candidate workflow accepts main pushes or a publication
dispatch only when repository `NDP_PUBLICATION_ENABLED=true`. It imports the
latest validated content-only branch by immutable commit before building.
Production publication is active. Preserve the release gate and timer; do not
introduce a competing publication path.

The public site, service information, contact path, and published articles must
work when Voyager, SQL Server, Docker, Ollama, tunnels, home Internet, or AI are
unavailable. Voyager is optional progressive enhancement only.

## Current production structure

| Route | Current job | Primary implementation |
| --- | --- | --- |
| `/` | Explain the offer, show engagement types and working style, and convert visitors through contact | `app/page.tsx` |
| `/about` | Establish founder identity, experience, approach, location, and personal credibility | `app/about/page.tsx`, `app/about/about.css` |
| `/articles` | Display and filter the ten published field notes | `app/articles/Articles.tsx` |
| `/articles/{slug}` | Deliver a complete technical article and a contact CTA | `app/articles/Articles.tsx`, generated static artifacts |
| `/admin/articles` | Private publishing-desk shell; public build disconnected; authenticated API works privately | `app/admin/ArticlesAdmin.tsx` |
| `/404` | Explain a missing route and return the visitor home | `app/SiteRouter.tsx`, generated `404.html` |

Current shared navigation is About, Services (home anchor), Articles, Approach
(home anchor), and Start a conversation (home contact anchor). There is no
Tools page, dedicated Services page, or dedicated Contact page. Do not create
or expose a dead navigation link.

## Launch navigation target

Preferred order and destinations:

1. Home — `/`
2. Services — `/#services` for launch; a dedicated `/services` route may follow
   when it adds meaningful detail
3. Tools — `/tools` only after an actual page exists
4. Articles — `/articles`
5. About — `/about`
6. Contact — `/#contact` for launch

This is the launch target, not permission to alter protected navigation. The
existing navigation may remain for Friday if changing it would create a rushed
global visual regression. Query Vault and the Tools item are not Friday
blockers.

## Homepage job and section order

The homepage must let a qualified visitor understand the firm and find a
contact path within 60 seconds. Preserve this approved order unless an explicit
conversion task provides another order:

1. Shared header and navigation
2. Hero: concrete positioning, short explanation, primary contact CTA, and
   secondary services CTA
3. Capability strip
4. Services: core areas of work
5. Engagement types: recognizable ways to start
6. When to call: buyer situations and symptoms
7. Approach: how the work is investigated and communicated
8. Trust/About preview with a path to the founder page when appropriate
9. Articles/insights preview
10. Contact: Formspark form when deployed plus visible email fallback
11. Shared footer

The existing illustrative diagnostic panel may support the hero, but it must
remain clearly labeled illustrative and must not look like a customer result or
live dashboard.

## Page jobs at launch

### Home

Answer: What does Netherwood do? Who calls? What does an engagement look like?
Why trust the approach? How do I contact Steven? Lead with small-business software, data migration, inherited systems and
practical support. SQL Server remains supporting technical depth. This
September 11 owner direction supersedes the earlier database-only positioning.

### Services

The homepage services and engagement sections explain software setup, business
transitions, legacy data migration, reviews, practical fixes and staff support.
Deeper SQL Server expertise remains on About. Keep existing anchors/routes;
add dedicated service pages only when they provide useful, specific detail.

### Tools

Tools is a post-launch capability index. It should explain each real tool,
audience, platform requirements, support status, version, security limits, and
download or access path. Query Vault may live at `/tools/query-vault` or as the
first entry on `/tools`. Do not publish a mock download, fake dashboard, or
unfinished tool to satisfy the navigation target. A Tools link should appear
only when `/tools` returns a useful page.

### Articles

Articles demonstrate judgment through useful, technically accurate guidance.
The index and every detail use the same validated SQL export embedded in the
static release, independently of Voyager. A missing article or empty export is
authoritative; legacy browser storage cannot override it.
Every detail page needs a unique title, description, canonical URL, safe
article markup, author/date metadata, and a contact CTA.

### About

Make the founder-led, currently one-person working model legible without
pretending to be a large consultancy. Steven remains directly involved; any
additional specialty is discussed and scoped with the client. Use only
verified biography and claims. The owner approved the current temporary
stylized portrait for Friday while preparing a real professional replacement.

### Contact

The contact path must never depend on Voyager. The preferred launch flow is a
static Formspark form with native POST fallback, accessible state messaging,
basic spam protection, and a visible
`contact@netherwooddatapartners.com` mail link. If Formspark is unavailable,
the email link remains usable. The form must state that the inquiry passes
through Formspark, that Netherwood uses it to respond, and that Netherwood does
not sell inquiry information or use it for advertising. Do not send contact
details to the chat service.

## Conversion path

The primary path is:

`Recognizable problem -> relevant service/engagement -> credibility from About or Articles -> Formspark inquiry -> email notification -> human follow-up`

The shorter urgent path is:

`Hero or navigation CTA -> contact form -> email fallback if submission fails`

Articles and future tools should return visitors to the same contact path.
Voyager chat may help explain services, but it must not become a gate, lead
collector, or required step.

## Data and dependency flow

- Public UI: static React/Vite output on GitHub Pages.
- Articles: SQL public-set export -> immutable content branch -> one validated
  static release. No public article API/localStorage fallback.
- Release proof: `publication.json` and `articles-snapshot.json` carry matching
  content digests. Failed publication preserves the last good Pages deployment.
- Contact: Formspark directly from the static page; business email fallback.
- Chat and telemetry: disabled. The existing widget additionally requires
  `VITE_PUBLIC_CHAT_ENABLED=true` and a separately approved reachable HTTPS
  endpoint. Knowledge reconciliation only admits exact versions shared by
  current SQL and the deployed export; retrieval-time protection is pending.
- Private authoring: Voyager and SQL Server, isolated from basic public-site
  availability.

Any new public feature must state its outage behavior before implementation.

## Outstanding capabilities

FEATURE_STATUS.md is the current register for chat, analytics, lead workflow,
owner publishing access, Tools/Query Vault, portrait and other unfinished work.
The functioning article pipeline does not close those features.
