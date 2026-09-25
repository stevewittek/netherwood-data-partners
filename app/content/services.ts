export type Service = {
  slug: string;
  title: string;
  description: string;
  headline: string;
  intro: string;
  situation: string;
  situations: string[];
  approach: { title: string; detail: string }[];
  deliverables: string[];
  technical: string;
  boundary: string;
  questions: { question: string; answer: string }[];
  related: string[];
};

export const servicesMetadata = {
  title: "Data migration & modernization services | Netherwood Data Partners",
  description:
    "Move business data out of aging software and into the platform you choose. Migration, legacy systems assessment and database engineering in NJ and beyond.",
};

export const services: Service[] = [
  {
    slug: "data-migration",
    title: "Data migration",
    description:
      "Business data migration from legacy databases, spreadsheets and files into your chosen platform. Extraction, cleanup, mapping, testing and reconciliation.",
    headline: "Your business history belongs in your next chapter.",
    intro:
      "Years of customers, jobs, invoices, documents and operational history should not keep you tied to software you have outgrown. Netherwood prepares that information for the platform you choose, with a plan for what moves, what stays and how to check it.",
    situation: "The data exists. Getting it into the new system is the work.",
    situations: [
      "The new vendor accepts a CSV, but your records are spread across several databases and spreadsheets.",
      "Customer names, addresses or account numbers do not agree between systems.",
      "You need to move years of transactions and their linked documents, not just a customer list.",
      "Nobody is certain how to prove that the import is complete or correct.",
    ],
    approach: [
      {
        title: "Find and extract the right information",
        detail:
          "Inventory databases, tables, exports and document stores. Understand relationships and source access, then create a repeatable extraction process while protecting the originals.",
      },
      {
        title: "Prepare it for the destination",
        detail:
          "Identify duplicates, inconsistent values and historical exceptions. Agree cleanup rules, map old fields to the new system and transform records into supported import files or API requests.",
      },
      {
        title: "Rehearse and reconcile",
        detail:
          "Run trial migrations and inspect exceptions. Compare counts, relationships, open balances and agreed business totals; have staff test representative records and everyday tasks.",
      },
      {
        title: "Move, validate and hand over",
        detail:
          "Coordinate the production load and cutover with your provider. Define a fallback, check the new environment, document the result and retain an agreed archive of information that does not move.",
      },
    ],
    deliverables: [
      "Source inventory and agreed migration scope",
      "Field mappings and documented cleanup rules",
      "Import files, ETL scripts or integrations within the agreed scope",
      "Trial-migration results and exception log",
      "Reconciliation checks and business acceptance criteria",
      "Cutover, rollback and legacy-data handover plan",
    ],
    technical:
      "Data migration is database engineering. SQL Server, relational schemas, keys, constraints and data types explain how business records fit together. ETL—extracting, transforming and loading data—connects that understanding to CSV, Excel, XML, JSON, bulk loading and APIs. Documents need their own mapping, permissions and completeness checks.",
    boundary:
      "Import limits, supported history, file formats and API access depend on your chosen product. Netherwood verifies those limits with the provider before defining the migration scope. Your staff decide how ambiguous business records should be handled.",
    questions: [
      {
        question: "Can you migrate everything from the old system?",
        answer:
          "That depends on what can be extracted, what the destination accepts and what your business needs to retain. Some history may be better held in a documented, accessible archive. Those decisions belong in the plan before the production migration.",
      },
      {
        question: "Are record counts enough to check the result?",
        answer:
          "No. Equal counts can still hide duplicated customers, broken relationships or incorrect amounts. Validation should also compare agreed business totals, important fields, attachments, exceptions and representative workflows.",
      },
    ],
    related: [
      "business-software-migration",
      "legacy-systems-assessment",
      "database-engineering",
    ],
  },
  {
    slug: "legacy-application-modernization",
    title: "Legacy application modernization",
    description:
      "Assess aging Access, SQL Server, Windows and spreadsheet applications. Decide what to stabilize, replace, integrate, archive or retire without losing history.",
    headline:
      "Your old software does not have to become your forever software.",
    intro:
      "An old application can still be essential to the business. Netherwood helps you understand what it does, where its data lives and what depends on it, so you can make a practical decision about its future.",
    situation:
      "It still runs, but nobody wants to be the person who touches it.",
    situations: [
      "Your Microsoft Access database became mission-critical years ago, and its original author has retired.",
      "An old Windows application or custom SQL Server system has little documentation and limited support.",
      "A spreadsheet now controls jobs, pricing, inventory or reporting for the whole business.",
      "The vendor is discontinuing your software, or you cannot confidently retire its server.",
    ],
    approach: [
      {
        title: "Understand what the application really does",
        detail:
          "Review screens, reports, databases, scheduled tasks, files and staff workarounds. Separate business rules that must survive from features nobody uses anymore.",
      },
      {
        title: "Stabilize what the business still needs",
        detail:
          "Identify recovery gaps and immediate problems. Scope appropriate repairs, documentation or integration while the longer-term replacement is evaluated.",
      },
      {
        title: "Choose a practical destination",
        detail:
          "Compare repair, continued support, integration and replacement against your actual workflows. When an established business product fits, plan the migration around its capabilities.",
      },
      {
        title: "Retire deliberately",
        detail:
          "Test the replacement, reconcile important history and check remaining dependencies. Agree archive access and ownership before shutting down the old application or server.",
      },
    ],
    deliverables: [
      "Application, database and dependency inventory",
      "Documented business rules and critical workflows",
      "Repair, integration or replacement options with tradeoffs",
      "Data extraction and migration requirements",
      "A phased modernization and retirement roadmap",
      "Archive and support handover requirements",
    ],
    technical:
      "An Access application is often more than its tables: forms, queries, reports, macros and linked databases can all encode business rules. SQL Server applications may also depend on stored procedures, scheduled jobs and reporting systems. Understanding those dependencies comes before replacing the application.",
    boundary:
      "Older software is not automatically bad software. The decision depends on its support, recoverability and fit for your business. Proprietary code, unavailable source files or vendor restrictions may limit what can be repaired or extracted.",
    questions: [
      {
        question: "Does Microsoft Access always need to be replaced?",
        answer:
          "No. A supported, understood Access application may still serve its purpose. The concern is whether your business can maintain it, recover it and use it reliably. An assessment helps distinguish a repair from an Access database replacement project.",
      },
      {
        question: "Do we need to build another custom application?",
        answer:
          "Not necessarily. A supported commercial product may cover the work with less maintenance. Netherwood can evaluate the migration and integration requirements around your chosen replacement; a custom build is not the default recommendation.",
      },
    ],
    related: [
      "legacy-systems-assessment",
      "data-migration",
      "workflow-automation",
    ],
  },
  {
    slug: "business-software-migration",
    title: "Business software migration",
    description:
      "Already chose new business software? Get help preparing and moving historical records into your ERP, CRM, practice-management or other SaaS platform.",
    headline:
      "Already chose your new system? We’ll help move the business into it.",
    intro:
      "The software company provides the platform. Netherwood handles the technical work between your current environment and the new one: finding the data, preparing it, coordinating the import and checking that the information your staff need actually arrived.",
    situation: "You bought the cloud application. Now you need to get into it.",
    situations: [
      "Your new provider supplied an import template, but nobody owns the extraction or cleanup.",
      "The standard migration includes basic contacts, while you also need history, documents and relationships.",
      "You need someone who can speak with both your staff and the vendor’s technical team.",
      "The replacement is selected, but the production move, downtime and final checks remain unplanned.",
    ],
    approach: [
      {
        title: "Agree who handles which part",
        detail:
          "Confirm the vendor’s migration offering, supported records, import formats, API options and responsibilities. Identify the gap between that offering and what the business needs.",
      },
      {
        title: "Translate old records into the new model",
        detail:
          "Map customers, matters, jobs, inventory, transactions or other records to the destination. Decide how identifiers, statuses, custom fields and documents should work together.",
      },
      {
        title: "Run a realistic rehearsal",
        detail:
          "Use a test environment or a vendor-approved trial process. Check representative cases with staff, reconcile the agreed scope and resolve import errors before scheduling the final move.",
      },
      {
        title: "Coordinate the business cutover",
        detail:
          "Plan the final export, any changes since the trial, vendor availability, validation and fallback. Document who can authorize going live and what remains available in the legacy archive.",
      },
    ],
    deliverables: [
      "Customer/vendor/Netherwood responsibility map",
      "Source-to-destination field and relationship mappings",
      "Cleaned import files or an agreed API migration process",
      "Trial results and resolved or documented exceptions",
      "Business validation checklist and cutover schedule",
      "Documentation for archived and excluded information",
    ],
    technical:
      "The same migration questions arise around ERP, CRM, practice-management software, accounting systems, field-service products, document-management platforms and other established SaaS products. The source, destination and records are assessed for your project. Netherwood works with your chosen software provider to establish what can move and how.",
    boundary:
      "Your platform. Your data. Your choice. Netherwood provides professional migration services; you choose and license the destination separately. Vendor import capabilities and the scope of their own implementation service are confirmed for each project.",
    questions: [
      {
        question:
          "Our software vendor already offers migration. Do we still need help?",
        answer:
          "Possibly, but not always. First check exactly what is included: extracting the old database, cleaning records, moving attachments, reconciling business totals and retaining unsupported history. Netherwood can take on a defined gap alongside the vendor.",
      },
      {
        question: "Can you help before we choose a platform?",
        answer:
          "Yes. A systems assessment can identify technical requirements and questions for prospective vendors, including how your historical records can be imported and exported. Your business remains in control of the product decision.",
      },
    ],
    related: [
      "data-migration",
      "legacy-systems-assessment",
      "workflow-automation",
    ],
  },
  {
    slug: "legacy-systems-assessment",
    title: "Legacy systems & migration assessment",
    description:
      "Understand your old applications, databases and files before replacing them. A scoped assessment of data quality, dependencies, risks and migration options.",
    headline: "Know what you have before deciding how to move it.",
    intro:
      "You do not need to know what database you have. Start with what your business uses today, what is getting in the way and what you want to change. Netherwood turns that starting point into a clearer picture of the systems, data and migration work involved.",
    situation: "There are too many unknowns to promise a migration yet.",
    situations: [
      "Information is scattered across SQL Server, Access, Excel, shared folders and vendor applications.",
      "One employee knows how the old system works, and little of that knowledge is written down.",
      "You are replacing a server but do not know which reports, imports or applications still depend on it.",
      "You need a realistic migration scope before committing to a replacement or a deadline.",
    ],
    approach: [
      {
        title: "Start with the people and the work",
        detail:
          "Discuss daily processes, important reports, trouble spots and the change you are considering. Identify the staff and providers who understand different parts of the environment.",
      },
      {
        title: "Map systems, data and dependencies",
        detail:
          "Inventory agreed applications, databases, files, interfaces and support responsibilities. Review backup arrangements and what is known about restoration; testing a restore can be scoped where needed.",
      },
      {
        title: "Investigate migration requirements",
        detail:
          "Inspect representative data quality, volume, historical coverage, export options and destination import capabilities. Record uncertainties, retention requirements supplied by the business and integration needs.",
      },
      {
        title: "Define the next decision",
        detail:
          "Explain the options, risks, dependencies and likely complexity in plain language. Propose a preliminary migration plan or modernization roadmap with the remaining questions made explicit.",
      },
    ],
    deliverables: [
      "Current application and database inventory",
      "Data-location and dependency maps",
      "Backup and recovery observations",
      "Data-quality findings and migration risk areas",
      "Replacement/import options and estimated complexity",
      "Preliminary migration plan and modernization roadmap",
    ],
    technical:
      "The assessment looks beneath application names to understand schemas, files, data relationships, scheduled processing, exports, APIs and reporting dependencies. That database-engineering perspective helps distinguish a simple import from a project with hidden operational requirements.",
    boundary:
      "An assessment is a defined professional-services engagement, with access, scope, deliverables and fees agreed before work begins. It does not commit you to buying a replacement product or a later migration project. Retention decisions stay with the business and its advisers.",
    questions: [
      {
        question: "What should we prepare before contacting you?",
        answer:
          "Start with application names if you know them, the change you want to make and any deadline. You can describe the work in everyday language. Do not send passwords, database backups or private business records through the inquiry form.",
      },
      {
        question: "How is this different from the readiness tool?",
        answer:
          "The free readiness tool is a self-check based on your answers. A paid assessment examines an agreed part of the actual environment and produces findings grounded in what can be inspected. The tool helps organize the initial conversation.",
      },
    ],
    related: [
      "legacy-application-modernization",
      "business-software-migration",
      "database-engineering",
    ],
  },
  {
    slug: "database-engineering",
    title: "Database engineering",
    description:
      "SQL Server consulting, performance tuning, health checks, backup and recovery, upgrades, migrations, ETL and reporting from a senior database engineer.",
    headline: "Database depth for the systems your business depends on.",
    intro:
      "SQL Server and relational database engineering remain the foundation of Netherwood’s work. Bring in senior technical help for a demanding database problem, a planned change or a defined period of database support—without creating a full-time DBA role.",
    situation: "You need someone who can get beneath the application.",
    situations: [
      "Queries or reports are slow, and the cause is unclear.",
      "You need a SQL Server migration or upgrade with a tested fallback.",
      "Backups run, but recovery readiness or availability arrangements need review.",
      "Your business needs database design, ETL, reliable reporting or scoped DBA support.",
    ],
    approach: [
      {
        title: "Investigate the actual workload",
        detail:
          "Use the available evidence—execution plans, Query Store, waits, blocking, job history and configuration—to understand behavior before prescribing a change.",
      },
      {
        title: "Improve performance and reliability",
        detail:
          "Scope query and index tuning, database health checks, troubleshooting, backup/recovery reviews and availability planning around your business priorities.",
      },
      {
        title: "Engineer controlled changes",
        detail:
          "Plan upgrades, migrations, schema changes and data loads with testing, release sequencing, validation and rollback. Consider volume, downtime and dependent applications.",
      },
      {
        title: "Leave maintainable data processes",
        detail:
          "Improve database design, ETL and reporting where needed. Document findings and responsibilities, with optional ongoing support scoped separately.",
      },
    ],
    deliverables: [
      "Findings tied to observable database behavior",
      "Prioritized performance or reliability recommendations",
      "Agreed tuning, repair or database-engineering changes",
      "Test and validation evidence appropriate to the work",
      "Migration, upgrade or recovery documentation where scoped",
      "Defined operational and support handover",
    ],
    technical:
      "Steven Wittek’s background includes complex production SQL Server environments, performance investigation, financial data and reporting, recovery and controlled releases. That same attention to schemas, keys, constraints, stored procedures, data types and large datasets supports small-business migrations.",
    boundary:
      "Projects and ongoing support have agreed scope, access, responsibilities, hours and fees. Fractional DBA support means a defined portion of experienced database help; it does not imply unlimited support or automatic 24/7 coverage.",
    questions: [
      {
        question: "Do you still offer SQL Server consulting?",
        answer:
          "Yes. Performance tuning, health checks, troubleshooting, backup and recovery, availability reviews, upgrades, migrations, ETL, reporting and database design remain core services. The broader modernization work builds on that database background.",
      },
      {
        question: "Can you work with our existing IT provider?",
        answer:
          "Yes. Netherwood can own an agreed database or migration scope alongside your internal staff, IT company or application vendor. Access, support boundaries and responsibility for changes are clarified before work begins.",
      },
    ],
    related: [
      "data-migration",
      "legacy-systems-assessment",
      "legacy-application-modernization",
    ],
  },
  {
    slug: "workflow-automation",
    title: "Workflow automation",
    description:
      "Reduce duplicate entry and manual imports, exports, reporting and document work. Connect business systems using appropriate APIs, scripts and Microsoft 365 tools.",
    headline: "Make the new system work with the rest of your business.",
    intro:
      "Moving to better software is a useful start. The next improvement may be removing the repeated copying, file handling and spreadsheet work that still sit around it. Netherwood helps identify and automate a defined, useful workflow.",
    situation: "Your staff are still moving the same information by hand.",
    situations: [
      "A customer or job must be entered into two different systems.",
      "Someone downloads, cleans and uploads the same report every week.",
      "Documents arrive in a shared folder and need to be matched to business records.",
      "Your new cloud application needs to exchange information with an existing database or reporting process.",
    ],
    approach: [
      {
        title: "Understand the manual process",
        detail:
          "Follow the actual work with staff. Identify the trigger, decisions, data owners and exceptions before deciding what should run automatically.",
      },
      {
        title: "Choose a maintainable connection",
        detail:
          "Evaluate vendor-supported APIs, imports/exports, scripting and tools already appropriate to the environment, including Microsoft 365, SharePoint or Power Automate where suitable.",
      },
      {
        title: "Make errors visible",
        detail:
          "Define duplicate handling, retries, permissions and failure reporting. Keep a human review step for business decisions that should not be delegated to a script.",
      },
      {
        title: "Test and hand over ownership",
        detail:
          "Check routine and exceptional cases, document how to run or pause the workflow and agree who maintains it when a vendor changes an interface.",
      },
    ],
    deliverables: [
      "Current and proposed workflow map",
      "Integration requirements and supported interface review",
      "A scoped import, export, reporting or document workflow",
      "Error handling and verification checks",
      "Run instructions, ownership and maintenance notes",
    ],
    technical:
      "Useful automation often rests on sound data engineering: reliable identifiers, consistent data types, clear ownership and repeatable transformations. APIs, scheduled scripts and database queries can connect those foundations without making every business process a custom application.",
    boundary:
      "The right approach depends on the interfaces, permissions and licenses your systems provide. Netherwood does not assume every product can be integrated or automate an unclear process before understanding its exceptions.",
    questions: [
      {
        question: "Do we need AI to automate a workflow?",
        answer:
          "Often, no. A supported API, a scheduled import or a simple script may be more predictable for a defined task. AI can be considered where interpretation of documents or language adds value and the result can be checked.",
      },
      {
        question: "Can automation be part of a migration?",
        answer:
          "Yes. A migration may need temporary data exchanges during the transition or an ongoing integration afterward. It helps to agree which connections are temporary, which are permanent and who owns each one.",
      },
    ],
    related: [
      "business-software-migration",
      "database-engineering",
      "practical-ai",
    ],
  },
  {
    slug: "practical-ai",
    title: "Practical AI",
    description:
      "Explore controlled AI for internal knowledge search, document extraction, summaries and workflow assistance after organizing your business information.",
    headline: "Organize the business first. Automate intelligently second.",
    intro:
      "Useful AI starts with a specific task and information your business can trust. Netherwood helps assess practical uses of AI around organized data and established workflows, giving staff better tools for the work they already do.",
    situation:
      "There may be a useful task here—not a reason to replace your staff.",
    situations: [
      "Employees spend time searching approved procedures and internal reference documents.",
      "Someone needs to extract common fields from incoming documents and review the result.",
      "Long documents or recurring reports need a first-pass summary for a person to check.",
      "You want to understand which company information an AI tool would be allowed to use.",
    ],
    approach: [
      {
        title: "Choose a bounded use case",
        detail:
          "Define the staff task, the expected output and what would make the result useful. Compare it with a simpler search, report or conventional automation before selecting an approach.",
      },
      {
        title: "Prepare the information and access rules",
        detail:
          "Review source quality, ownership and permissions. Agree what information may be processed, which users may access it and what the chosen provider does with that information.",
      },
      {
        title: "Evaluate representative results",
        detail:
          "Test real task patterns using appropriately approved material. Check missing information, incorrect answers and uncertain outputs, with human review built into the workflow.",
      },
      {
        title: "Document a controlled rollout",
        detail:
          "Define acceptable use, review responsibilities, costs and maintenance. Keep the workflow usable when the AI service is unavailable or a result needs correction.",
      },
    ],
    deliverables: [
      "Use-case assessment and success criteria",
      "Data-source and access requirements",
      "A scoped proof of concept where appropriate",
      "Evaluation examples and documented limitations",
      "Human review, operating and handover guidance",
    ],
    technical:
      "Possible projects include internal knowledge search, document extraction, summarization, employee assistants, report drafting and workflow assistance. The aim is to make useful technical capabilities accessible to a smaller business on a project basis, with database and information-management fundamentals underneath them.",
    boundary:
      "AI outputs can be incorrect. Sensitive information, provider terms, permissions and review requirements must be considered for the actual use case. The project defines what can run automatically, what a person needs to check and how staff can correct or decline a result.",
    questions: [
      {
        question:
          "Where should we start if our files and data are disorganized?",
        answer:
          "Start by understanding and organizing the source information. A systems assessment or a document/data project can identify ownership, duplicates and access requirements before an AI tool is introduced.",
      },
      {
        question: "Do you require a particular AI platform?",
        answer:
          "No. Product choice follows the task, data handling requirements, integration options and budget. Any proof of concept or implementation is separately scoped, including the software or service costs the business would incur.",
      },
    ],
    related: [
      "legacy-systems-assessment",
      "workflow-automation",
      "data-migration",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
