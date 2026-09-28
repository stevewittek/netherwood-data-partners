import { siteUrl } from './site.ts';

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  status: string;
  category: string;
  summary: string;
  description: string[];
  platforms?: string[];
  features?: string[];
  limitations?: string[];
  image?: { src: string; alt: string; width: number; height: number };
  screenshots?: { src: string; alt: string; caption?: string; width: number; height: number }[];
  githubUrl?: string;
  docsUrl?: string;
  downloadUrl?: string;
  productUrl?: string;
  openSource?: boolean;
  featured?: boolean;
  workingName?: boolean;
  privacy?: string[];
  support?: string;
  releaseNotes?: { version: string; text: string }[];
  relatedArticles?: { title: string; url: string }[];
};

// Stable IDs are independent of names. Edit a slug here to change generated routes.
// Add external links only after checking their destination and public visibility.
export const products: Product[] = [
  {
    id: 'query-history', slug: 'queryvault', name: 'QueryVault', shortName: 'QV',
    status: 'Active development', category: 'Database & developer tools', featured: true,
    summary: 'Keep SQL Server Query Store history available for longer-term performance investigations.',
    description: [
      'QueryVault is a SQL Server database project that copies selected Query Store periods into a centralized archive. Query text, plans, runtime statistics and wait statistics can be retained beyond the source database’s retention window.',
      'The archive supports performance investigations and reporting through a stable reporting interface. It is a database engineering tool, with deployment and operating documentation available in the public source repository.'
    ],
    platforms: ['SQL Server'],
    features: ['Historical Query Store archiving', 'Configurable retention and protected investigation periods', 'Reporting views and operational queries'],
    limitations: ['QueryVault supplements Query Store; it is not a replacement for it or a live monitoring application.', 'Deployment requires appropriate database permissions and a review of storage, retention and source configuration.'],
    githubUrl: 'https://github.com/stevewittek/Databases',
    docsUrl: 'https://github.com/stevewittek/Databases/blob/master/README.md',
    // Public source is verified. No open-source badge until a license is confirmed.
    openSource: false,
    support: 'For questions about the project or help evaluating it for your environment, contact Netherwood Data Partners.'
  },
  {
    id: 'index-maintenance', slug: 'sql-server-index-visualizer', name: 'PageMover', shortName: 'PM',
    status: 'Development preview', category: 'SQL Server index maintenance', featured: true,
    summary: 'Explore SQL Server index fragmentation and maintenance through a classic Windows defragmenter-inspired interface.',
    description: [
      'PageMover is the current application name for the SQL Server Index Defragmenter 95 project. It brings a familiar visual approach to investigating indexes, heaps and physical database pages.',
      'The local utility includes analysis, a synthetic demonstration mode and review of proposed maintenance SQL. Maintenance is a deliberate action that needs the right permissions and an understanding of the database workload.'
    ],
    platforms: ['Windows', 'SQL Server'],
    features: ['Visual index and heap analysis', 'Offline demonstration with synthetic data', 'Maintenance SQL review and before/after results'],
    limitations: ['This is an unsigned developer preview, not a production-certified maintenance release.', 'Analysis and maintenance can consume resources or acquire locks. Evaluate the preview in a suitable development environment.'],
    support: 'Public distribution details will be added when ready. Ask Netherwood about the development preview.'
  },
  {
    id: 'activity-connector', slug: 'activity-data-connector', name: 'RunBridge AI', shortName: 'RB',
    status: 'In development', category: 'Activity data connector', featured: true, workingName: true,
    summary: 'A Garmin and iPhone integration project being developed for an AI-connected activity data experience.',
    description: [
      'RunBridge AI is the working name for a Netherwood Data Partners project intended to make Garmin activity and watch data available through an iPhone companion and an AI-connected experience, including ChatGPT.',
      'The iPhone companion currently has a simulated activity source and a local query interface. Garmin transport and the external AI connection remain work in progress. The project is not available as a public app.'
    ],
    platforms: ['iPhone companion in development', 'Garmin integration planned'],
    limitations: ['The name may change. No public release date or store installation is announced.', 'The planned Garmin and ChatGPT connections should not be treated as available integrations.'],
    privacy: [
      'Activity and device data can be sensitive. Product-specific privacy information will accompany the application before public release, describing the actual collection, storage, sharing, permissions and deletion behavior.',
      'The design direction is to avoid selling activity data or using it for targeted advertising, and to limit sharing to what application functionality needs. These are development principles; the final disclosure must reflect the implemented product.'
    ],
    support: 'Questions about the project can go to the general Netherwood business contact. Installation and store links will be added when available.'
  }
];
export const productsMetadata = {
  title: 'Products & Data Tools | Netherwood Data Partners',
  description: 'Explore QueryVault, the PageMover SQL Server visualizer and a Garmin activity data connector in development. Practical software by Netherwood Data Partners.'
};
export function getProduct(slug: string) { return products.find(product => product.slug === slug); }
export function productPath(product: Product) { return '/products/' + product.slug + '/'; }
export function productMetadata(product: Product) {
  const title = product.name + ' | Netherwood Data Partners';
  const url = siteUrl + productPath(product);
  return {
    title, description: product.summary, alternates: {canonical: url},
    openGraph: {title, description: product.summary, url, type: 'website' as const},
    twitter: {title, description: product.summary}
  };
}
export function productSchema(product: Product) {
  return {
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: product.name, description: product.summary, url: siteUrl + productPath(product),
    about: {
      '@type': 'CreativeWork', name: product.name, description: product.summary,
      creativeWorkStatus: product.status,
      creator: {'@type': 'Organization', name: 'Netherwood Data Partners', '@id': siteUrl + '/#organization'}
    }
  };
}
