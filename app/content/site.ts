export const siteUrl = "https://netherwooddatapartners.com";
export const homeMetadata = {
  title: "Data Migration & Systems Consulting in New Jersey | Netherwood",
  description:
    "Data migration, systems integration, database engineering and reporting for established businesses moving from legacy software to modern platforms.",
};
export const aboutMetadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description:
    "Meet Steven Wittek, the New Jersey database engineer behind Netherwood’s consulting services, software products and practical data tools.",
};
export const intakeMetadata = {
  title: "Talk About Your Data Migration | Netherwood Data Partners",
  description:
    "Tell Netherwood what you are using, what you want to replace and what worries you. An approachable migration inquiry for small and midsize businesses.",
};
export const readinessMetadata = {
  title: "Is Your Business Ready to Replace Its Old Software? | Netherwood",
  description:
    "A free migration readiness self-check for established businesses. Understand data, documents, vendor imports and recovery planning. No email required for results.",
};
export const privacyMetadata = {
  title: "Privacy | Netherwood Data Partners",
  description:
    "How the Netherwood website handles inquiries and how product-specific privacy disclosures will be prepared before software releases.",
};
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Netherwood Data Partners",
  url: `${siteUrl}/`,
  description: homeMetadata.description,
  email: "contact@netherwooddatapartners.com",
  founder: {
    "@type": "Person",
    name: "Steven Wittek",
    url: `${siteUrl}/about/`,
  },
  areaServed: [
    "New Jersey",
    "Union County, NJ",
    "Somerset County, NJ",
    "Middlesex County, NJ",
    "New York City",
    "United States",
  ],
  knowsAbout: [
    "Data migration",
    "Legacy systems modernization",
    "SQL Server",
    "Database engineering",
    "Business systems consulting",
    "Reporting and analytics",
    "APIs",
    "Data connectors",
    "Monitoring and automation",
  ],
};
