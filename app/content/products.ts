import { motionRelayDownloads } from "./motion-relay.ts";

const iphoneAvailable = motionRelayDownloads.iphone.available && Boolean(motionRelayDownloads.iphone.url);
const androidAvailable = motionRelayDownloads.android.available && Boolean(motionRelayDownloads.android.url);

const phoneAvailability = iphoneAvailable && androidAvailable
  ? "Phone downloads are available for iPhone and Android."
  : iphoneAvailable
    ? "The iPhone download is available; Android is coming soon."
    : androidAvailable
      ? "The Android download is available; iPhone is coming soon."
      : "Phone access requires a testing invitation.";

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
    "Apps, database tools and data connections from Netherwood Data Partners. Explore Motion Connect, Motion Relay, QueryVault and PageMover.",
};

export const products: Product[] = [
  {
    id: "queryvault",
    slug: "queryvault",
    name: "QueryVault",
    shortName: "QueryVault",
    status: "Active development",
    category: "Database engineering tool",
    summary: "Archive SQL Server Query Store history for longer-term performance investigation.",
    description: [
      "Query Store history can age out as retention and storage limits are reached. QueryVault copies that history into a separate archive for later analysis.",
      "Review the source and test it outside business-critical environments before use."
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
        detail: "Copies Query Store entities into a centralized archive for longer-term performance analysis."
      },
      {
        title: "Retention controls",
        detail: "Tracks archive runs, retention dates and protected runs that should not be removed automatically."
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
    availabilityNote: "Development preview. There is no public repository, release date or download listed at this time.",
    support: "Contact me with questions about the preview."
  },
  {
    id: "garmin-ai-connector",
    slug: "garmin-ai-connector",
    name: "Motion Connect",
    shortName: "Motion Connect",
    status: "Active development",
    category: "Running data companion",
    summary: "Motion Connect is the Garmin data field. Motion Relay is the phone companion that carries available readings to a supported assistant connection.",
    description: [
      "Data and running are two of my interests. While using ChatGPT to get work done during a run, I wanted the conversation to include readings from my Garmin.",
      "That became Motion Connect and Motion Relay. The goal is useful feedback about my run without repeatedly checking the screen."
    ],
    platforms: [
      "Garmin Connect IQ",
      iphoneAvailable ? "iPhone companion" : "iPhone companion coming soon",
      androidAvailable ? "Android companion" : "Android companion coming soon"
    ],
    productUrl: "/products/garmin-ai-connector/",
    openSource: false,
    featured: true,
    featureHeading: "The watch measures. Relay connects. The assistant interprets.",
    downloadExperience: "motion-relay",
    image: {
      src: "/images/motion-relay/motion-connect-watch.webp",
      alt: "Motion Connect watch artwork with a foot and three telemetry streams",
      width: 640,
      height: 640
    },
    features: [
      {
        title: "Motion Connect",
        detail: "The Garmin data field sends available activity readings to the phone companion."
      },
      {
        title: "Motion Relay",
        detail: "The phone companion carries and organizes those readings for sharing you authorize."
      },
      {
        title: "Connected assistant",
        detail: "The assistant interprets the information it receives. Readings depend on the watch, activity and sensors; fresh delivery depends on the connection."
      }
    ],
    availabilityNote: `The Garmin listing is MotionRelay — Beta Preview. ${phoneAvailability} Confirm the supported phone and assistant setup before installing.`,
    privacy: [
      "The current product direction is not to sell personal Garmin, running, health, fitness or activity data and not to use that data for targeted advertising.",
      "Any sharing is intended to be limited to services needed for the application to function. A product-specific notice will be published before release and will describe the implementation, data access, storage, retention and sharing accurately."
    ],
    support: "For help, describe your watch, phone and the problem. Leave out private data and credentials.",
    screenshots: [
      {
        src: "/images/motion-relay/motion-connect-phone-received.webp",
        alt: "Motion Connect data field in the Garmin simulator: Phone received; Cloud not confirmed",
        width: 484,
        height: 686,
        caption: "Garmin simulator state preview. Phone received confirms phone acknowledgement, not AI delivery."
      }
    ]
  }
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
