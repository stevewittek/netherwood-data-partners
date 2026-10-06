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
    "Website privacy information and direct links to the Motion Relay privacy notice and membership deletion instructions.",
};
export const motionRelayPrivacyMetadata = {
  title: "Motion Relay Privacy Notice | Netherwood Data Partners",
  description: "How Motion Relay handles current activity data, optional sharing, membership information, retention and user controls.",
};
export const motionRelayDeletionMetadata = {
  title: "Delete Motion Relay Membership | Netherwood Data Partners",
  description: "How to request deletion of a Motion Relay membership and associated data without reinstalling the Android app.",
};
export const motionRelayTermsMetadata = {
  title: "Motion Relay Terms of Service | Netherwood Data Partners",
  description: "Terms for Motion Relay accounts, live fitness-metric relay, assistant connections, subscriptions, safety and third-party services.",
};
export const motionRelaySupportMetadata = {
  title: "Motion Relay Support | Netherwood Data Partners",
  description:
    "Setup help, connection troubleshooting and direct support for the Motion Relay phone apps and Motion Connect Garmin data field.",
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
