"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Heart, Footprints } from "lucide-react";
import siteContent from "../../data/site-content.json";

export default function Navbar() {
  const { navigation } = siteContent;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress =
        totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
      setScrollProgress(currentProgress);
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Scroll Indicator */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 z-50 transition-all duration-75 origin-left"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-stone-900/90 backdrop-blur-md shadow-md text-stone-100 py-3 border-b border-stone-800"
            : "bg-stone-900/40 backdrop-blur-sm text-stone-100 py-4 border-b border-stone-800/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-lg group"
          >
            <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-wide uppercase text-orange-400">
                {navigation.badge}
              </span>
              <span className="block text-sm sm:text-base font-bold leading-none text-white">
                {navigation.route}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              href="/#story"
              className="text-stone-300 hover:text-orange-400 transition-colors"
            >
              {navigation.links.story}
            </Link>
            <Link
              href="/#journey"
              className="text-stone-300 hover:text-orange-400 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-amber-400 inline" />
              {navigation.links.journey}
            </Link>
            {/* Commented out link to charities web page
            <Link
              href="/charities"
              className="text-stone-300 hover:text-orange-400 transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-rose-400 inline" />
              {navigation.links.charities}
            </Link>
            */}
          </nav>

          {/* Call to action button */}
          {/* Commented out link to charities web page
          <div className="flex items-center gap-3">
            <Link
              href="/charities"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-sm hover:shadow transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-white/80" />
              {navigation.ctaButton}
            </Link>
          </div>
          */}
        </div>
      </header>
    </>
  );
}
