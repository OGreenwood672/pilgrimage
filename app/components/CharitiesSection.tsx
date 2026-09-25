import React from "react";
import Image from "next/image";
import { ExternalLink, Heart, Sparkles } from "lucide-react";
import charitiesData from "../../data/charities.json";
import siteContent from "../../data/site-content.json";

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

export default function CharitiesSection() {
  const charities: Charity[] = charitiesData;
  const { charitiesSection } = siteContent;

  return (
    <section
      id="charities"
      className="py-20 md:py-28 bg-stone-900 text-stone-100 relative overflow-hidden border-b border-stone-800"
    >
      {/* Subtle radial glow in background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-rose-400 text-xs sm:text-sm font-semibold mb-4">
            <Heart className="w-4 h-4 fill-rose-500/30 text-rose-500" />
            <span>{charitiesSection.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {charitiesSection.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed">
            {charitiesSection.description}
          </p>

          {/* TODO Tag */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-stone-400 font-mono bg-stone-800/80 px-3 py-1 rounded-md border border-stone-700/60">
            <span>TODO: Add real charity details</span>
          </div>
        </div>

        {/* Charities Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((charity, index) => (
            <div
              key={charity.id || index}
              className="bg-stone-800/90 rounded-2xl border border-stone-700/80 overflow-hidden shadow-xl hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col group"
            >
              {/* Charity Logo Banner */}
              <div className="p-6 bg-stone-850/80 border-b border-stone-750 flex items-center justify-center relative min-h-[140px] bg-stone-900/40">
                <div className="relative w-full h-24 max-w-[240px]">
                  <Image
                    src={charity.logo}
                    alt={`${charity.name} Logo`}
                    fill
                    className="object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                  {charity.category}
                </span>
              </div>

              {/* Charity Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {charity.name}
                  </h3>

                  <div className="mt-3 text-sm text-stone-300 leading-relaxed">
                    <p>{charity.description}</p>
                  </div>

                  {/* Why Bryn Supports Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-stone-900/60 border border-stone-700/50 text-xs leading-relaxed text-stone-300">
                    <div className="font-semibold text-orange-400 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {charitiesSection.whyBrynSupportsLabel}
                    </div>
                    <p className="italic">&ldquo;{charity.brynStory}&rdquo;</p>
                  </div>
                </div>

                {/* External Link */}
                <div className="mt-6 pt-4 border-t border-stone-700/60 flex items-center justify-between">
                  <span className="text-xs text-stone-300 font-medium">
                    {charitiesSection.learnMoreLabel}
                  </span>
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors group/link"
                  >
                    <span>{charitiesSection.visitWebsiteButton}</span>
                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner callout */}
        <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-stone-850 to-stone-850 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-bold text-white">
              {charitiesSection.callout.title}
            </h4>
            <p className="text-sm text-stone-400 mt-0.5">
              {charitiesSection.callout.description}
            </p>
          </div>
          <a
            href={charities[0]?.website || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white" />
            {charitiesSection.callout.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
