import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Heart,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Compass,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FundraisingCounter from "../components/FundraisingCounter";
import charitiesData from "../../data/charities.json";
import siteContent from "../../data/site-content.json";

export const metadata: Metadata = {
  title: siteContent.charitiesPage.metaTitle,
  description: siteContent.charitiesPage.metaDescription,
};

interface Charity {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  brynStory: string;
  website: string;
  accentColor?: string;
}

export default function CharitiesPage() {
  const charities: Charity[] = charitiesData;
  const { charitiesPage } = siteContent;

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        {/* Charities Page Hero Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Breadcrumb back to the walk */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-400 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{charitiesPage.backLink}</span>
            </Link>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-rose-400 text-xs sm:text-sm font-semibold mb-4">
              <Heart className="w-4 h-4 fill-rose-500/30 text-rose-500" />
              <span>{charitiesPage.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {charitiesPage.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed">
              {charitiesPage.description}
            </p>
          </div>

          {/* Prominent Money Raised Display */}
          <div className="mb-12">
            <FundraisingCounter showDonateButton={false} />
          </div>
        </div>

        {/* Charities Cards Grid (2 charities) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charities.map((charity, index) => (
              <div
                key={charity.id || index}
                className="bg-stone-900/90 rounded-3xl border border-stone-800 overflow-hidden shadow-xl hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col group"
              >
                {/* Charity Logo Banner */}
                <div className="p-8 bg-stone-900 border-b border-stone-800 flex items-center justify-center relative min-h-[160px]">
                  <div className="relative w-full h-24 max-w-[240px]">
                    <Image
                      src={charity.logo}
                      alt={`${charity.name} Logo`}
                      fill
                      className="object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                    {charity.category}
                  </span>
                </div>

                {/* Charity Card Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                      {charity.name}
                    </h2>

                    <div className="mt-3 text-sm text-stone-300 leading-relaxed">
                      <p>{charity.description}</p>
                    </div>

                    {/* Why Bryn Supports Box */}
                    <div className="mt-5 p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs leading-relaxed text-stone-300">
                      <div className="font-semibold text-orange-400 flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {charitiesPage.whyBrynSupportsLabel}
                      </div>
                      <p className="italic">&ldquo;{charity.brynStory}&rdquo;</p>
                    </div>
                  </div>

                  {/* External Donation / Website Link */}
                  <div className="mt-8 pt-5 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">
                      {charitiesPage.officialWebsiteLabel}
                    </span>
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors group/link"
                    >
                      <span>{charitiesPage.visitAndDonateButton}</span>
                      <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How Donations Work Info Box */}
          <div className="mt-14 p-8 rounded-3xl bg-stone-900 border border-stone-800 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {charitiesPage.guarantee.title}
            </h3>
            <p className="mt-2 text-sm text-stone-300 leading-relaxed">
              {charitiesPage.guarantee.description}
            </p>

            <div className="mt-6 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-400">
                {charitiesPage.guarantee.routePrompt}
              </div>
              <Link
                href="/#journey"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md"
              >
                <Compass className="w-4 h-4" />
                {charitiesPage.guarantee.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
