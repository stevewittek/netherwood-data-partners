export const motionRelayDownloads = {
  garmin: { label: "Get the Garmin data field", available: true, url: "https://apps.garmin.com/apps/48fdea2a-2703-4873-a483-13cae2a9f1ec", storeName: "Garmin Connect IQ Store" },
  iphone: { label: "Download for iPhone", available: false, url: null, storeName: "Apple App Store", storeHome: "https://apps.apple.com/" },
  android: { label: "Download for Android", available: false, url: null, storeName: "Google Play", storeHome: "https://play.google.com/store/apps" },
} as const;

export const motionRelayRoutes = {
  product: "/products/garmin-ai-connector/",
  betaSignup: "/products/garmin-ai-connector/#beta-signup",
  setup: "/motionrelay/setup/",
  privacy: "/privacy/",
  support: "/#contact",
} as const;
