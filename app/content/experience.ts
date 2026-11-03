/** Owner-approved public career narratives. Private research and employer mappings stay outside this repository. */
import { siteUrl } from "./site.ts";

export const engineeringExperience = {
  "title": "Engineering experience",
  "headline": "Experience behind systems people depend on.",
  "introduction": [
    "Investment teams waiting for financial analysis. Healthcare operations managing demanding production workloads. Retail stores replacing registers while customers continue shopping. Fundraising teams changing software without losing the reporting their work depends on.",
    "These are the kinds of environments in which I have developed software, engineered databases, and taken responsibility for difficult production problems. My work connects the business process, the application, and the data underneath it—from finding the cause of a slow report to designing the scripts technicians use during a live system cutover.",
    "Today, I bring that experience to Netherwood Data Partners, combining senior database engineering with modern software development, AI-assisted implementation, source control, and practical testing."
  ],
  "careerAttribution": "The career stories below describe Steven Wittek’s work during prior employment and consulting engagements. Organizations are anonymized. Current independent software projects are identified separately.",
  "highlights": [
    {
      "value": "2-hour report process → under 3 minutes",
      "label": "Investment reporting runtime",
      "kind": "Measured career outcome; approximate timings"
    },
    {
      "value": "Multiterabyte SQL Server environments",
      "label": "Production platform and reporting experience",
      "kind": "Technical operating scale"
    },
    {
      "value": "150GB+ indexes",
      "label": "Controlled healthcare maintenance work",
      "kind": "Technical operating scale"
    },
    {
      "value": "160-store live POS migration",
      "label": "Cutover scripts and transaction synchronization",
      "kind": "Rollout scale; database cutover engineering contribution"
    }
  ],
  "homeTeaser": {
    "heading": "Enterprise experience. Practical engineering.",
    "paragraph": "The experience behind Netherwood includes a two-hour investment reporting process reduced to under three minutes, healthcare production performance work, and database cutover engineering for a live POS rollout across approximately 160 stores. Explore the business problems, the engineering responsibilities, and the results behind the work.",
    "linkLabel": "Explore engineering experience",
    "featuredStories": [
      "institutional-investment-platform",
      "healthcare-production-performance",
      "retail-register-cutover"
    ]
  },
  "stories": [
    {
      "id": "institutional-investment-platform",
      "category": "Financial technology",
      "title": "Engineering an institutional investment platform at scale",
      "summary": "A two-hour reporting process reduced to under three minutes, alongside separate work on cloud modernization, scalability, security governance, recovery, and controlled releases.",
      "paragraphs": [
        "Pension funds, endowments, foundations, and family offices need to understand investments spread across public and private markets. Portfolio analytics brings performance, risk, exposure, and liquidity information together so investment teams can assess complex portfolios and explain them to stakeholders. The platform I worked on served institutional asset owners operating at substantial financial scale.",
        "I was one of the senior database engineers responsible for the production data environment and database development behind that platform. I worked with application developers, analytics engineers, infrastructure specialists, and client services on problems that crossed team boundaries. My responsibility was to connect what users experienced with the application requests, calculations, and database behavior producing it.",
        "In one performance initiative, a calculation-intensive investment reporting process took approximately two hours to complete. I investigated the SQL execution and optimized the reporting implementation, reducing runtime to under three minutes. That gave users a much shorter wait for financial analysis and provided a concrete measure of the value of the database work.",
        "Across separate application-performance initiatives, I worked with developers on repeated database calls, dashboard initialization, expensive calculations, and workload distribution. The engineering involved execution plans, Query Store, indexing, set-based processing, partitioning, and columnstore structures. It required understanding when to improve the SQL and when to change the way the application asked the database to work.",
        "My broader platform responsibilities included an Azure-to-Google-Cloud modernization spanning Windows, Linux, and SQL Server versions in a multiterabyte environment. As part of the engineering team, I contributed database performance, compatibility, high-availability, and operational-readiness work. Workload replay, load testing, and telemetry helped evaluate configuration choices and identify regressions before production changes.",
        "I also took ownership of improvements to database access governance: replacing accumulated individual grants with defined access groups, management approval for privileged access, operating documentation, and evidence for audit review. I supported source-controlled database releases and production change review, where a schema or index change had to be considered in the context of a running financial application.",
        "Recovery was another part of that responsibility. When financial records were deleted while production continued processing, I used a separate restored database to support targeted recovery and coordinated validation of the recovered information and its dependent calculations. The recovery approach preserved the distinction between repairing affected records and rolling back the whole production system."
      ],
      "outcome": "Reduced a two-hour investment reporting process to under three minutes, with additional responsibilities spanning production reliability, platform modernization, access governance, releases, and targeted recovery.",
      "ownership": "Senior database engineering within a shared platform team; direct reporting optimization and access-governance work, with cross-team modernization, application changes, and recovery validation.",
      "technologies": [
        "SQL Server",
        "T-SQL",
        "Query Store",
        "Azure",
        "Google Cloud",
        "Windows and Linux",
        "Always On",
        "Azure DevOps",
        "DacFx/DACPAC",
        "JMeter",
        "Grafana"
      ],
      "relatedServices": [
        "database-engineering",
        "legacy-application-modernization"
      ]
    },
    {
      "id": "healthcare-production-performance",
      "category": "Healthcare technology",
      "title": "Connecting software development with healthcare production",
      "summary": "Production performance leadership and a controlled maintenance process for a demanding healthcare platform, including 150GB+ indexes.",
      "paragraphs": [
        "Healthcare benefits software sits behind operational work that health plans and pharmacy benefit managers depend on. When production workloads slow down, the issue reaches beyond a database dashboard: application processing and the people relying on its output are affected. Changes also have to respect restrictions on protected health information.",
        "I served as a senior U.S.-based database performance engineer and a technical liaison between offshore software developers and production operations. Differences between development and production workloads, together with restrictions on production data access, made it difficult to investigate some problems entirely within the development environment. I connected those teams through production-aware technical investigation and review.",
        "I reviewed T-SQL, stored procedures, execution plans, and indexing changes against Query Store history and actual workload behavior. My role was to turn symptoms such as high CPU into findings developers could act on, then evaluate the changes against the conditions that mattered in production.",
        "Targeted query and indexing improvements helped keep production CPU below its previous roughly 80% level as demand returned toward seasonal peaks.",
        "I also addressed an inherited index and statistics maintenance backlog extending beyond a year. With production indexes of 150 GB and larger, maintenance needed to be planned around the live workload. I established recurring maintenance and used controlled online, resumable operations for large indexes, accounting for transaction-log growth, concurrency, replica synchronization, and available capacity.",
        "The work combined immediate performance investigation with a repeatable operational process. It gave development teams a stronger connection to production behavior and addressed maintenance work that had become difficult to complete through ordinary scheduling."
      ],
      "outcome": "Improved healthcare production performance and established controlled maintenance for large database objects, while bridging distributed development and restricted production operations.",
      "ownership": "Production SQL performance investigation, developer liaison and code review, and the design and introduction of the maintenance approach.",
      "technologies": [
        "SQL Server",
        "T-SQL",
        "Query Store",
        "Execution plans",
        "Indexing",
        "Online and resumable index operations",
        "Production monitoring"
      ],
      "relatedServices": [
        "database-engineering",
        "software-systems-support"
      ]
    },
    {
      "id": "fundraising-reporting-crm",
      "category": "Nonprofit finance and CRM",
      "title": "Making a CRM replacement work for fundraising teams",
      "summary": "Executive reporting, reusable donor selections, and transaction reconciliation supporting multimillion-dollar fundraising operations and business-software change.",
      "paragraphs": [
        "A fundraising organization needs more than a list of donors. Campaign leaders and finance teams need to understand commitments, payments, outstanding pledges, designated funds, and allocations across reporting periods. In multimillion-dollar fundraising operations, the meaning of those records matters as much as the ability to retrieve them.",
        "In a full-time role within the organization, I supported the campaign team, campaign directors, CFO, CTO, and other business leaders. I worked directly with them to turn their requirements into custom financial and fundraising reports. The work included campaign-close reporting, donor analysis, historical comparisons, and requests supporting executive and board discussions. It depended on understanding how the organization accounted for its activity and how leadership used the information.",
        "A transition from a legacy fundraising application to Blackbaud CRM brought a further challenge: capabilities users relied on needed to be available in the replacement system. Reporting was part of the migration acceptance decision. A database conversion alone would not make the new application usable for the people doing the work.",
        "I designed and developed a reusable selection-based reporting framework. Users could define a group of constituents from donation history, campaign participation, pledge activity, and other business criteria, then apply that group to different reports. I also implemented static constituent lists that users could maintain themselves, preserving their predefined groups alongside query-based selections. Shared reporting patterns gave other developers a foundation for additional reports.",
        "Across related CRM conversions for multiple nonprofit organizations, I addressed a separate financial-data problem: negative payments and adjustments did not always translate cleanly between the source and destination accounting models. I investigated the transaction relationships and developed SQL preparation and correction logic so the financial meaning could be reviewed and reconciled during conversion.",
        "These were connected business needs, addressed through distinct engineering efforts: dependable leadership reporting, familiar workflows in a replacement application, and financial records that could be meaningfully reconciled. The work provided reusable software and reporting structures around the way fundraising teams actually operated."
      ],
      "outcome": "Delivered custom reporting and reusable donor-selection capabilities needed for CRM migration acceptance, alongside repeatable financial-data preparation and reconciliation work across related conversions.",
      "ownership": "Full-time database engineering and reporting support for the campaign team, directors, CFO, and CTO; reporting framework design and development, constituent-list customization, and SQL financial conversion logic.",
      "technologies": [
        "SQL Server",
        "T-SQL",
        "Blackbaud CRM",
        "SSRS",
        "Data mapping",
        "Financial reconciliation"
      ],
      "relatedServices": [
        "business-software-migration",
        "data-migration",
        "workflow-automation"
      ]
    },
    {
      "id": "retail-register-cutover",
      "category": "Retail systems",
      "title": "Live POS migration across a 160-store retail operation",
      "summary": "Database cutover engineering for a multiweek POS and inventory rollout, progressing at one or two stores per day while sales continued.",
      "paragraphs": [
        "A major sporting goods retailer was replacing its point-of-sale and inventory platform across approximately 160 stores. The replacement addressed limitations in aging register hardware and software, including compatibility with newer payment terminals and security requirements. I joined later in the project, for the live database cutover and transaction-migration phase.",
        "The rollout progressed over multiple weeks, with store teams migrating one or two locations per day. Each cutover had to account for sales continuing on the old registers while the new system was brought online. Transactions recorded during that transition needed to move into the new sales and inventory environment and remain available to central reporting.",
        "I developed the database scripts used for the staged register cutover. In the pattern I supported, two legacy registers stayed open for sales while two were migrated. Once the new registers were operational, they opened for sales and the remaining legacy registers could be migrated. My scripts captured the transactions generated on the legacy system during that period and synchronized the data into the new environment.",
        "Store technicians executed my batch scripts to run the SQL steps on the registers. The procedure had to be repeatable across a sustained rollout and usable by the people carrying out each live store migration. My responsibility was the transaction capture, migration scripting, and synchronization supporting those cutovers.",
        "I also developed the backend process that synchronized the data with the retailer’s central, on-premises SQL Server reporting environment, which was multiterabyte in size. The work connected register-level transactions with the new sales and inventory process and the central reporting destination. I also worked across teams on blocking and application bottlenecks affecting that flow.",
        "The result was a repeatable database cutover process supporting a large retail rollout while stores continued trading. My contribution covered the final migration stage: the scripts technicians ran in stores and the backend synchronization that brought the transaction data into the central environment."
      ],
      "outcome": "Delivered the register cutover scripts and backend synchronization supporting a live POS migration across approximately 160 stores, with a rollout pace of one or two stores per day.",
      "ownership": "Developed the register cutover scripts, transitional transaction capture, and backend synchronization during the final migration phase. Store technicians executed the in-store procedure as part of the wider POS and inventory replacement program.",
      "technologies": [
        "SQL Server",
        "PostgreSQL",
        "SQL scripting",
        "Batch automation",
        "Transaction capture",
        "Data synchronization"
      ],
      "relatedServices": [
        "data-migration",
        "workflow-automation",
        "software-systems-support"
      ]
    },
    {
      "id": "research-intellectual-property-migration",
      "category": "Research and higher education",
      "title": "Preserving the meaning of research and licensing data",
      "summary": "Reverse engineering and migration preparation for intellectual property records, inventor relationships, licensing information, and financial allocations.",
      "paragraphs": [
        "University technology-transfer teams manage the relationships between research discoveries, inventors, licensing activity, and the allocation of financial returns. Moving that information requires more than copying tables: the receiving system needs to understand which records belong together and what the relationships mean.",
        "A major public research university needed to move intellectual property information from a custom FileMaker application into Wellspring IP. The legacy system contained incomplete documentation, application-specific visual indicators, and financial relationships that were not immediately clear from the exported data.",
        "I owned the technical extraction, transformation, SQL Server staging, and delivery work. I investigated the legacy structures and business rules, translated application-specific meanings into explicit data mappings, and prepared the relationships between intellectual property records, inventors, participating entities, and financial allocations.",
        "The work also required dealing with older database connectivity and ODBC compatibility constraints. I used SQL Server as an intermediate environment to organize and transform the information, then prepared a compatible database backup for the receiving software vendor. Wellspring performed the final import into its hosted application.",
        "My deliverable was structured, vendor-ready migration data with the relationships needed to represent the original business information. The engineering effort made the legacy application understandable enough to support its replacement."
      ],
      "outcome": "Delivered a transformed SQL Server dataset and vendor-compatible backup for the receiving platform, covering research-IP relationships and financial allocations.",
      "ownership": "Extraction, reverse engineering, transformation, staging, and vendor handoff. Final hosted import belonged to the receiving vendor.",
      "technologies": [
        "FileMaker",
        "SQL Server",
        "SQL transformation",
        "ODBC",
        "Wellspring IP",
        "Relational data modeling"
      ],
      "relatedServices": [
        "data-migration",
        "legacy-systems-assessment",
        "business-software-migration"
      ]
    },
    {
      "id": "business-processing-after-recovery",
      "category": "Critical incident diagnosis",
      "title": "Getting order processing working after recovery",
      "summary": "Application and database concurrency analysis resolved the blocking and deadlocks preventing a recovered business system from operating reliably.",
      "paragraphs": [
        "After a ransomware-related disruption and infrastructure recovery, a business still could not use its Microsoft Dynamics application reliably. Order processing was affected by recurring SQL Server blocking, deadlocks, and poor performance. Recovering the infrastructure had not resolved the application’s operating problem.",
        "I was brought in as the database specialist to investigate the behavior across the application and SQL Server. I examined locking and concurrency evidence and worked with the application and infrastructure teams to establish what was preventing transactions from completing normally.",
        "The investigation identified a mismatch between the application’s transaction-isolation requirements and the database configuration. I worked across the teams to get that mismatch corrected. The reported blocking and deadlocks then cleared, and normal application processing resumed.",
        "The value of the work was connecting a business-critical symptom to its underlying cause across multiple technical layers. My role was the post-recovery application and database diagnosis; the wider ransomware response and infrastructure recovery were separate responsibilities."
      ],
      "outcome": "Resolved the application/database isolation mismatch associated with post-recovery blocking and deadlocks, allowing normal order processing to resume.",
      "ownership": "Database investigation, concurrency diagnosis, and cross-team resolution following the wider infrastructure recovery.",
      "technologies": [
        "SQL Server",
        "Microsoft Dynamics",
        "Blocking analysis",
        "Deadlock analysis",
        "Transaction isolation"
      ],
      "relatedServices": [
        "database-engineering",
        "software-systems-support"
      ]
    },
    {
      "id": "neonatal-reporting-azure-sql",
      "category": "Healthcare reporting modernization",
      "title": "Adapting neonatal reporting for Azure SQL",
      "summary": "Database and reporting compatibility work for one healthcare client’s participating application, preserving its practical function through a platform change.",
      "paragraphs": [
        "Neonatal reporting applications support the collection, checking, and submission of information used for quality improvement and research. For the healthcare teams using them, a database platform change needs to preserve the application and reporting functions that support that work.",
        "I adapted one healthcare client’s eNICQ application environment and supporting reporting database for Azure SQL Database. The existing software had been built around a traditional SQL Server environment, so the work required investigation of database compatibility, application dependencies, and reporting behavior.",
        "I worked through those compatibility requirements, adapted the database and supporting reporting components, and validated application behavior and output. This was a client-level modernization of an existing application environment, with attention to the way the software used the database.",
        "The outcome was an Azure SQL adaptation focused on retaining the application’s practical reporting functionality. The same approach applies to other legacy healthcare software: understand its dependencies, make the required platform changes, and check the workflows people rely on."
      ],
      "outcome": "Adapted a participating healthcare client’s database and reporting environment for Azure SQL compatibility and validated the application’s working behavior.",
      "ownership": "Client-level database and reporting adaptation and compatibility validation.",
      "technologies": [
        "SQL Server",
        "Azure SQL Database",
        "eNICQ",
        "SQL reporting",
        "Application compatibility"
      ],
      "relatedServices": [
        "legacy-application-modernization",
        "database-engineering",
        "data-migration"
      ]
    }
  ],
  "currentPractice": {
    "id": "modern-engineering",
    "title": "Production experience, modern tools, and AI-assisted delivery",
    "paragraphs": [
      "My independent development work brings these operating lessons into the way I build today. I define the problem, investigate the existing system, and use AI-assisted tools to explore approaches, develop implementations, and improve tests and documentation. The business requirement and the evidence remain the basis for deciding whether the work is complete.",
      "My role includes specifying behavior, directing implementation, reviewing changes, and validating the result. A generated implementation still needs to be understood in the context of the application, its data, and its failure conditions. For database work, I examine plans, execution behavior, and data relationships. For software, I test the user flow and check how the components work together.",
      "Git, pull requests, automated checks, and release workflows make changes easier to inspect and reproduce. SQL database projects and deployment artifacts provide a reviewable record of database changes. I use that structure to keep implementation, validation, and delivery connected, with documentation that explains decisions and remaining limits.",
      "This approach helps me move efficiently between database engineering, application development, integrations, and practical automation. The objective is a working result that can be reviewed, maintained, and handed over with an understandable account of what was changed and checked."
    ],
    "projects": [
      {
        "name": "QueryVault",
        "text": "Built around a problem I encountered in performance engineering: a database refresh or Query Store retention limit can remove the baseline before an optimization effort is finished. QueryVault preserves completed Query Store periods in a separate SQL Server archive for later comparison. Its public source, real lab screenshots, and validation documentation make the design and evidence inspectable.",
        "href": "/products/queryvault/",
        "evidenceUrl": "https://github.com/stevewittek/Databases"
      },
      {
        "name": "PageMover",
        "text": "A visual SQL Server index and heap inspection tool that makes physical database structures easier to explore. The developer preview separates analysis from explicitly enabled maintenance and exposes proposed SQL for review. Its public overview describes the design and current limitations; the implementation remains private.",
        "href": "/products/sql-server-index-maintenance-visualizer/",
        "evidenceUrl": "https://github.com/stevewittek/Toolkit/blob/main/docs/PAGEMOVER_OVERVIEW.md"
      },
      {
        "name": "Motion Relay",
        "text": "An independent application and systems-integration project connecting Garmin workout readings with phone displays and an optional assistant connection. It demonstrates my current approach to defining product behavior, directing AI-assisted development, testing integrations, and managing software changes. Its product pages provide the current setup and availability information.",
        "href": "/products/garmin-ai-connector/",
        "evidenceUrl": null
      }
    ],
    "relatedServices": [
      "practical-ai",
      "workflow-automation",
      "database-engineering"
    ]
  },
  "closing": {
    "heading": "Bring experience to your next software or data problem.",
    "paragraph": "If an application is slow, a migration is approaching, or a business process needs better software, describe the system and the result you need. Netherwood offers direct involvement from the engineer doing the work, with scope and validation agreed for the project.",
    "linkLabel": "Discuss a project",
    "href": "/#contact"
  }
};

