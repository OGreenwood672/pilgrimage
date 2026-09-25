"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ExternalLink, ShieldCheck, Users, ArrowRight } from "lucide-react";
import fundraisingFallback from "@/data/fundraising.json";
import siteContent from "@/data/site-content.json";

interface GoFundMeSettings {
  url: string;
  amountRaised?: number;
  targetAmount?: number;
  donorCount?: number;
  currencySymbol?: string;
}

export default function GoFundMeEmbed({ className = "" }: { className?: string }) {
  const { fundraising: content } = siteContent;
  const [settings, setSettings] = useState<GoFundMeSettings>({
    url:
      process.env.NEXT_PUBLIC_GOFUNDME_URL ||
      "https://www.gofundme.com/f/bryn-walks-south-heath-to-rome",
    amountRaised: fundraisingFallback.amountRaised,
    targetAmount: fundraisingFallback.targetAmount,
    donorCount: fundraisingFallback.donorCount,
    currencySymbol: fundraisingFallback.currencySymbol,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.gofundme) {
            setSettings((prev) => ({ ...prev, ...data.gofundme }));
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic GoFundMe settings:", err);
      }
    }
    loadSettings();
  }, []);

  const campaignUrl =
    settings.url ||
    process.env.NEXT_PUBLIC_GOFUNDME_URL ||
    "https://www.gofundme.com/f/bryn-walks-south-heath-to-rome";
  const cleanUrl = campaignUrl.trim().replace(/\/$/, "");
  const embedUrl = cleanUrl.includes("/widget/large")
    ? cleanUrl
    : `${cleanUrl}/widget/large`;

  const currency = settings.currencySymbol || "£";
  const amountRaised = settings.amountRaised ?? fundraisingFallback.amountRaised;
  const targetAmount = settings.targetAmount ?? fundraisingFallback.targetAmount;
  const donorCount = settings.donorCount ?? fundraisingFallback.donorCount;

  const formattedRaised = `${currency}${amountRaised.toLocaleString()}`;
  const formattedTarget = `${currency}${targetAmount.toLocaleString()}`;

  const percent = Math.min(
    100,
    Math.round((amountRaised / Math.max(1, targetAmount)) * 100),
  );

  return (
    <div
      className={`bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-800 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-xs font-semibold tracking-wide mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-500/50 text-rose-500" />
              <span>{content.badge}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Support Bryn&apos;s Hike on GoFundMe
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={campaignUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              <span>Open on GoFundMe</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 2-Column Grid: Left stats & CTAs, Right Embedded GoFundMe widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Progress stats & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight">
                  {formattedRaised}
                </span>
                <span className="text-xs sm:text-base text-stone-400 font-medium">
                  {content.raisedOf}{" "}
                  <strong className="text-stone-200">{formattedTarget}</strong>{" "}
                  {content.target}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full h-3.5 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-stone-400 mt-2">
                  <span className="font-mono font-bold text-orange-400">
                    {percent}% {content.targetReached}
                  </span>
                  <span className="font-mono text-stone-400">
                    {content.goal} {formattedTarget}
                  </span>
                </div>
              </div>
            </div>

            {/* Supporter Badge */}
            <div className="flex items-center gap-3 bg-stone-800/70 border border-stone-700/60 px-4 py-3 rounded-2xl w-fit">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono leading-none">
                  {donorCount.toLocaleString()}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {content.supportersLabel}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={campaignUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 shadow-md hover:shadow-lg transition-all group active:scale-98"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Donate on GoFundMe</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Commented out link to charities web page
              <Link
                href="/charities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-stone-300 bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors"
              >
                <span>Explore Charities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              */}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bryn self-funds all personal travel costs; 100% goes to the causes.</span>
            </div>
          </div>

          {/* Right Column: Embedded GoFundMe Responsive Widget */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-stone-950 rounded-2xl p-2 border border-stone-800 shadow-2xl overflow-hidden flex flex-col items-center">
              <iframe
                title="Bryn Jones GoFundMe Fundraiser"
                src={embedUrl}
                className="w-full min-h-[480px] border-0 rounded-xl"
                scrolling="no"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

