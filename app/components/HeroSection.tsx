import React from "react";
import Image from "next/image";
import Link from "next/link";
import FundraisingCounter from "./FundraisingCounter";
import {
  ArrowDown,
  Footprints,
  Mountain,
  Heart,
  Compass,
  ShieldCheck,
} from "lucide-react";

export default function HeroSection() {
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
            <span>The 2,000 km Via Francigena Expedition</span>
          </div>
        </div>

        {/* Main Grid: Left copy, Right photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subheading, Story */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.12]">
              Walking from <span className="text-orange-600">South Heath</span>{" "}
              to <span className="text-amber-600">Rome</span>
            </h1>

            <p className="mt-4 text-xl sm:text-2xl font-medium text-stone-700 tracking-tight">
              Why Bryn Jones is making this journey
            </p>

            <div className="mt-6 space-y-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              <p>
                <strong className="text-stone-900 font-semibold">
                  Bryn Jones
                </strong>{" "}
                is setting out on foot from the quiet beechwoods of South Heath
                in Buckinghamshire on an epic 2,050-kilometre expedition across
                Western Europe to St. Peter’s Square in Rome.
              </p>
              <p>
                Following the historic pilgrim trail of the{" "}
                <em>Via Francigena</em>, this journey is not just a test of
                endurance across English downs, French vineyards, and
                snow-dusted Alpine passes. It is a heartfelt mission to channel
                every stride into meaningful hope—raising vital funds and
                awareness for causes deeply close to his heart.
              </p>
              <p className="text-stone-700 font-medium italic">
                &ldquo;When life challenges us, moving forward one foot at a
                time is how healing and purpose begin. Every mile walked is for
                the people and charities doing extraordinary work every single
                day.&rdquo;
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#journey"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md hover:shadow-lg transition-all text-base"
              >
                <Compass className="w-5 h-5" />
                Follow the Route on the Map
              </a>
              <Link
                href="/charities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-stone-800 bg-stone-200/80 hover:bg-stone-300/80 border border-stone-300 transition-all text-base"
              >
                <Heart className="w-5 h-5 text-rose-600" />
                Explore the Charities
              </Link>
            </div>
          </div>

          {/* Right Column: Photo of Bryn Jones (clearly replaceable) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 group">
              {/* Image element */}
              <Image
                src="/images/bryn-jones.svg"
                alt="Bryn Jones - Walking from South Heath to Rome"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/10 pointer-events-none" />

              {/* Replacement Tag */}
              <div className="absolute top-3 right-3 bg-stone-900/90 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-mono font-medium shadow-sm">
                TODO: Photo
              </div>

              {/* Caption at bottom */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs uppercase tracking-wider font-semibold text-orange-400 mb-0.5">
                  The Walker
                </div>
                <h3 className="text-xl font-bold leading-tight">Bryn Jones</h3>
                <p className="text-xs text-stone-300 mt-1">
                  South Heath, Bucks → Vatican City, Rome
                </p>
              </div>
            </div>

            <p className="mt-2 text-xs text-stone-500 font-mono text-center">
              TODO: Replace with photo of Bryn Jones
            </p>
          </div>
        </div>

        {/* Prominent Money Raised Display */}
        <div className="mt-12">
          <FundraisingCounter />
        </div>

        {/* Stats & Milestones Ribbon */}
        <div className="mt-10 pt-8 border-t border-stone-300/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-orange-600 font-mono">
              2,050 km
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
              Total Distance
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              ~1,273 miles on foot
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              ~2.5M
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
              Estimated Steps
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              From start to Vatican finish
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              4
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
              Countries Crossed
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              UK, France, Switzerland, Italy
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
              2,469 m
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
              Highest Elevation
            </div>
            <div className="text-xs text-stone-600 mt-0.5">
              Great St Bernard Alpine Pass
            </div>
          </div>
        </div>

        {/* Scroll indicator prompt */}
        <div className="mt-12 flex justify-center">
          <a
            href="#journey"
            className="group flex flex-col items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              Scroll down to explore the interactive route
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
