import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Gig-Insure — Hyperlocal Parametric Insurance for Gig Workers",
  description:
    "Gig-Insure provides automated, zone-level income protection for India's 7.7 million gig delivery workers. Built by Team Overclocked Minds for Guidewire DEVTrails University Hackathon 2026.",
  keywords: [
    "Gig-Insure",
    "parametric insurance",
    "gig workers",
    "income protection",
    "Guidewire",
    "DEVTrails",
    "hackathon",
  ],
  authors: [{ name: "Team Overclocked Minds" }],
  openGraph: {
    title: "Gig-Insure — Hyperlocal Parametric Insurance",
    description:
      "Your income, protected. Automatically. Built for Guidewire DEVTrails 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-navy font-[var(--font-body)]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
