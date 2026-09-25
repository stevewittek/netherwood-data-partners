export const siteUrl = "https://netherwooddatapartners.com";
export const homeMetadata = {
  title: "Small Business Data Migration & Modernization | Netherwood",
  description:
    "Move business data from aging software, databases, Access and spreadsheets into the platform you choose. New Jersey migration consulting, serving US projects.",
};
export const aboutMetadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description:
    "Steven Wittek brings senior database engineering experience to small business data migrations and legacy systems modernization. Based in New Jersey.",
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
