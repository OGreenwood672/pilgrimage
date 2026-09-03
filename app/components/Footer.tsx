import React from "react";
import Link from "next/link";
import { Footprints, Heart, ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 py-16 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-850">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-white text-lg group"
            >
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Footprints className="w-4 h-4" />
              </div>
              <span>South Heath to Rome</span>
            </Link>
            <p className="mt-4 text-sm text-stone-400 max-w-md leading-relaxed">
              Bryn Jones is undertaking a 2,050 km walking expedition across the
              United Kingdom, France, Switzerland, and Italy along the historic
              Via Francigena to raise vital funds for registered healthcare,
              mental wellness, and emergency charities.
            </p>
            <div className="mt-4 text-xs text-stone-300">
              South Heath, Buckinghamshire, UK → St. Peter&apos;s Square,
              Vatican City, Rome
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#story"
                  className="hover:text-orange-400 transition-colors"
                >
                  Why Bryn Walks
                </Link>
              </li>
              <li>
                <Link
                  href="/charities"
                  className="hover:text-orange-400 transition-colors"
                >
                  Supported Charities
                </Link>
              </li>
              <li>
                <Link
                  href="/#journey"
                  className="hover:text-orange-400 transition-colors"
                >
                  Interactive Route Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Take Action */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get Involved
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Direct donations can be made through our charity partners&apos;
              official web platforms.
            </p>
            <Link
              href="/charities"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Support the Charities
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-300">
          <p>
            &copy; {new Date().getFullYear()} Bryn Jones — Walking from South
            Heath to Rome. All rights reserved.
          </p>
          <a
            href="#story"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
