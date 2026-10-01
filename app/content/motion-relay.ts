export const motionRelayDownloads = {
  garmin: { label: "Get the Garmin watch app", available: true, url: "https://apps.garmin.com/apps/48fdea2a-2703-4873-a483-13cae2a9f1ec", storeName: "Garmin Connect IQ Store" },
  iphone: { label: "Download for iPhone", available: false, url: null, storeName: "Apple App Store" },
  android: { label: "Download for Android", available: false, url: null, storeName: "Google Play" },
} as const;

export const motionRelayRoutes = {
  product: "/products/garmin-ai-connector/",
  setup: "/motionrelay/setup/",
  privacy: "/privacy/",
  support: "/#contact",
} as const;
