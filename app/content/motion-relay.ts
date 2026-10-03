export const motionRelayDownloads = {
  garmin: { label: "Get the Garmin watch app", available: true, url: "https://apps.garmin.com/apps/48fdea2a-2703-4873-a483-13cae2a9f1ec", storeName: "Garmin Connect IQ Store" },
  iphone: { label: "Download for iPhone", available: false, url: null, storeName: "Apple App Store" },
  android: { label: "Download for Android", available: false, url: "https://play.google.com/store/apps/details?id=com.netherwooddatapartners.motionrelay", storeName: "Google Play", status: "Google Play listing created — public availability pending testing and review." },
} as const;

export const motionRelayRoutes = {
  product: "/products/garmin-ai-connector/",
  setup: "/motionrelay/setup/",
  privacy: "/privacy/motion-relay/",
  deletion: "/privacy/motion-relay/delete/",
  support: "/#contact",
} as const;
