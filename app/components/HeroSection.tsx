import React from "react";
import Image from "next/image";
import Link from "next/link";
import GoFundMeEmbed from "./GoFundMeEmbed";
import {
  ArrowDown,
  Footprints,
  Heart,
  Compass,
} from "lucide-react";
import siteContent from "../../data/site-content.json";

const STAT_COLORS = [
  "text-orange-600",
  "text-amber-600",
  "text-emerald-600",
  "text-rose-600",
];

function renderParagraphWithLinks(text: string, instagramUrl?: string) {
  const targetUrl =
    instagramUrl ||
    "https://www.instagram.com/home2rome2028?stkn=MXh5Zmt1d3VrbG8xbw==";

  // Regex to match either markdown link [label](url) or @handle (e.g. @home2rome2028)
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(@[a-zA-Z0-9_.]+)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [label](url)
      elements.push(
        <a
          key={`md-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-500 font-semibold underline underline-offset-2 transition-colors"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // @handle
      const handle = match[3];
      elements.push(
        <a
          key={`handle-${match.index}`}
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-500 font-semibold underline underline-offset-2 transition-colors inline-block"
        >
          {handle}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

export default function HeroSection() {
  const { hero } = siteContent;

  return (
    <section
      id="story"
      className="relative min-h-screen pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col justify-center overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 border-b border-stone-200"
    >
      {/* Subtle topographic contour background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1c1917 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Top Pilgrim Badge */}
        <div className="flex justify-center md:justify-start mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-900 text-xs sm:text-sm font-semibold tracking-wide">
            <Footprints className="w-4 h-4 text-orange-600" />
            <span>{hero.badge}</span>
          </div>
        </div>

        {/* Main Grid: Left copy, Right photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subheading, Story */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.14]">
              {hero.title.prefix}{" "}
              <span className="text-orange-600">{hero.title.origin}</span>{" "}
              {hero.title.connector}{" "}
              <span className="text-amber-600">{hero.title.destination}</span>
            </h1>

            <div className="mt-6 space-y-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {hero.story.paragraphs.map((paragraph, index) => (
                <p key={index}>{renderParagraphWithLinks(paragraph, hero.instagramUrl)}</p>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#journey"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md hover:shadow-lg transition-all text-base"
              >
                <Compass className="w-5 h-5" />
                {hero.buttons.map}
              </a>
              {/* Commented out link to charities web page
              <Link
                href="/charities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-stone-800 bg-stone-200/80 hover:bg-stone-300/80 border border-stone-300 transition-all text-base"
              >
                <Heart className="w-5 h-5 text-rose-600" />
                {hero.buttons.charities}
              </Link>
              */}
            </div>
          </div>

          {/* Right Column: Photo of Bryn Jones (clearly replaceable) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 group">
              {/* Image element */}
              <Image
                src={hero.photo.image}
                alt={hero.photo.alt}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/10 pointer-events-none" />

              {/* Caption at bottom */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs uppercase tracking-wider font-semibold text-orange-400 mb-0.5">
                  {hero.photo.badge}
                </div>
                <h3 className="text-xl font-bold leading-tight">{hero.photo.name}</h3>
                <p className="text-xs text-stone-300 mt-1">
                  {hero.photo.subtitle}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* GoFundMe Official Embed & Live Campaign Progress */}
        <div className="mt-12">
          <GoFundMeEmbed />
        </div>

        {/* Stats & Milestones Ribbon */}
        <div className="mt-10 pt-8 border-t border-stone-300/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {hero.stats.map((stat, index) => {
            const colorClass = STAT_COLORS[index % STAT_COLORS.length];
            return (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm text-center"
              >
                <div className={`text-2xl sm:text-3xl font-black ${colorClass} font-mono`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  {stat.sublabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll indicator prompt */}
        <div className="mt-12 flex justify-center">
          <a
            href="#journey"
            className="group flex flex-col items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              {hero.scrollPrompt}
            </span>
            <div className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center group-hover:border-orange-500 group-hover:text-orange-600 transition-all animate-bounce">
              <ArrowDown className="w-4 h-4" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
