export type ProductStatus =
  | "Active development"
  | "Development preview"
  | "In development";

export type ProductFeature = {
  title: string;
  detail: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  status: ProductStatus;
  category: string;
  summary: string;
  description: string[];
  image?: { src: string; alt: string; width: number; height: number };
  platforms: string[];
  githubUrl?: string;
  docsUrl?: string;
  downloadUrl?: string;
  productUrl: string;
  openSource: boolean;
  sourceAvailable?: boolean;
  featured: boolean;
  featureHeading: string;
  features: ProductFeature[];
  availabilityNote?: string;
  namingNote?: string;
  setup?: { title: string; notes: string[] };
  privacy?: string[];
  support?: string;
  screenshots?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  }[];
  releaseNotes?: { title: string; url: string }[];
  relatedArticles?: { title: string; url: string }[];
};

export const motionRelayName = "Motion Relay";

export const productsMetadata = {
  title: "Data Products, Apps & Developer Tools | Netherwood",
  description:
    "Database tools, SQL Server utilities and data connectors developed by Netherwood Data Partners alongside its consulting work.",
};

export const products: Product[] = [
  {
    id: "queryvault",
    slug: "queryvault",
    name: "QueryVault",
    shortName: "QueryVault",
    status: "Active development",
    category: "Database engineering tool",
    summary:
      "A SQL Server database project for preserving, organizing and analyzing historical Query Store data.",
    description: [
      "SQL Server Query Store is valuable for investigating regressions and understanding workload behavior, but its history can age out as retention and storage limits are reached. QueryVault explores a practical way to archive that history in a purpose-built database.",
      "The project combines T-SQL, a SQL Server database-project structure, partitioned storage, columnstore compression, retention controls, SQL Server Agent automation and PowerShell deployment helpers. It is an active engineering project and should be reviewed and tested outside business-critical environments before use.",
    ],
    platforms: ["SQL Server", "SQL Server Agent (optional)", "PowerShell"],
    githubUrl: "https://github.com/stevewittek/Databases",
    docsUrl:
      "https://github.com/stevewittek/Databases/blob/master/README.md",
    productUrl: "/products/queryvault/",
    openSource: false,
    sourceAvailable: true,
    featured: true,
    featureHeading: "What the project covers",
    features: [
      {
        title: "Historical Query Store archive",
        detail:
          "Copies Query Store entities into a centralized archive for longer-term performance analysis.",
      },
      {
        title: "Purpose-built storage",
        detail:
          "Uses partitioned tables and clustered columnstore storage for retained performance history.",
      },
      {
        title: "Retention controls",
        detail:
          "Tracks archive runs, retention dates and protected runs that should not be removed automatically.",
      },
      {
        title: "Operational paths",
        detail:
          "Includes SQL Server Agent templates, reporting procedures and assisted deployment options.",
      },
    ],
    availabilityNote:
      "The source repository is public for review. The current archive workflow targets databases on the same SQL Server instance. No packaged download or supported production release is advertised, and no open-source license has been selected.",
    support:
      "Questions about the project or a database engineering engagement can be sent to Netherwood Data Partners.",
  },
  {
    id: "index-maintenance-visualizer",
    slug: "sql-server-index-maintenance-visualizer",
    name: "PageMover",
    shortName: "PageMover",
    status: "Development preview",
    category: "SQL Server utility",
    summary:
      "A local SQL Server index and heap analysis and maintenance utility with a classic Windows defragmenter-inspired interface.",
    description: [
      "PageMover is a Windows developer preview for inspecting SQL Server indexes and heaps, reviewing maintenance SQL, and comparing before-and-after statistics. Its interface takes inspiration from the classic Windows disk defragmenter.",
      "The project is currently a development preview. Public source, documentation and downloads will only be linked here when they are ready and genuinely available.",
    ],
    platforms: ["Windows", "SQL Server"],
    productUrl: "/products/sql-server-index-maintenance-visualizer/",
    openSource: false,
    featured: true,
    featureHeading: "Development direction",
    features: [
      {
        title: "Visual fragmentation overview",
        detail:
          "Inspect index and heap statistics, with optional physical-page views and a synthetic demonstration mode.",
      },
      {
        title: "Review before maintenance",
        detail:
          "Review the SQL plan before enabling maintenance and inspect measured before-and-after results.",
      },
      {
        title: "Local developer preview",
        detail:
          "An unsigned Windows preview intended for lab and development use; public distribution is not advertised.",
      },
    ],
    availabilityNote:
      "Development preview. There is no public repository, release date or download listed at this time.",
    support:
      "Development questions can be routed through the general Netherwood Data Partners contact address.",
  },
  {
    id: "garmin-ai-connector",
    slug: "garmin-ai-connector",
    name: motionRelayName,
    shortName: motionRelayName,
    status: "In development",
    category: "Running data companion",
    summary:
      "An Apple-first running companion in development, bringing selected Garmin watch data into a clear phone view and an optional assistant connection.",
    description: [
      `${motionRelayName} is an Apple-first companion for people who want useful Garmin run information without digging through technical screens. The private iPhone preview puts current run metrics and connection state within easy reach.`,
      "A native Android companion is in development, with physical watch testing and feature parity still ahead. The optional assistant connection is being validated through a private setup flow.",
      "The everyday experience is being shaped around a clear starting point for a run. Developer simulation and diagnostics are reserved for separate team builds and are excluded from public builds.",
    ],
    platforms: ["iPhone preview", "Android parity planned", "Garmin watch data"],
    productUrl: "/products/garmin-ai-connector/",
    openSource: false,
    featured: true,
    featureHeading: "Development direction",
    features: [
      {
        title: "Run information at a glance",
        detail:
          "Put current run metrics and connection state first, with more detail available when it is useful.",
      },
      {
        title: "Garmin connection help",
        detail:
          "Help private testers choose a compatible watch, check its connection and understand when sharing is enabled.",
      },
      {
        title: "Optional assistant connection",
        detail:
          "The private connector handles selected, short-lived run data. Public availability and supported integrations will be documented after verification.",
      },
      {
        title: "Android parity",
        detail:
          "A native Android companion is in development; physical Garmin testing and feature parity remain to be validated.",
      },
    ],
    availabilityNote:
      "Private development. There is no public App Store, Google Play or Garmin Connect IQ listing, download or paid subscription. Consumer accounts and additional integrations are planned, not available services today.",
    setup: {
      title: "Garmin connection and setup",
      notes: [
        "General installation is not available. A private test requires a compatible Garmin watch, a paired phone and the preview companion build.",
        "For an approved test, pair the watch through Garmin Connect, then use the phone companion’s Settings to select the watch and check connection and sharing status. The watch data field must be installed and active before live run data can appear.",
        "If the connection stalls, check the in-app status and that the watch data field is active. Netherwood can help with setup through the business contact below.",
      ],
    },
    privacy: [
      "The current product direction is not to sell personal Garmin, running, health, fitness or activity data and not to use that data for targeted advertising.",
      "Any sharing is intended to be limited to services needed for the application to function. A product-specific notice will be published before release and will describe the implementation, data access, storage, retention and sharing accurately.",
    ],
    support:
      "Questions about private preview setup or future availability can be sent to Netherwood Data Partners. Public setup guidance will follow verified distribution.",
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
