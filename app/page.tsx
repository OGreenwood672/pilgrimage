import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import JourneySection from "./components/JourneySection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Navigation & Scroll Progress Indicator */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero / Introduction: Why Bryn Walks & Photo */}
        <HeroSection />

        {/* 2. Charities Teaser Banner (Charities moved to /charities page) */}
        <section className="bg-stone-900 text-stone-100 py-10 border-b border-stone-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-850 via-stone-800 to-orange-950/40 border border-stone-700 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Heart className="w-6 h-6 fill-rose-500/40 text-rose-500" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
                    Dedicated Causes
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Walking in Support of 2 Partner Charities
                  </h2>
                  <p className="text-sm text-stone-300 mt-1 max-w-xl">
                    Every step is dedicated to compassionate hospice care and
                    rapid air ambulance emergency trauma relief. Learn about
                    each cause and how to contribute.
                  </p>
                </div>
              </div>

              <Link
                href="/charities"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md shrink-0 group"
              >
                <span>Explore the Charities</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Scroll-Driven Interactive Map & Journey Story */}
        <JourneySection />
      </main>

      {/* 4. Footer & Wrap-up */}
      <Footer />
    </div>
  );
}
