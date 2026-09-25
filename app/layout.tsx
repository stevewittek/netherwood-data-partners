import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";
import { homeMetadata, organizationSchema } from "./content/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://netherwooddatapartners.com"),
  verification: { google: "PCfDpB6puoZJ2YmRBVwP3tqiBWZUKvSqEsuDDESt8Zw" },
  icons: { icon: "/favicon.svg" },
  ...homeMetadata,
  alternates: { canonical: "/" },
  openGraph: {
    ...homeMetadata,
    url: "/",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: "Netherwood Data Partners — Dependable data systems. Clearer decisions.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    ...homeMetadata,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replaceAll(
              "<",
              "\\u003c",
            ),
          }}
        />
        {children}
      </body>
    </html>
  );
}