export type EngineeringStory = (typeof engineeringExperience.stories)[number];
export const engineeringStories = engineeringExperience.stories;
export const experiencePath = "/case-studies/";
export const experienceMetadata = {
  title: "Engineering Experience | Netherwood Data Partners",
  description: "Senior database and software engineering experience across investment analytics, healthcare, retail, nonprofit CRM and research systems, with practical outcomes.",
};
export function getEngineeringStory(slug: string) {
  return engineeringStories.find((story) => story.id === slug);
}
export function getStoriesForService(slug: string) {
  return engineeringStories.filter((story) => story.relatedServices.includes(slug));
}
export function storyPath(story: EngineeringStory) {
  return `${experiencePath}${story.id}/`;
}
export function storyMetadata(story: EngineeringStory) {
  return { title: `${story.title} | Netherwood Data Partners`, description: story.summary };
}
export function experienceSchema(story?: EngineeringStory) {
  const url = `${siteUrl}${story ? storyPath(story) : experiencePath}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      story ? {
        "@type": "Article",
        headline: story.title,
        description: story.summary,
        url,
        mainEntityOfPage: url,
        author: { "@type": "Person", name: "Steven Wittek", url: `${siteUrl}/about/` },
        publisher: { "@type": "Organization", name: "Netherwood Data Partners", url: `${siteUrl}/` },
      } : {
        "@type": "CollectionPage",
        name: experienceMetadata.title,
        description: experienceMetadata.description,
        url,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: engineeringStories.map((item, index) => ({
            "@type": "ListItem", position: index + 1, name: item.title, url: `${siteUrl}${storyPath(item)}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Engineering experience", item: `${siteUrl}${experiencePath}` },
          ...(story ? [{ "@type": "ListItem", position: 3, name: story.title, item: url }] : []),
        ],
      },
    ],
  };
}
