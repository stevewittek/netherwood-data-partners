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
    name: "RunBridge AI",
    shortName: "RunBridge",
    status: "In development",
    category: "Data connector",
    summary:
      "A Garmin, iPhone and ChatGPT-connected data experience being developed to make personal activity data easier to use in conversation.",
    description: [
      "RunBridge AI is being developed as a connection between Garmin activity or watch data, an iPhone-centered experience and ChatGPT-assisted conversation. The aim is to make a person’s own activity information easier to bring into useful questions and follow-up workflows.",
      "The product is not publicly available. Installation steps, supported devices, store links and detailed technical claims will be added only after the implementation and release path have been verified.",
    ],
    platforms: ["iPhone", "Garmin activity data", "ChatGPT (planned)"],
    productUrl: "/products/garmin-ai-connector/",
    openSource: false,
    featured: true,
    featureHeading: "Development direction",
    features: [
      {
        title: "Activity-data connection",
        detail:
          "Bring selected Garmin activity or watch data into an experience designed for useful questions.",
      },
      {
        title: "iPhone-centered use",
        detail:
          "Shape the product around a practical mobile flow rather than a desktop-only integration.",
      },
      {
        title: "ChatGPT-connected experience",
        detail:
          "Explore ChatGPT-connected access while keeping data handling and user control central to the implementation.",
      },
    ],
    availabilityNote:
      "In development. There are no App Store, Garmin Connect IQ, public repository or download links yet.",
    namingNote:
      "RunBridge AI is a working product name and may change before release.",
    privacy: [
      "The current product direction is not to sell personal Garmin, running, health, fitness or activity data and not to use that data for targeted advertising.",
      "Any sharing is intended to be limited to services needed for the application to function. A product-specific notice will be published before release and will describe the implementation, data access, storage, retention and sharing accurately.",
    ],
    support:
      "Until a dedicated support system exists, product questions can be sent to Netherwood Data Partners.",
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
