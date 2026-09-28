export const siteUrl = "https://netherwooddatapartners.com";
export const homeMetadata = {
  title: "Database Services & Software Products | Netherwood Data Partners",
  description:
    "Database engineering, software support, integrations and migrations for New Jersey businesses, alongside practical database tools and data connectors by Netherwood.",
};
export const aboutMetadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description:
    "Meet Steven Wittek, the New Jersey database engineer behind Netherwood. Professional services and practical software grounded in database engineering, integrations and automation.",
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
  ],
};
