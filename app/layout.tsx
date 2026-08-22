import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://netherwooddatapartners.com"),
  title: "Netherwood Data Partners | Database Engineering & Data Services",
  description: "Database engineering, SQL Server performance, migrations, reliability, reporting, and practical data services.",
  openGraph: {
    title: "Netherwood Data Partners",
    description: "Dependable data systems. Clearer decisions.",
    type: "website",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "Netherwood Data Partners — Dependable data systems. Clearer decisions." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Netherwood Data Partners",
    description: "Dependable data systems. Clearer decisions.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
