import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://netherwooddatapartners.com"),
  icons: { icon: "/favicon.svg" },
  title: "Netherwood Data Partners | Database Consulting & Engineering",
  description: "Database consulting for SQL Server performance, reliability, migrations, Azure modernization, development, integration, reporting, and ongoing DBA support.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Netherwood Data Partners | Database Consulting & Engineering",
    description: "Practical database consulting and engineering for organizations that depend on reliable data systems.",
    url: "/",
    type: "website",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "Netherwood Data Partners — Dependable data systems. Clearer decisions." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Netherwood Data Partners | Database Consulting & Engineering",
    description: "Practical database consulting and engineering for organizations that depend on reliable data systems.",
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
