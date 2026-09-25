import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import siteContent from "../data/site-content.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteContent.siteMeta.title,
  description: siteContent.siteMeta.description,
  keywords: siteContent.siteMeta.keywords,
  openGraph: {
    title: siteContent.siteMeta.openGraph.title,
    description: siteContent.siteMeta.openGraph.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
