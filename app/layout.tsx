import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://netherwooddatapartners.com"),
  verification: { google: "PCfDpB6puoZJ2YmRBVwP3tqiBWZUKvSqEsuDDESt8Zw" },
  icons: { icon: "/favicon.svg" },
  title: "Small Business Software & Data Support | Netherwood",
  description: "Hands-on help with small business software setup, legacy data migration, system reviews and practical support. Work directly with Steven Wittek in New Jersey.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Small Business Software & Data Support | Netherwood",
    description: "Buying a business or changing software? Get help reviewing the setup, moving your records, fixing problems and supporting staff.",
    url: "/",
    type: "website",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "Netherwood Data Partners — Dependable data systems. Clearer decisions." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Small Business Software & Data Support | Netherwood",
    description: "Buying a business or changing software? Get help reviewing the setup, moving your records, fixing problems and supporting staff.",
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
