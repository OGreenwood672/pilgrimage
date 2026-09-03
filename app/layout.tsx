import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bryn Jones | Walking from South Heath to Rome",
  description:
    "Follow Bryn Jones on his 2,050 km charity walk from South Heath in Buckinghamshire to St. Peter's Square in Rome along the historic Via Francigena.",
  keywords: [
    "Bryn Jones",
    "South Heath to Rome",
    "Via Francigena",
    "Charity Walk",
    "Pilgrimage",
    "Buckinghamshire",
  ],
  openGraph: {
    title: "Bryn Jones | Walking from South Heath to Rome",
    description:
      "2,050 kilometres on foot through the UK, France, Switzerland, and Italy in support of life-changing charities.",
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
