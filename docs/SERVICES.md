# Productized services

Content definitions for Voyager 2. Drafted September 25, 2026. These are offers to scope and purchase, not fixed-price promises, SLAs, or evidence of completed projects. The founder approves actual scope, price, availability, legal terms, and timeline before quoting. Use the existing [client-work templates](CLIENT_WORK_TEMPLATES.md) and protected operating kit for real engagements.

## Positioning

**Data migration and systems modernization for small and midsize businesses.**

Netherwood helps established businesses understand older applications, databases, spreadsheets, and workflows, then move the needed information into the platform they choose. Work may involve a SaaS vendor, SQL Server, Azure SQL, Microsoft Access, files, or another supported system. Vendor-neutral means the customer's needs determine the destination.

## 1. Legacy Systems & Migration Assessment

**Customer-facing description:** Understand the system you have and the steps needed to move forward. Netherwood reviews your applications, databases, dependencies, and migration requirements, then provides a practical roadmap to the replacement platform.

**Best fit:** A business considering or planning a system replacement, uncertain about its data, vendor exports, dependencies, or migration responsibilities.

**Purchasable entry point:** A bounded assessment of named systems and a defined data sample. Start with one source environment and its intended destination; quote additional systems explicitly.

**Work may include:** Application/database inventory, access and export feasibility, dependency identification, data-quality sampling, history/retention needs, destination-vendor coordination, risks, validation approach, and cutover options.

**Deliverables:**

- Current-state inventory and simple data-flow/dependency map.
- Source-to-destination questions and preliminary mapping constraints.
- Findings, risks, assumptions, and decisions the customer must make.
- Migration roadmap with phases, responsibilities, test/validation approach, and scoped next-step estimate.
- Review conversation and handoff to the customer's decision maker.

**Acceptance:** The named systems are documented, material unknowns are explicit, the customer can see what to do next and who owns it, and the agreed review takes place. An assessment can conclude that a migration is unnecessary or that vendor constraints require a different plan.

**Customer inputs:** System/vendor list, authorized technical contact, available documentation/exports, business priorities, target platform, known deadlines, and permission for any access.

**Boundaries:** No production changes, guaranteed export of all data, security/compliance certification, or vendor selection procurement unless separately scoped. Use synthetic/redacted data when possible.

**Commercial approach:** Fixed fee after a short fit call and scope confirmation. Price depends on system count, accessibility, data complexity, and deliverable depth; the founder supplies the actual amount and timeline in the proposal.

**Call to action:** Request a migration assessment.

**Proposed page:** `/legacy-systems` with a clear route to the inquiry form; Voyager 2 confirms the final route.

## 2. Data Migration Project

**Customer-facing description:** Move your business data into the platform you have chosen. Netherwood helps extract, clean, map, transform, test, migrate, and validate the agreed data, working with your team and the destination software vendor.

**Best fit:** A selected replacement system with an identified business owner, authorized access, and a realistic destination import process. Unknown source/destination feasibility may require the assessment first.

**Purchasable entry point:** A migration of specified entities/history between named systems, with agreed test cycles, cutover window, reconciliation criteria, and responsibilities.

**Work may include:** Source extraction, profiling and approved cleanup, mapping, transformations, trial loads, rejected-record handling, reconciliation, user testing, production migration, cutover support, and archive handoff.

**Deliverables:**

- Approved mapping and transformation rules with documented exclusions.
- Repeatable extraction/transformation/import steps where feasible.
- Test-load evidence, exception register, and agreed reconciliation results.
- Cutover plan, backup/recovery checks, decision points, and rollback criteria.
- Production migration evidence and customer acceptance record.
- Handover instructions and agreed legacy archive/disposition plan.

**Acceptance:** Define counts, totals, required fields, referential checks, representative record checks, and user workflows before migration. Resolve or explicitly accept exceptions. The customer authorizes cutover and confirms the destination meets the written criteria. “No data loss” is not a substitute for measurable agreed tests.

**Customer/vendor inputs:** Valid exports, destination schema/import support, field definitions, business-rule decisions, test access, backup responsibilities, cutover authority, and timely user validation.

**Boundaries:** Replacement software licenses, vendor feature development, unrestricted cleanup, live synchronization, unsupported extraction, ongoing application support, and deletion of the legacy system are outside scope unless expressly included. Regulatory data handling and archive retention are determined for the engagement.

**Commercial approach:** Milestone quote after discovery; use capped time-and-materials or a paid feasibility phase when uncertainty prevents a responsible fixed fee. Document change orders before additional work.

**Call to action:** Discuss your data migration.

**Proposed page:** `/data-migration`; optional focused pages `/access-migration` and `/sql-server-migration` only when Voyager 2 can provide accurate distinct content.

## 3. Fractional DBA / Database Health

**Customer-facing description:** Get senior database expertise without adding a full-time DBA. Netherwood provides project-based database health reviews and an agreed allocation of ongoing help for SQL Server and supported database environments.

**Best fit:** A business with an existing database owner or support team that needs help with performance, backup/recovery, maintenance, upgrade planning, or migration readiness.

**Purchasable entry point:** A health review for a named environment, followed by optional recurring support with defined hours, tasks, availability, and escalation terms.

**Work may include:** Configuration/health review, backup and restore evidence, performance investigation, maintenance review, troubleshooting, upgrade readiness, and monitoring recommendations.

**Deliverables:**

- Health findings with evidence and business effect.
- Backup/recovery observations, including what was restored/tested versus only inspected.
- Prioritized recommendations with owner, prerequisites, and next action.
- A review conversation; approved remediation may be a separate project.
- For recurring support: agreed work log, periodic summary, and capacity review.

**Acceptance:** Agreed checks are reported as passed, failed, or not tested; the customer understands material risks and next steps. A successful backup job alone is not described as proof of recoverability. Production restore testing and remediation require their own approved scope/window.

**Customer inputs:** Authorized restricted access, environment inventory, performance symptoms, maintenance/backup history, recovery objectives, and responsible contacts.

**Boundaries:** No implied 24/7 response, managed security service, unlimited incidents, or uptime warranty. Publish a response commitment only after staffing, coverage, and contractual arrangements support it.

**Commercial approach:** Fixed-scope review or agreed recurring block/retainer; the proposal defines overage approval, unused hours, coverage, and cancellation. No public rates are invented here.

**Call to action:** Ask about database help.

**Proposed page:** `/database-services`; Voyager 2 may retain an existing equivalent route.

## Shared inquiry and proposal flow

One short form is enough: company, business reply email, selected service, current/target platform if known, description, and optional timeframe. Do not require employee profiles, revenue, or a lead score. Tell people not to submit credentials or sensitive records. Preserve campaign attribution according to [VOYAGER2-INTEGRATION.md](VOYAGER2-INTEGRATION.md).

The founder responds, confirms fit, conducts a short discovery conversation, and quotes the next bounded piece of work. Keep the approved scope and delivery/client records in the protected business system; the marketing dashboard only needs inquiry, booked conversation, and customer outcomes.
