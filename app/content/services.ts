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
  title: "Database & Software Consulting | Netherwood Data Partners",
  description:
    "Focused SQL Server, data migration, integration and application work from Netherwood Data Partners.",
};

export const services: Service[] = [
  {
    slug: "software-systems-support",
    title: "Software & systems support",
    description: "Application troubleshooting, reporting issues and technical evidence for your software provider.",
    headline: "Investigate the application problem.",
    intro: "I help trace application errors, inconsistent reports and broken data flows. We agree what I can address and what needs your software provider.",
    situation: "When an application interrupts the work",
    situations: [
      "Staff keep working around the same application problem.",
      "Your software vendor needs technical details nobody has time to gather.",
      "A report or integration is producing inconsistent information.",
      "You need help after a software change, without hiring a full-time specialist."
    ],
    approach: [
      {
        title: "Reproduce the issue",
        detail: "Gather an example and inspect the application, database and data flow."
      },
      {
        title: "Agree the change",
        detail: "Confirm scope, access and recovery steps before making changes."
      },
      {
        title: "Check and document",
        detail: "Test the result with you and record the findings or vendor handoff."
      }
    ],
    deliverables: [
      "A documented problem and findings",
      "Agreed application or database fixes",
      "Technical evidence for a vendor support case"
    ],
    technical: "SQL Server, reporting, imports and integrations are the foundation of this work.",
    boundary: "Netherwood is an independent consultancy, not the software vendor. Product licensing, proprietary code changes and vendor-only fixes remain with the provider. Support hours, access and response expectations are agreed for each engagement; no 24/7 coverage is implied.",
    questions: [
      {
        question: "Can we start with one issue?",
        answer: "Yes. A focused investigation can be the right starting point. We agree the problem, access, scope and fee before paid work begins."
      },
      {
        question: "Can you work with our software company?",
        answer: "Yes. Netherwood can help gather technical evidence, explain data and system dependencies, and coordinate agreed work with your existing provider. That does not imply a formal vendor partnership."
      }
    ],
    related: [
      "database-engineering",
      "workflow-automation",
      "legacy-systems-assessment"
    ]
  },
  {
    slug: "data-migration",
    title: "Data migration",
    description: "Data mapping, cleanup, trial imports and reconciliation for a chosen platform.",
    headline: "Prepare your data for the next system.",
    intro: "I map, clean and test data for the platform you choose. We agree what moves, what stays, and how to check the result before cutover.",
    situation: "When an import needs more than a CSV",
    situations: [
      "The new vendor accepts a CSV, but your records are spread across several databases and spreadsheets.",
      "Customer names, addresses or account numbers do not agree between systems.",
      "You need to move years of transactions and their linked documents, not just a customer list.",
      "Nobody is certain how to prove that the import is complete or correct."
    ],
    approach: [
      {
        title: "Map the source",
        detail: "Identify records, relationships, documents and supported extraction methods."
      },
      {
        title: "Prepare and rehearse",
        detail: "Agree cleanup rules, map destination fields and test imports. Record exceptions."
      },
      {
        title: "Validate and hand over",
        detail: "Compare agreed totals and workflows, plan cutover and fallback, and document retained history."
      }
    ],
    deliverables: [
      "Source inventory and agreed migration scope",
      "Field mappings and documented cleanup rules",
      "Import files, ETL scripts or integrations within the agreed scope"
    ],
    technical: "Keys, relationships and data types matter as much as record counts. Documents need separate mapping and access checks.",
    boundary: "Import limits, supported history, file formats and API access depend on your chosen product. Netherwood verifies those limits with the provider before defining the migration scope. Your staff decide how ambiguous business records should be handled.",
    questions: [
      {
        question: "Can you migrate everything from the old system?",
        answer: "That depends on what can be extracted, what the destination accepts and what your business needs to retain. Some history may be better held in a documented, accessible archive. Those decisions belong in the plan before the production migration."
      },
      {
        question: "Are record counts enough to check the result?",
        answer: "No. Equal counts can still hide duplicated customers, broken relationships or incorrect amounts. Validation should also compare agreed business totals, important fields, attachments, exceptions and representative workflows."
      }
    ],
    related: [
      "business-software-migration",
      "legacy-systems-assessment",
      "database-engineering"
    ]
  },
  {
    slug: "legacy-application-modernization",
    title: "Legacy application modernization",
    description: "Review older Access, SQL Server and Windows applications before repairing, replacing or retiring them.",
    headline: "Decide what to keep, repair or replace.",
    intro: "I investigate older applications and the data, reports and business rules they contain. That gives you a basis for deciding their next stage.",
    situation: "When an essential application is hard to maintain",
    situations: [
      "Your Microsoft Access database became mission-critical years ago, and its original author has retired.",
      "An old Windows application or custom SQL Server system has little documentation and limited support.",
      "A spreadsheet now controls jobs, pricing, inventory or reporting for the whole business.",
      "The vendor is discontinuing your software, or you cannot confidently retire its server."
    ],
    approach: [
      {
        title: "Map the dependencies",
        detail: "Inspect screens, reports, databases, jobs and the workflows people rely on."
      },
      {
        title: "Compare the options",
        detail: "Weigh repair, integration and replacement against support, recovery and business needs."
      },
      {
        title: "Plan the transition",
        detail: "Test the agreed changes and define archive access before retiring anything."
      }
    ],
    deliverables: [
      "Application, database and dependency inventory",
      "Documented business rules and critical workflows",
      "Repair, integration or replacement options with tradeoffs"
    ],
    technical: "Access forms and macros, SQL procedures and scheduled jobs can contain business rules that must survive a change.",
    boundary: "Older software is not automatically bad software. The decision depends on its support, recoverability and fit for your business. Proprietary code, unavailable source files or vendor restrictions may limit what can be repaired or extracted.",
    questions: [
      {
        question: "Does Microsoft Access always need to be replaced?",
        answer: "No. A supported, understood Access application may still serve its purpose. The concern is whether your business can maintain it, recover it and use it reliably. An assessment helps distinguish a repair from an Access database replacement project."
      },
      {
        question: "Do we need to build another custom application?",
        answer: "Not necessarily. A supported commercial product may cover the work with less maintenance. Netherwood can evaluate the migration and integration requirements around your chosen replacement; a custom build is not the default recommendation."
      }
    ],
    related: [
      "legacy-systems-assessment",
      "data-migration",
      "workflow-automation"
    ]
  },
  {
    slug: "business-software-migration",
    title: "Business software migration",
    description: "Prepare records for new business software and coordinate import responsibilities with your vendor.",
    headline: "Connect your existing data to your chosen software.",
    intro: "If you have selected a new business platform, I can help prepare its imports and work through data questions with your provider.",
    situation: "When the new platform is chosen but the data is not ready",
    situations: [
      "Your new provider supplied an import template, but nobody owns the extraction or cleanup.",
      "The standard migration includes basic contacts, while you also need history, documents and relationships.",
      "You need someone who can speak with both your staff and the vendor’s technical team.",
      "The replacement is selected, but the production move, downtime and final checks remain unplanned."
    ],
    approach: [
      {
        title: "Confirm the import boundary",
        detail: "Establish supported records, formats, history and responsibilities with the provider."
      },
      {
        title: "Prepare a trial",
        detail: "Map fields, resolve exceptions with your staff and run representative imports."
      },
      {
        title: "Check the working result",
        detail: "Reconcile agreed records and totals, test everyday tasks and document cutover responsibilities."
      }
    ],
    deliverables: [
      "Customer/vendor/Netherwood responsibility map",
      "Source-to-destination field and relationship mappings",
      "Cleaned import files or an agreed API migration process"
    ],
    technical: "The work connects your source data to the destination’s supported imports or APIs.",
    boundary: "Your platform. Your data. Your choice. Netherwood provides professional migration services; you choose and license the destination separately. Vendor import capabilities and the scope of their own implementation service are confirmed for each project.",
    questions: [
      {
        question: "Our software vendor already offers migration. Do we still need help?",
        answer: "Possibly, but not always. First check exactly what is included: extracting the old database, cleaning records, moving attachments, reconciling business totals and retaining unsupported history. Netherwood can take on a defined gap alongside the vendor."
      },
      {
        question: "Can you help before we choose a platform?",
        answer: "Yes. A systems assessment can identify technical requirements and questions for prospective vendors, including how your historical records can be imported and exported. Your business remains in control of the product decision."
      }
    ],
    related: [
      "data-migration",
      "legacy-systems-assessment",
      "workflow-automation"
    ]
  },
  {
    slug: "legacy-systems-assessment",
    title: "Legacy systems & migration assessment",
    description: "An inventory of applications, data and dependencies, with options for the next change.",
    headline: "Understand the system before changing it.",
    intro: "I review an application, its data and its dependencies so you can decide what to repair, integrate, replace or retain.",
    situation: "When the next decision needs better information",
    situations: [
      "Information is scattered across SQL Server, Access, Excel, shared folders and vendor applications.",
      "One employee knows how the old system works, and little of that knowledge is written down.",
      "You are replacing a server but do not know which reports, imports or applications still depend on it.",
      "You need a realistic migration scope before committing to a replacement or a deadline."
    ],
    approach: [
      {
        title: "Establish the scope",
        detail: "Agree the systems, access and decisions the assessment should cover."
      },
      {
        title: "Inspect the evidence",
        detail: "Review dependencies, data quality, recovery arrangements and critical workflows."
      },
      {
        title: "Explain the options",
        detail: "Prioritize findings and document tradeoffs, unknowns and suggested next steps."
      }
    ],
    deliverables: [
      "Current application and database inventory",
      "Data-location and dependency maps",
      "Backup and recovery observations"
    ],
    technical: "The assessment may include database profiling, application dependencies and recovery evidence within the agreed scope.",
    boundary: "An assessment is a defined professional-services engagement, with access, scope, deliverables and fees agreed before work begins. It does not commit you to buying a replacement product or a later migration project. Retention decisions stay with the business and its advisers.",
    questions: [
      {
        question: "What should we prepare before contacting you?",
        answer: "Start with application names if you know them, the change you want to make and any deadline. You can describe the work in everyday language. Do not send passwords, database backups or private business records through the inquiry form."
      },
      {
        question: "How is this different from the readiness tool?",
        answer: "The free readiness tool is a self-check based on your answers. A paid assessment examines an agreed part of the actual environment and produces findings grounded in what can be inspected. The tool helps organize the initial conversation."
      }
    ],
    related: [
      "legacy-application-modernization",
      "business-software-migration",
      "database-engineering"
    ]
  },
  {
    slug: "database-engineering",
    title: "Database engineering",
    description: "SQL Server performance investigations, recovery reviews, upgrades and reporting.",
    headline: "Investigate SQL Server performance and reliability.",
    intro: "I work with execution plans, waits, blocking and workload history to understand database problems. My work also covers recovery reviews, upgrades and reporting.",
    situation: "When a database needs closer investigation",
    situations: [
      "Queries or reports are slow, and the cause is unclear.",
      "You need a SQL Server migration or upgrade with a tested fallback.",
      "Backups run, but recovery readiness or availability arrangements need review.",
      "Your business needs database design, ETL, reliable reporting or scoped DBA support."
    ],
    approach: [
      {
        title: "Capture a baseline",
        detail: "Review symptoms, workload history, plans and relevant operating evidence."
      },
      {
        title: "Investigate the cause",
        detail: "Check queries, indexes, transactions, configuration and recent changes."
      },
      {
        title: "Test and document",
        detail: "Agree a change, compare results and record remaining limits and follow-up work."
      }
    ],
    deliverables: [
      "Findings tied to observable database behavior",
      "Prioritized performance or reliability recommendations",
      "Agreed tuning, repair or database-engineering changes"
    ],
    technical: "SQL Server and Azure SQL, T-SQL, Query Store, execution plans, waits, backup and restore testing.",
    boundary: "Projects and ongoing support have agreed scope, access, responsibilities, hours and fees. Fractional DBA support means a defined portion of experienced database help; it does not imply unlimited support or automatic 24/7 coverage.",
    questions: [
      {
        question: "Can you work with our existing IT provider?",
        answer: "Yes. Netherwood can own an agreed database or migration scope alongside your internal staff, IT company or application vendor. Access, support boundaries and responsibility for changes are clarified before work begins."
      }
    ],
    related: [
      "data-migration",
      "legacy-systems-assessment",
      "legacy-application-modernization"
    ]
  },
  {
    slug: "workflow-automation",
    title: "Workflow automation",
    description: "Connect applications, imports and reports, with error handling and human review where needed.",
    headline: "Connect the systems behind a repeated task.",
    intro: "I help replace repeated data entry, manual exports and fragile reporting steps with a defined integration or workflow.",
    situation: "When people keep moving the same information",
    situations: [
      "A customer or job must be entered into two different systems.",
      "Someone downloads, cleans and uploads the same report every week.",
      "Documents arrive in a shared folder and need to be matched to business records.",
      "Your new cloud application needs to exchange information with an existing database or reporting process."
    ],
    approach: [
      {
        title: "Follow one task",
        detail: "Map its inputs, decisions, exceptions and current manual steps."
      },
      {
        title: "Build the connection",
        detail: "Use supported APIs, scripts or existing tools within your access and licensing limits."
      },
      {
        title: "Test the exceptions",
        detail: "Check retries, errors and review steps, then document ownership and recovery."
      }
    ],
    deliverables: [
      "Current and proposed workflow map",
      "Integration requirements and supported interface review",
      "A scoped import, export, reporting or document workflow"
    ],
    technical: "The tool follows the task: SQL, APIs, scripts or existing Microsoft 365 capabilities where appropriate.",
    boundary: "The right approach depends on the interfaces, permissions and licenses your systems provide. Netherwood does not assume every product can be integrated or automate an unclear process before understanding its exceptions.",
    questions: [
      {
        question: "Do we need AI to automate a workflow?",
        answer: "Often, no. A supported API, a scheduled import or a simple script may be more predictable for a defined task. AI can be considered where interpretation of documents or language adds value and the result can be checked."
      },
      {
        question: "Can automation be part of a migration?",
        answer: "Yes. A migration may need temporary data exchanges during the transition or an ongoing integration afterward. It helps to agree which connections are temporary, which are permanent and who owns each one."
      }
    ],
    related: [
      "business-software-migration",
      "database-engineering",
      "practical-ai"
    ]
  },
  {
    slug: "practical-ai",
    title: "Practical AI",
    description: "Evaluate focused AI uses for extraction, summaries and information retrieval, with human review.",
    headline: "Test AI against a specific business task.",
    intro: "Start with a bounded task, such as extracting fields, summarizing records or finding information. I can help assess where an assistant is useful and where human review is needed.",
    situation: "When you have a task worth testing",
    situations: [
      "Employees spend time searching approved procedures and internal reference documents.",
      "Someone needs to extract common fields from incoming documents and review the result.",
      "Long documents or recurring reports need a first-pass summary for a person to check.",
      "You want to understand which company information an AI tool would be allowed to use."
    ],
    approach: [
      {
        title: "Define the task",
        detail: "Agree the inputs, permitted data and criteria for an acceptable result."
      },
      {
        title: "Run a bounded evaluation",
        detail: "Use representative examples and compare outputs with known answers."
      },
      {
        title: "Review the limits",
        detail: "Document errors, costs and oversight before deciding whether to use the approach."
      }
    ],
    deliverables: [
      "Use-case assessment and success criteria",
      "Data-source and access requirements",
      "A scoped proof of concept where appropriate"
    ],
    technical: "Data quality, access controls and evaluation matter before model or platform choice.",
    boundary: "AI outputs can be incorrect. Sensitive information, provider terms, permissions and review requirements must be considered for the actual use case. The project defines what can run automatically, what a person needs to check and how staff can correct or decline a result.",
    questions: [
      {
        question: "Where should we start if our files and data are disorganized?",
        answer: "Start by understanding and organizing the source information. A systems assessment or a document/data project can identify ownership, duplicates and access requirements before an AI tool is introduced."
      },
      {
        question: "Do you require a particular AI platform?",
        answer: "No. Product choice follows the task, data handling requirements, integration options and budget. Any proof of concept or implementation is separately scoped, including the software or service costs the business would incur."
      }
    ],
    related: [
      "legacy-systems-assessment",
      "workflow-automation",
      "data-migration"
    ]
  }
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
