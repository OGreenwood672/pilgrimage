"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Compass,
  MapPin,
  Mountain,
  Footprints,
  Play,
  Pause,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Sparkles,
} from "lucide-react";
import journeySegmentsData from "../../data/journey-segments.json";

// Dynamically import Leaflet map with SSR disabled
const JourneyMapInner = dynamic(() => import("./JourneyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-stone-400 gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs sm:text-sm font-medium">Loading European Trail Map...</p>
    </div>
  ),
});

export default function JourneySection() {
  const segments = journeySegmentsData;
  const [stageProgress, setStageProgress] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [isPlayingAutoTour, setIsPlayingAutoTour] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const autoTourAnimationRef = useRef<number | null>(null);

  // Scroll listener tracking exact position relative to viewport reading line
  const handleScroll = useCallback(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    // 1. Mobile continuous scroll tracking (smooth, zero-teleport)
    if (isMobile) {
      if (!mobileTrackRef.current) return;
      const rect = mobileTrackRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      // Distance scrolled past top-14 sticky header (56px)
      const currentScrolled = Math.max(0, 56 - rect.top);
      const fraction = Math.max(0, Math.min(1, currentScrolled / totalScrollable));
      const calculatedStage = fraction * (segments.length - 1);

      setStageProgress(calculatedStage);
      setActiveSegmentIndex(Math.min(segments.length - 1, Math.round(calculatedStage)));
      return;
    }

    // 2. Desktop card-intersection scroll tracking (strictly preserved)
    if (!cardsRef.current || cardsRef.current.length === 0) return;

    const targetY = window.innerHeight * 0.45;
    const lastIndex = segments.length - 1;

    const centers: (number | null)[] = cardsRef.current.map((el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height * 0.5;
    });

    let calculatedStage = 0;

    if (centers[0] !== null && centers[0] >= targetY) {
      calculatedStage = 0;
    } else if (centers[lastIndex] !== null && centers[lastIndex] <= targetY) {
      calculatedStage = lastIndex;
    } else {
      for (let i = 0; i < lastIndex; i++) {
        const y1 = centers[i];
        const y2 = centers[i + 1];
        if (y1 !== null && y2 !== null) {
          if (y1 <= targetY && targetY <= y2) {
            const t = (targetY - y1) / (y2 - y1);
            calculatedStage = i + Math.max(0, Math.min(1, t));
            break;
          }
        }
      }
    }

    let closestDist = Infinity;
    let closestIndex = 0;
    centers.forEach((y, idx) => {
      if (y !== null) {
        const dist = Math.abs(y - targetY);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = idx;
        }
      }
    });

    setStageProgress(calculatedStage);
    setActiveSegmentIndex(closestIndex);
  }, [segments.length]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Initial measure

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (autoTourAnimationRef.current) {
        cancelAnimationFrame(autoTourAnimationRef.current);
      }
    };
  }, [handleScroll]);

  // Jump to specific segment smoothly
  const scrollToSegment = useCallback(
    (index: number) => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

      if (isMobile) {
        if (!mobileTrackRef.current) return;
        const rect = mobileTrackRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        const targetOffset = (index / (segments.length - 1)) * totalScrollable;
        const targetScrollY = window.scrollY + rect.top + targetOffset - 56;
        window.scrollTo({
          top: targetScrollY,
          behavior: "smooth",
        });
        return;
      }

      // Desktop
      if (cardsRef.current[index]) {
        cardsRef.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [segments.length],
  );

  // Auto-tour functionality: briskly scroll down through the journey
  const toggleAutoTour = () => {
    if (isPlayingAutoTour) {
      setIsPlayingAutoTour(false);
      if (autoTourAnimationRef.current) {
        cancelAnimationFrame(autoTourAnimationRef.current);
      }
    } else {
      setIsPlayingAutoTour(true);
      const startAutoScroll = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        if (rect.top > 0) {
          window.scrollBy({ top: 20, behavior: "auto" });
          autoTourAnimationRef.current = requestAnimationFrame(startAutoScroll);
        } else if (rect.bottom > window.innerHeight) {
          window.scrollBy({ top: 6.0, behavior: "auto" });
          autoTourAnimationRef.current = requestAnimationFrame(startAutoScroll);
        } else {
          setIsPlayingAutoTour(false);
        }
      };
      autoTourAnimationRef.current = requestAnimationFrame(startAutoScroll);
    }
  };

  // Stop auto-tour on manual wheel or touch interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isPlayingAutoTour) {
        setIsPlayingAutoTour(false);
        if (autoTourAnimationRef.current) {
          cancelAnimationFrame(autoTourAnimationRef.current);
        }
      }
    };

    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [isPlayingAutoTour]);

  const activeSegment = segments[activeSegmentIndex];

  return (
    <section id="journey" className="relative bg-stone-950 text-white">
      {/* Section Introduction Header */}
      <div className="bg-stone-900 border-b border-stone-800 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 text-center relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-400 text-xs sm:text-sm font-semibold mb-3">
            <Compass className="w-4 h-4 text-orange-400" />
            <span>Interactive Route Map</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            The Journey to Rome
          </h2>

          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base lg:text-lg text-stone-300 max-w-2xl mx-auto">
            Scroll down or use the tour controls to walk alongside Bryn. Both the story card and the map animation are visible simultaneously as you travel across Europe.
          </p>

          {/* Quick controls bar */}
          <div className="mt-5 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={toggleAutoTour}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md active:scale-95"
            >
              {isPlayingAutoTour ? (
                <>
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Pause Auto Tour
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" /> Start Auto Tour
                </>
              )}
            </button>

            <button
              onClick={() => scrollToSegment(0)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              Reset to Start
            </button>

            <button
              onClick={() => scrollToSegment(segments.length - 1)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Jump to Rome
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollytelling Container */}
      <div ref={containerRef} className="relative">
        {/* ========================================================= */}
        {/* 1. MOBILE VIEW (< lg): Top Half = Text Card, Lower Half = Map Animation */}
        {/* ========================================================= */}
        <div className="lg:hidden relative">
          {/* Virtual scroll track: ensures smooth mathematical stage interpolation without teleporting */}
          <div
            ref={mobileTrackRef}
            className="relative"
            style={{ height: `${segments.length * 75}vh` }}
          >
            {/* Sticky viewport pinned to screen while scrolling */}
            <div className="sticky top-14 h-[calc(100dvh-3.5rem)] flex flex-col z-20 overflow-hidden bg-stone-950">
              {/* TOP HALF (40% height): Synchronized Fading Story Card */}
              <div className="h-[40%] p-3 xs:p-3.5 sm:p-4 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 flex flex-col justify-between overflow-hidden shadow-md">
                {/* Top Meta & Stepper Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-600 text-white shadow-sm">
                      <Footprints className="w-3 h-3" />
                      Stage {activeSegmentIndex + 1} of {segments.length}
                    </span>
                    {activeSegment?.distance && (
                      <span className="text-[11px] text-stone-400 font-mono">
                        {activeSegment.distance}
                      </span>
                    )}
                  </div>

                  {/* Next / Prev Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollToSegment(Math.max(0, activeSegmentIndex - 1))}
                      disabled={activeSegmentIndex === 0}
                      className="p-1 rounded-md bg-stone-800 text-stone-300 disabled:opacity-25 hover:bg-stone-700 transition-colors"
                      aria-label="Previous Stage"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-stone-400 px-1">
                      {activeSegmentIndex + 1}/{segments.length}
                    </span>
                    <button
                      onClick={() =>
                        scrollToSegment(Math.min(segments.length - 1, activeSegmentIndex + 1))
                      }
                      disabled={activeSegmentIndex === segments.length - 1}
                      className="p-1 rounded-md bg-orange-600 text-white disabled:opacity-25 hover:bg-orange-500 transition-colors shadow-sm"
                      aria-label="Next Stage"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Fading Content Body */}
                <div
                  key={activeSegment?.id}
                  className="animate-stage-fade flex items-start gap-3 my-auto overflow-hidden"
                >
                  {/* Compact Thumbnail Image */}
                  <div className="relative w-24 xs:w-28 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700 shadow-md">
                    <Image
                      src={activeSegment?.image || "/images/segments/segment-1.svg"}
                      alt={activeSegment?.title || "Journey Stage"}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                    {activeSegment?.elevation && (
                      <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-stone-200 text-[9px] font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-white/10">
                        <Mountain className="w-2.5 h-2.5 text-amber-400" />
                        <span>{activeSegment.elevation}</span>
                      </div>
                    )}
                  </div>

                  {/* Text Block */}
                  <div className="flex-1 min-w-0">
                    {activeSegment?.location && (
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-orange-400 uppercase tracking-wider truncate mb-0.5">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">{activeSegment.location}</span>
                      </div>
                    )}

                    <h3 className="text-sm xs:text-base font-bold text-white tracking-tight leading-snug truncate">
                      {activeSegment?.title}
                    </h3>

                    <p className="mt-1 text-stone-300 text-[11px] xs:text-xs leading-relaxed line-clamp-3">
                      {activeSegment?.text}
                    </p>
                  </div>
                </div>

                {/* Bottom Hint */}
                <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-800/80 pt-1.5">
                  <span className="font-mono text-stone-400 truncate">
                    GPS: {activeSegment?.lat.toFixed(3)}, {activeSegment?.lng.toFixed(3)}
                  </span>
                  <span className="text-orange-400/90 flex items-center gap-1">
                    <span>Scroll to advance route</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* LOWER HALF (60% height): Live Interactive Map Animation */}
              <div className="h-[60%] relative bg-stone-900 overflow-hidden">
                <JourneyMapInner
                  stageProgress={stageProgress}
                  activeSegmentIndex={activeSegmentIndex}
                  segments={segments}
                  onMarkerClick={scrollToSegment}
                />
              </div>
            </div>
          </div>

          {/* Final Mile Completion Card on Mobile */}
          <div className="p-4 relative z-20">
            <div className="bg-gradient-to-br from-orange-950/60 to-stone-900 border border-orange-500/40 rounded-2xl p-6 text-center shadow-xl">
              <Sparkles className="w-7 h-7 text-amber-400 mx-auto mb-2" />
              <h4 className="text-lg font-bold text-white">The Pilgrimage Completed</h4>
              <p className="text-xs text-stone-300 mt-1.5">
                From South Heath to Rome: 2,050 kilometres walked, countless lives touched, and crucial support delivered to our partner charities.
              </p>
              <Link
                href="/charities"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md active:scale-95"
              >
                Support Bryn&apos;s Charities
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. DESKTOP VIEW (lg:grid): Story Cards Left, Sticky Map Right */}
        {/* ========================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 min-h-screen">
          {/* Left Column: Narrative Story Cards Scroll Stream */}
          <div className="lg:col-span-5 relative z-10 px-6 lg:px-8 py-24 flex flex-col gap-36">
            {segments.map((segment, index) => {
              const isActive = index === activeSegmentIndex;

              return (
                <div
                  key={segment.id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={`transition-all duration-300 transform ${
                    isActive
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-45 scale-[0.98] translate-y-2"
                  }`}
                >
                  <div
                    className={`bg-stone-900/95 backdrop-blur-md rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden group transition-all duration-300 ${
                      isActive
                        ? "border-2 border-orange-500 shadow-orange-950/40 ring-1 ring-orange-500/30"
                        : "border border-stone-700/80 hover:border-orange-500/40"
                    }`}
                  >
                    {/* Top Segment Meta */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          isActive
                            ? "bg-orange-600 text-white"
                            : "bg-stone-800 text-orange-400 border border-stone-700"
                        }`}
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        Stage {index + 1} of {segments.length}
                      </span>

                      {segment.distance && (
                        <span className="text-xs text-stone-400 font-mono">
                          {segment.distance}
                        </span>
                      )}
                    </div>

                    {/* Segment Image */}
                    <div className="relative w-full h-52 md:h-56 rounded-2xl overflow-hidden bg-stone-800 mb-4 border border-stone-700">
                      <Image
                        src={segment.image}
                        alt={segment.title}
                        fill
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {segment.elevation && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-stone-200 text-xs font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                          <Mountain className="w-3 h-3 text-amber-400" />
                          <span>{segment.elevation}</span>
                        </div>
                      )}
                    </div>

                    {/* Location & Title */}
                    {segment.location && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{segment.location}</span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                      {segment.title}
                    </h3>

                    {/* Segment Description */}
                    <p className="mt-2.5 text-stone-300 text-sm lg:text-base leading-relaxed">
                      {segment.text}
                    </p>

                    {/* Navigation helper footer */}
                    <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-mono">
                        Coordinates: {segment.lat.toFixed(4)}, {segment.lng.toFixed(4)}
                      </span>
                      <button
                        onClick={() => scrollToSegment(index)}
                        className="text-orange-400 hover:text-orange-300 font-medium inline-flex items-center gap-1 active:scale-95"
                      >
                        Center on Map <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Final Mile Card */}
            <div className="bg-gradient-to-br from-orange-950/60 to-stone-900 border border-orange-500/40 rounded-3xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h4 className="text-xl font-bold text-white">The Pilgrimage Completed</h4>
              <p className="text-sm text-stone-300 mt-2">
                From South Heath to Rome: 2,050 kilometres walked, countless lives touched, and crucial support delivered to our partner charities.
              </p>
              <Link
                href="/charities"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md active:scale-95"
              >
                Support Bryn&apos;s Charities
              </Link>
            </div>
          </div>

          {/* Right Column: Sticky Map Component (Full Height on Desktop) */}
          <div className="sticky top-0 h-screen lg:col-span-7 z-20 border-l border-stone-800 shadow-2xl">
            <JourneyMapInner
              stageProgress={stageProgress}
              activeSegmentIndex={activeSegmentIndex}
              segments={segments}
              onMarkerClick={scrollToSegment}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
