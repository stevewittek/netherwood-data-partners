import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://netherwooddatapartners.com"),
  verification: { google: "PCfDpB6puoZJ2YmRBVwP3tqiBWZUKvSqEsuDDESt8Zw" },
  icons: { icon: "/favicon.svg" },
  title: "Database & Business Technology Help | Netherwood",
  description: "SQL Server engineering, fractional DBA support, software transitions, and data migration. Work directly with Steven Wittek in New Jersey.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Database & Business Technology Help | Netherwood",
    description: "Serious database expertise and practical software help for local businesses. Founder-led technology consulting in New Jersey.",
    url: "/",
    type: "website",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "Netherwood Data Partners — Dependable data systems. Clearer decisions." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Database & Business Technology Help | Netherwood",
    description: "Serious database expertise and practical software help for local businesses. Founder-led technology consulting in New Jersey.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
