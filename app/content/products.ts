import { motionRelayRoutes } from "./motion-relay.ts";

export type ProductStatus =
  | "Beta"
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
  headline?: string;
  tagline?: string;
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
  downloadExperience?: "motion-relay";
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
    "Apps, database tools and data connections from Netherwood Data Partners. Explore Motion Relay, QueryVault and PageMover.",
};

export const products: Product[] = [
  {
    id: "queryvault",
    slug: "queryvault",
    name: "QueryVault",
    shortName: "QueryVault",
    status: "Active development",
    category: "Database engineering tool",
    summary: "Preserve selected SQL Server Query Store baselines across retention cleanup and database refreshes, then compare workload performance over time.",
    description: [
      "When a load-test database is refreshed or Query Store history is removed, an important performance baseline can disappear. QueryVault archives selected completed Query Store periods before that happens, preserving evidence for later investigation.",
      "Compare comparable archived windows before and after release cycles, indexing changes, or a quarter-long technical-debt initiative. Runtime statistics, execution plans, logical reads and waits remain available through a stable reporting contract and Grafana dashboards. Validate the source and deployment outside business-critical environments before use."
    ],
    platforms: [
      "SQL Server",
      "SQL Server Agent (optional)",
      "PowerShell"
    ],
    githubUrl: "https://github.com/stevewittek/Databases",
    docsUrl: "https://github.com/stevewittek/Databases/blob/master/README.md",
    productUrl: "/products/queryvault/",
    openSource: false,
    sourceAvailable: true,
    featured: true,
    featureHeading: "What the project covers",
    features: [
      {
        title: "Historical Query Store archive",
        detail: "Captures completed Query Store intervals into a separate SQL Server archive, retaining selected performance baselines beyond the source database's retention window."
      },
      {
        title: "Retention controls",
        detail: "Tracks archive periods and retention, protects important baseline runs, and enables RunID-aware maintenance."
      }
    ],
    availabilityNote: "The source repository is public for review. The current archive workflow targets databases on the same SQL Server instance. No packaged download or supported production release is advertised, and no open-source license has been selected.",
    support: "Contact me about QueryVault or a SQL Server question."
  },
  {
    id: "index-maintenance-visualizer",
    slug: "sql-server-index-maintenance-visualizer",
    name: "PageMover",
    shortName: "PageMover",
    status: "Development preview",
    category: "SQL Server utility",
    summary: "Inspect SQL Server indexes and heaps, review maintenance SQL, and compare measured results.",
    description: [
      "PageMover is a Windows development preview with an interface inspired by the classic disk defragmenter. It makes index statistics and proposed maintenance easier to inspect."
    ],
    platforms: [
      "Windows",
      "SQL Server"
    ],
    productUrl: "/products/sql-server-index-maintenance-visualizer/",
    openSource: false,
    featured: true,
    featureHeading: "Development direction",
    features: [
      {
        title: "Visual fragmentation overview",
        detail: "Inspect index and heap statistics, with optional physical-page views and a synthetic demonstration mode."
      },
      {
        title: "Review before maintenance",
        detail: "Review the SQL plan before enabling maintenance and inspect measured before-and-after results."
      }
    ],
    image: {
      src: "https://raw.githubusercontent.com/stevewittek/Toolkit/main/assets/pagemover-demo.png",
      alt: "Actual PageMover interface showing a synthetic SQL Server index page map",
      width: 1365,
      height: 950
    },
    screenshots: [
      {
        src: "https://raw.githubusercontent.com/stevewittek/Toolkit/main/assets/pagemover-demo.png",
        alt: "PageMover classic defragmenter-style offline demonstration interface",
        width: 1365,
        height: 950,
        caption: "Actual application screenshot with entirely synthetic demonstration data. No live database measurements."
      }
    ],
    availabilityNote: "Development preview. There is no public repository, release date or download listed at this time.",
    support: "Contact me with questions about the preview."
  },
  {
    id: "garmin-ai-connector",
    slug: "garmin-ai-connector",
    name: "Motion Relay",
    shortName: "Motion Relay",
    headline: "Your Garmin metrics. Relayed live.",
    tagline: "Same watch. A whole new view.",
    status: "Beta",
    category: "Live workout metrics",
    summary: "Bring your live Garmin readings right to your phone and Lock Screen. Choose the metrics you want to see and talk with ChatGPT about your workout as it happens.",
    description: [
      "Keep your live metrics in view without the wrist check. Use app Home for a quick glance, explore your readings in Metrics, and choose the information you want within reach.",
      "Personalize your iPhone Lock Screen and Dynamic Island, or keep your workout in view through Android’s ongoing notification. Garmin records the activity while Motion Relay brings the readings to your phone.",
      "Connect your ChatGPT account to ask about your workout in a voice conversation. Account connection and sharing are separate choices you control."
    ],
    platforms: ["Garmin Connect IQ", "iPhone companion", "Android companion"],
    productUrl: "/products/garmin-ai-connector/",
    openSource: false,
    featured: true,
    featureHeading: "Your readings, where you need them.",
    downloadExperience: "motion-relay",
    image: {
      src: "/images/motion-relay/motion-connect-watch.webp",
      alt: "Motion Relay watch artwork with a foot and three telemetry streams",
      width: 640,
      height: 640
    },
    features: [
      {
        title: "Your workout on app Home",
        detail: "See workout time, distance, heart rate and activity-specific readings. Choose the information and order that suit your run, ride or training session."
      },
      {
        title: "iPhone Lock Screen and Dynamic Island",
        detail: "Choose your Lock Screen readings, personalize the Dynamic Island regions, and switch between Compact and Large workout displays."
      },
      {
        title: "Android workout notification",
        detail: "Keep selected readings in an ongoing workout notification. Expand it for more detail, or tap to return to app Home."
      }
    ],
    releaseNotes: [
      { title: "Setup and everyday use", url: motionRelayRoutes.setup },
      { title: "Watch, phone and workout compatibility", url: motionRelayRoutes.compatibility },
      { title: "Updates and known issues", url: motionRelayRoutes.updates }
    ],
    privacy: [
      "The current product direction is not to sell personal Garmin, running, health, fitness or activity data and not to use that data for targeted advertising.",
      "Read the Motion Relay privacy notice for account, workout, optional sharing, storage, retention and deletion information."
    ],
    support: "For help, describe your watch, phone and the problem. Leave out private data and credentials."
  }
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
