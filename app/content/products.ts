import { motionRelayDownloads } from "./motion-relay.ts";

const iphoneAvailable = motionRelayDownloads.iphone.available && Boolean(motionRelayDownloads.iphone.url);
const androidAvailable = motionRelayDownloads.android.available && Boolean(motionRelayDownloads.android.url);
const phoneAvailability = iphoneAvailable && androidAvailable
  ? "The Motion Relay phone companion is available for iPhone and Android."
  : iphoneAvailable
    ? "The Motion Relay iPhone companion is available; Android is coming soon."
    : androidAvailable
      ? "The Motion Relay Android companion is available; iPhone is coming soon."
      : "The iPhone and Android store listings are not public yet, so the complete customer setup cannot be downloaded from the stores today.";

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
    name: "Motion Connect",
    shortName: "Motion Connect",
    status: "Active development",
    category: "Running data companion",
    summary:
      "Motion Connect brings selected live Garmin workout readings to the Motion Relay phone companion for an optional, authorized AI connection.",
    description: [
      "Motion Connect is the friendly screen inside the published MotionRelay Connect IQ data field. It runs within a compatible Garmin activity and sends available live readings to the Motion Relay companion on your phone.",
      "Motion Relay is the separate iPhone or Android companion. With sharing enabled and an authorized connection, it can pass a redacted current snapshot to ChatGPT. The watch download alone does not provide the complete experience.",
      `The Garmin listing is available now. ${phoneAvailability}`,
    ],
    platforms: ["Garmin Connect IQ", iphoneAvailable ? "iPhone companion" : "iPhone companion coming soon", androidAvailable ? "Android companion" : "Android companion coming soon"],
    productUrl: "/products/garmin-ai-connector/",
    openSource: false,
    featured: true,
    featureHeading: "How the connection works",
    downloadExperience: "motion-relay",
    image: { src: "/images/motion-relay/motion-connect-watch.webp", alt: "Motion Connect watch artwork with a foot and three telemetry streams", width: 640, height: 640 },
    features: [
      {
        title: "Motion Connect on the watch",
        detail: "Add the Connect IQ data field to a supported Garmin activity to show connection status and relay available live readings.",
      },
      {
        title: "Motion Relay on the phone",
        detail: "Choose the paired watch, see current values and connection state, and explicitly control sharing from the companion app.",
      },
      {
        title: "Authorized AI connection",
        detail: "When you enable sharing and connect ChatGPT, a redacted current snapshot can be made available to that authorized account.",
      },
      {
        title: "Clear limits",
        detail: "Available readings depend on the watch, activity and sensors. Phone connection and background conditions can affect live delivery.",
      },
    ],
    availabilityNote:
      `The MotionRelay Garmin data field is available in the Connect IQ Store. ${phoneAvailability}`,
    setup: {
      title: "Garmin connection and setup",
      notes: [
        "Pair your compatible Garmin watch with Garmin Connect, install MotionRelay from Connect IQ, then add it as a data field inside a compatible activity. A full-screen, single-field page gives the clearest Motion Connect display.",
        "Install Motion Relay from your phone’s store when its listing is available. Open it, choose your paired Garmin watch, and complete the sharing and account setup.",
        "Start the activity and keep the required phone connection available. “Phone received” means the phone acknowledged the watch packet; it does not confirm delivery to ChatGPT.",
      ],
    },
    privacy: [
      "The current product direction is not to sell personal Garmin, running, health, fitness or activity data and not to use that data for targeted advertising.",
      "Any sharing is intended to be limited to services needed for the application to function. A product-specific notice will be published before release and will describe the implementation, data access, storage, retention and sharing accurately.",
    ],
    support:
      "Setup guidance and support are available from Netherwood Data Partners. Store buttons are enabled only when their real listings are public.",
    screenshots: [
      { src: "/images/motion-relay/motion-connect-connecting.webp", alt: "Garmin simulator preview of the Motion Connect watch data field in its Connecting state", width: 484, height: 686, caption: "Garmin simulator state preview using synthetic transport evidence; not a physical delivery screenshot." },
      { src: "/images/motion-relay/motion-connect-phone-received.webp", alt: "Garmin simulator preview of the Motion Connect watch data field showing Phone received", width: 484, height: 686, caption: "Garmin simulator state preview. Phone received confirms phone acknowledgement, not AI delivery." },
    ],
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
