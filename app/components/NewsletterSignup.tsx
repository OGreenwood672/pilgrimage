"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function NewsletterSignup({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setFeedbackMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setFeedbackMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        setStatus("error");
        setFeedbackMessage(data.error || "Unable to subscribe right now. Please try again.");
        return;
      }

      setStatus("success");
      setFeedbackMessage(data.message || "Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      console.error("Subscription error:", err);
      setStatus("error");
      setFeedbackMessage("Network error. Please try again later.");
    }
  };

  return (
    <section className={`relative overflow-hidden py-16 bg-stone-900 border-b border-stone-800 text-stone-100 ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-stone-850 via-stone-800 to-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-700/80 shadow-2xl">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-400 text-xs sm:text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Direct Trail Updates</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Follow Bryn&apos;s Journey in Real Time
            </h2>

            <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
              Sign up with your email to receive direct letters from the road, milestone reports as Bryn crosses the Alps, and photos along the 2,050 km pilgrimage.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  disabled={status === "loading" || status === "success"}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-stone-900/90 border border-stone-700 text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 transition-all shadow-md disabled:opacity-50 shrink-0"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing up...</span>
                  </>
                ) : (
                  <>
                    <span>Stay Updated</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Status alerts */}
            {status === "success" && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs sm:text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            <p className="mt-4 text-[11px] text-stone-500">
              No spam, ever. Only genuine expedition progress. You can unsubscribe at any time with one click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

