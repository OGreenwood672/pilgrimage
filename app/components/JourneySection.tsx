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
  Navigation,
  Sparkles,
} from "lucide-react";
import journeySegmentsData from "../../data/journey-segments.json";

// Dynamically import Leaflet map with SSR disabled
const JourneyMapInner = dynamic(() => import("./JourneyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-stone-400 gap-3">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium">
        Loading Interactive European Trail Map...
      </p>
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
  const autoTourAnimationRef = useRef<number | null>(null);

  // Scroll listener tracking exact card positions relative to viewport reading line
  const handleScroll = useCallback(() => {
    if (!cardsRef.current || cardsRef.current.length === 0) return;

    // The vertical line in the viewport where the user naturally reads the cards
    const targetY = window.innerHeight * 0.45;
    const lastIndex = segments.length - 1;

    // Get vertical centers of all cards relative to the viewport
    const cardCenters: (number | null)[] = cardsRef.current.map((el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height * 0.5;
    });

    // Calculate stageProgress (0.0 = Card 0, 1.0 = Card 1, ... 8.0 = Card 8)
    let calculatedStage = 0;

    if (cardCenters[0] !== null && cardCenters[0] >= targetY) {
      // User is at or above Card 0
      calculatedStage = 0;
    } else if (
      cardCenters[lastIndex] !== null &&
      cardCenters[lastIndex] <= targetY
    ) {
      // User is at or past Card 8
      calculatedStage = lastIndex;
    } else {
      // Find the two adjacent cards that bracket targetY
      for (let i = 0; i < lastIndex; i++) {
        const y1 = cardCenters[i];
        const y2 = cardCenters[i + 1];
        if (y1 !== null && y2 !== null) {
          if (y1 <= targetY && targetY <= y2) {
            const t = (targetY - y1) / (y2 - y1);
            calculatedStage = i + Math.max(0, Math.min(1, t));
            break;
          }
        }
      }
    }

    // Determine the single active card (closest center to targetY)
    let closestDist = Infinity;
    let closestIndex = 0;
    cardCenters.forEach((y, idx) => {
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

  // Jump to specific segment
  const scrollToSegment = useCallback((index: number) => {
    if (cardsRef.current[index]) {
      cardsRef.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  // Auto-tour functionality: gently scroll the page down through the journey
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

  // Stop auto-tour on user manual wheel or touch interaction
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
    window.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    });
    return () => {
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [isPlayingAutoTour]);

  return (
    <section id="journey" className="relative bg-stone-950 text-white">
      {/* Section Introduction Header */}
      <div className="bg-stone-900 border-b border-stone-800 py-16 px-4 sm:px-6 lg:px-8 text-center relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-400 text-xs sm:text-sm font-semibold mb-4">
            <Compass className="w-4 h-4 text-orange-400" />
            <span>Synchronized Scroll Route Map</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            The Journey to Rome
          </h2>

          <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto">
            Scroll down to walk alongside Bryn. The route line and walker marker
            on the map precisely match the stage you are reading, tracing every
            step across Europe from South Heath to St. Peter’s Square.
          </p>

          {/* Quick controls bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={toggleAutoTour}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md"
            >
              {isPlayingAutoTour ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Auto Tour
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Auto Tour
                </>
              )}
            </button>

            <button
              onClick={() => scrollToSegment(0)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              Reset to Start (South Heath)
            </button>

            <button
              onClick={() => scrollToSegment(segments.length - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Jump to Rome
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollytelling Container */}
      <div ref={containerRef} className="relative">
        {/* Layout Grid:
            - On Mobile: Map is sticky at top (height: 42vh), cards scroll underneath
            - On Desktop: Split screen (Cards on Left 5 cols, Sticky Map on Right 7 cols)
        */}
        <div className="lg:grid lg:grid-cols-12 min-h-screen">
          {/* Left Column: Narrative Story Cards Scroll Stream */}
          <div className="lg:col-span-5 relative z-10 px-4 sm:px-6 lg:px-8 py-10 lg:py-24 flex flex-col gap-32 sm:gap-44">
            {segments.map((segment, index) => {
              const isActive = index === activeSegmentIndex;

              return (
                <div
                  key={segment.id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={`transition-all duration-500 transform ${
                    isActive
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-40 scale-95 translate-y-4"
                  }`}
                >
                  <div
                    className={`bg-stone-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden group transition-all duration-300 ${
                      isActive
                        ? "border-2 border-orange-500 shadow-orange-950/40"
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
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-800 mb-5 border border-stone-700">
                      <Image
                        src={segment.image}
                        alt={segment.title}
                        fill
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {segment.elevation && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-stone-200 text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                          <Mountain className="w-3 h-3 text-amber-400" />
                          <span>{segment.elevation}</span>
                        </div>
                      )}
                    </div>

                    {/* Location & Title */}
                    {segment.location && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{segment.location}</span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {segment.title}
                    </h3>

                    {/* Segment Description */}
                    <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
                      {segment.text}
                    </p>

                    {/* Navigation helper badge */}
                    <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
                      <span>
                        Coordinates: {segment.lat.toFixed(4)},{" "}
                        {segment.lng.toFixed(4)}
                      </span>
                      <button
                        onClick={() => scrollToSegment(index)}
                        className="text-orange-400 hover:text-orange-300 font-medium inline-flex items-center gap-1"
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
              <h4 className="text-xl font-bold text-white">
                The Pilgrimage Journey Completed
              </h4>
              <p className="text-sm text-stone-300 mt-2">
                From South Heath to Rome: 2,050 kilometres walked, countless
                lives touched, and substantial support delivered to our charity
                partners.
              </p>
              <Link
                href="/charities"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md"
              >
                Support Bryn&apos;s Charities
              </Link>
            </div>
          </div>

          {/* Right Column: Sticky Map Component
              - Mobile: sticky top-14 (height: 42vh)
              - Desktop: sticky top-0 (height: 100vh)
          */}
          <div className="sticky top-14 lg:top-0 h-[45vh] lg:h-screen lg:col-span-7 z-20 order-first lg:order-last border-b lg:border-b-0 lg:border-l border-stone-800 shadow-2xl">
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
