import React from "react";
import Link from "next/link";
import { Heart, TrendingUp, Users, ArrowRight } from "lucide-react";
import fundraisingData from "../../data/fundraising.json";

interface FundraisingCounterProps {
  showDonateButton?: boolean;
  className?: string;
  compact?: boolean;
}

export default function FundraisingCounter({
  showDonateButton = true,
  className = "",
  compact = false,
}: FundraisingCounterProps) {
  const { currencySymbol, amountRaised, targetAmount, donorCount } =
    fundraisingData;

  const percent = Math.min(
    100,
    Math.round((amountRaised / targetAmount) * 100),
  );

  const formattedRaised = `${currencySymbol}${amountRaised.toLocaleString()}`;
  const formattedTarget = `${currencySymbol}${targetAmount.toLocaleString()}`;

  if (compact) {
    return (
      <div
        className={`bg-stone-900/95 backdrop-blur-md rounded-2xl p-5 border border-stone-800 shadow-xl ${className}`}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-rose-500/40 text-rose-500" />
            <span>Fundraising Total</span>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {percent}% of {formattedTarget}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-white font-mono tracking-tight">
            {formattedRaised}
          </span>
          <span className="text-xs text-stone-400">raised so far</span>
        </div>

        <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="text-[11px] text-stone-500 font-mono">
          TODO: Update live total in /data/fundraising.json
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-800 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-xs font-semibold tracking-wide mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-500/50 text-rose-500" />
              <span>Live Campaign Total</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Money Raised for Our 2 Partner Charities
            </h3>
          </div>

          <div className="text-[10px] sm:text-[11px] font-mono text-stone-400 bg-stone-800/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-stone-700/60 self-start md:self-auto">
            TODO: Update in /data/fundraising.json
          </div>
        </div>

        {/* Large Counter Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center mb-4 sm:mb-6">
          <div className="sm:col-span-7">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight">
                {formattedRaised}
              </span>
              <span className="text-xs sm:text-base text-stone-400 font-medium">
                raised of{" "}
                <strong className="text-stone-200">{formattedTarget}</strong>{" "}
                target
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
                  {percent}% Target Reached
                </span>
                <span className="font-mono text-stone-400">
                  Goal: {formattedTarget}
                </span>
              </div>
            </div>
          </div>

          {/* Right side stat badge & CTA */}
          <div className="sm:col-span-5 flex flex-col sm:items-end justify-center gap-3">
            <div className="flex items-center gap-3 bg-stone-800/70 border border-stone-700/60 px-4 py-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono leading-none">
                  {donorCount.toLocaleString()}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Individual Supporters
                </div>
              </div>
            </div>

            {showDonateButton && (
              <Link
                href="/charities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md hover:shadow-lg transition-all"
              >
                <Heart className="w-4 h-4 fill-white/80" />
                <span>Support the Charities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
