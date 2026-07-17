import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({
  variable: "--ff-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloudLens — Developer Intelligence Platform",
  description:
    "Automatically detect, track, and monitor every cloud service across your GitHub repos. Get alerted on unused services, expiring free tiers, and cost spikes.",
  keywords: ["cloud services", "developer tools", "GitHub", "AWS", "infrastructure", "cost optimization"],
  authors: [{ name: "CloudLens" }],
  openGraph: {
    type: "website",
    title: "CloudLens — A Lens Into Every Cloud Service You Use",
    description:
      "Automatically detect, track, and monitor every cloud service across your GitHub repos. Get alerted on unused services, expiring free tiers, and cost spikes.",
    siteName: "CloudLens",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudLens — Developer Intelligence Platform",
    description:
      "Automatically detect, track, and monitor every cloud service across your GitHub repos.",
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
      className={`${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
