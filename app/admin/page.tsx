"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Users,
  Mail,
  Compass,
  Heart,
  LogOut,
  ExternalLink,
  Send,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Footprints,
  MapPin,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import journeySegmentsData from "@/data/journey-segments.json";
import fundraisingFallback from "@/data/fundraising.json";

// Dynamically import Leaflet map for SSR compatibility
const JourneyMapInner = dynamic(
  () => import("../components/JourneyMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-stone-900 rounded-2xl flex flex-col items-center justify-center text-stone-400 gap-3 border border-stone-800">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-xs">Loading Trail Map...</p>
      </div>
    ),
  },
);

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

interface Broadcast {
  id: string;
  subject: string;
  recipient_count: number;
  status: string;
  sent_at: string;
}

interface GoFundMeConfig {
  url: string;
  amountRaised: number;
  targetAmount: number;
  donorCount: number;
  currencySymbol: string;
}

interface JourneyStatusConfig {
  currentSegmentIndex: number;
  statusNote: string;
}

type TabType = "subscribers" | "broadcast" | "map" | "gofundme";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Auth & General State
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("subscribers");

  // Subscribers & Broadcasts Data
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  // Email Composer State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Map & Stage Tracker State
  const [journeyStatus, setJourneyStatus] = useState<JourneyStatusConfig>({
    currentSegmentIndex: 0,
    statusNote: "Preparing to set off from Buckinghamshire",
  });
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusSaveSuccess, setStatusSaveSuccess] = useState(false);

  // GoFundMe Settings State
  const [gfmConfig, setGfmConfig] = useState<GoFundMeConfig>({
    url:
      process.env.NEXT_PUBLIC_GOFUNDME_URL ||
      "https://www.gofundme.com/f/bryn-walks-south-heath-to-rome",
    amountRaised: fundraisingFallback.amountRaised,
    targetAmount: fundraisingFallback.targetAmount,
    donorCount: fundraisingFallback.donorCount,
    currencySymbol: fundraisingFallback.currencySymbol,
  });
  const [savingGfm, setSavingGfm] = useState(false);
  const [gfmSaveSuccess, setGfmSaveSuccess] = useState(false);

  // 1. Verify User Session & Admin Authorization
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/admin/login");
          return;
        }

        setCurrentUserEmail(user.email || null);

        // Fetch subscribers and settings to test admin API authorization
        const subRes = await fetch("/api/admin/subscribers");
        if (subRes.status === 403 || subRes.status === 401) {
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        if (subRes.ok) {
          const data = await subRes.json();
          setSubscribers(data.subscribers || []);
          setBroadcasts(data.broadcasts || []);
        }

        // Fetch site settings
        const setRes = await fetch("/api/admin/settings");
        if (setRes.ok) {
          const settings = await setRes.json();
          if (settings.gofundme) {
            setGfmConfig((prev) => ({ ...prev, ...settings.gofundme }));
          }
          if (settings.journey_status) {
            setJourneyStatus((prev) => ({ ...prev, ...settings.journey_status }));
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/admin/login");
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, [router, supabase]);

  // Refresh Subscribers List
  const refreshSubscribers = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error("Error refreshing subscribers:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Export Subscribers to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = "ID,Email,Status,Subscribed Date\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.id}","${s.email}","${s.status}","${new Date(s.created_at).toISOString()}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bryn-subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send Test Email via Resend
  const handleSendTestEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      setBroadcastFeedback({
        type: "error",
        message: "Please write a subject and message first.",
      });
      return;
    }

    setSendingTest(true);
    setBroadcastFeedback(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          isTest: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBroadcastFeedback({
          type: "error",
          message: data.error || "Failed to send test email.",
        });
        return;
      }

      setBroadcastFeedback({
        type: "success",
        message: data.message || `Test email sent to ${currentUserEmail}!`,
      });
    } catch (err) {
      console.error("Test email error:", err);
      setBroadcastFeedback({
        type: "error",
        message: "Network error sending test email.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Send Broadcast to All Subscribers
  const handleSendBroadcast = async () => {
    setShowConfirmModal(false);
    setSendingBroadcast(true);
    setBroadcastFeedback(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          isTest: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBroadcastFeedback({
          type: "error",
          message: data.error || "Failed to send broadcast.",
        });
        return;
      }

      setBroadcastFeedback({
        type: "success",
        message: data.message || `Broadcast successfully delivered to subscribers!`,
      });
      setEmailSubject("");
      setEmailMessage("");
      refreshSubscribers();
    } catch (err) {
      console.error("Broadcast error:", err);
      setBroadcastFeedback({
        type: "error",
        message: "Network error while broadcasting.",
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Save GoFundMe Settings
  const handleSaveGoFundMe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGfm(true);
    setGfmSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "gofundme",
          value: gfmConfig,
        }),
      });

      if (res.ok) {
        setGfmSaveSuccess(true);
        setTimeout(() => setGfmSaveSuccess(false), 3000);
      } else {
        alert("Failed to save GoFundMe settings.");
      }
    } catch (err) {
      console.error("Error saving GoFundMe settings:", err);
    } finally {
      setSavingGfm(false);
    }
  };

  // Save Trail Progress & Status Note
  const handleSaveJourneyStatus = async () => {
    setSavingStatus(true);
    setStatusSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "journey_status",
          value: journeyStatus,
        }),
      });

      if (res.ok) {
        setStatusSaveSuccess(true);
        setTimeout(() => setStatusSaveSuccess(false), 3000);
      } else {
        alert("Failed to save journey status.");
      }
    } catch (err) {
      console.error("Error saving journey status:", err);
    } finally {
      setSavingStatus(false);
    }
  };

  // Filter subscribers based on search query
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Clean embed URL for GoFundMe
  const cleanGfmUrl = (gfmConfig.url || "").trim().replace(/\/$/, "");
  const gfmEmbedUrl = cleanGfmUrl.includes("/widget/large")
    ? cleanGfmUrl
    : `${cleanGfmUrl}/widget/large`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-3 text-stone-400">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-medium">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-stone-900/90 backdrop-blur-md border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Bryn&apos;s Hike Admin
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-500/30">
                  Owner
                </span>
              </div>
              <span className="text-xs text-stone-400 hidden sm:block">
                Buckinghamshire → Rome Management Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUserEmail && (
              <span className="text-xs text-stone-400 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 hidden md:block">
                {currentUserEmail}
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 transition-colors border border-rose-800/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "subscribers"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Subscribers</span>
            <span className="text-[11px] font-mono bg-black/30 px-1.5 py-0.5 rounded-md">
              {subscribers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "broadcast"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Send Progress Email</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "map"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Route Map &amp; Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab("gofundme")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "gofundme"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>GoFundMe &amp; Progress</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SUBSCRIBERS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === "subscribers" && (
          <div className="space-y-6">
            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-sm">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Total Subscribers
                </span>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {subscribers.length}
                </div>
                <span className="text-xs text-stone-500 mt-1 block">
                  Audience following along the route
                </span>
              </div>

              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-sm">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Active Status
                </span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {subscribers.filter((s) => s.status === "active").length}
                </div>
                <span className="text-xs text-stone-500 mt-1 block">
                  Eligible for progress broadcasts
                </span>
              </div>

              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-sm">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Latest Signup
                </span>
                <div className="text-sm font-mono text-white mt-2 truncate">
                  {subscribers[0]
                    ? new Date(subscribers[0].created_at).toLocaleDateString()
                    : "No signups yet"}
                </div>
                <span className="text-xs text-stone-500 mt-1 block">
                  Most recent subscriber addition
                </span>
              </div>
            </div>

            {/* Action Bar: Search & Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subscribers by email..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-700/80 text-white placeholder-stone-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={refreshSubscribers}
                  disabled={dataLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={subscribers.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-colors shadow disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-300">
                  <thead className="bg-stone-950/80 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Subscriber Email</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Subscribed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredSubscribers.length > 0 ? (
                      filteredSubscribers.map((sub, index) => (
                        <tr key={sub.id} className="hover:bg-stone-850/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-stone-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {sub.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-stone-400 font-mono">
                            {new Date(sub.created_at).toLocaleDateString()} at{" "}
                            {new Date(sub.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                          {searchQuery
                            ? "No subscribers match your search filter."
                            : "No subscribers have signed up yet. Subscriptions from the homepage will appear here."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SEND PROGRESS EMAIL (RESEND) */}
        {/* ========================================================================= */}
        {activeTab === "broadcast" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Email Composer */}
              <div className="lg:col-span-6 bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-400" />
                    Compose Trail Update
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Send personal letters and milestones directly to your subscribers via Resend.
                  </p>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Day 14: Just crossed into the Champagne vineyards!"
                    className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={8}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write your update here... Separate paragraphs with a blank line. Tell your supporters how the walk is going, challenges faced, and charities supported."
                    className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans leading-relaxed"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Tip: Separate paragraphs with an empty line. It will format automatically in the preview.
                  </span>
                </div>

                {/* Feedback Alert */}
                {broadcastFeedback && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      broadcastFeedback.type === "success"
                        ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                        : "bg-rose-950/80 border-rose-500/40 text-rose-300"
                    }`}
                  >
                    {broadcastFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{broadcastFeedback.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTest || sendingBroadcast || !emailSubject.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors disabled:opacity-50"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Test...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Send Test Email to Me</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={
                      sendingBroadcast ||
                      sendingTest ||
                      !emailSubject.trim() ||
                      !emailMessage.trim() ||
                      subscribers.length === 0
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white transition-all shadow-md active:scale-98 disabled:opacity-50"
                  >
                    {sendingBroadcast ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Broadcasting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Broadcast to {subscribers.length} Subscribers</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Email Preview */}
              <div className="lg:col-span-6 bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-400" />
                    Live Email Preview
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400">
                    Styled for mobile &amp; desktop inbox
                  </span>
                </div>

                <div className="bg-white text-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-200">
                  {/* Email Header */}
                  <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-center text-white">
                    <span className="inline-block px-3 py-1 rounded-full bg-orange-600/30 border border-orange-500/40 text-orange-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                      The 2,050 km Hike
                    </span>
                    <h4 className="text-lg font-bold">Walking from Buckinghamshire to Rome</h4>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Direct update from Bryn Jones on the trail
                    </p>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 space-y-4">
                    <h5 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                      {emailSubject || "Email Subject Line Preview"}
                    </h5>

                    <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 min-h-[120px]">
                      {emailMessage ? (
                        emailMessage
                          .split("\n\n")
                          .map((para, i) => <p key={i}>{para}</p>)
                      ) : (
                        <p className="text-stone-400 italic">
                          Your message text will appear here formatted as paragraphs...
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-100 text-center">
                      <span className="inline-block px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-semibold shadow">
                        Explore Interactive Route Map
                      </span>
                    </div>
                  </div>

                  {/* Email Footer */}
                  <div className="bg-stone-50 p-4 text-center border-t border-stone-200 text-[10px] text-stone-500">
                    You received this update because you subscribed to follow Bryn Jones&apos;s
                    hike.
                  </div>
                </div>
              </div>
            </div>

            {/* Broadcast History Log */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 shadow-xl">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Recent Broadcast History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Recipients</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {broadcasts.length > 0 ? (
                      broadcasts.map((b) => (
                        <tr key={b.id}>
                          <td className="px-4 py-3 font-medium text-white">{b.subject}</td>
                          <td className="px-4 py-3 font-mono">{b.recipient_count}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-500 font-mono">
                            {new Date(b.sent_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                          No previous broadcasts logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ROUTE MAP & JOURNEY TRACKER */}
        {/* ========================================================================= */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-orange-400" />
                    Interactive European Route Tracker
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Visualise the entire 2,050 km hike from Buckinghamshire to Rome and update your current location checkpoint.
                  </p>
                </div>

                <button
                  onClick={handleSaveJourneyStatus}
                  disabled={savingStatus}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-500 text-white transition-all shadow disabled:opacity-50"
                >
                  {savingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : statusSaveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Status Saved!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save Current Stage</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stage Selector Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Bryn&apos;s Active Stage / Checkpoint
                  </label>
                  <select
                    value={journeyStatus.currentSegmentIndex}
                    onChange={(e) =>
                      setJourneyStatus((prev) => ({
                        ...prev,
                        currentSegmentIndex: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {journeySegmentsData.map((seg, idx) => (
                      <option key={seg.id} value={idx}>
                        Stage {idx + 1}: {seg.title} ({seg.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Live Trail Status Note
                  </label>
                  <input
                    type="text"
                    value={journeyStatus.statusNote}
                    onChange={(e) =>
                      setJourneyStatus((prev) => ({
                        ...prev,
                        statusNote: e.target.value,
                      }))
                    }
                    placeholder="e.g. Currently in Reims, resting boots before the Jura!"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Map Preview Container */}
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl">
                <JourneyMapInner
                  stageProgress={journeyStatus.currentSegmentIndex}
                  activeSegmentIndex={journeyStatus.currentSegmentIndex}
                  segments={journeySegmentsData}
                  onMarkerClick={(idx) =>
                    setJourneyStatus((prev) => ({
                      ...prev,
                      currentSegmentIndex: idx,
                    }))
                  }
                />
              </div>

              {/* Quick stage cards overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {journeySegmentsData.map((seg, idx) => (
                  <button
                    key={seg.id}
                    onClick={() =>
                      setJourneyStatus((prev) => ({
                        ...prev,
                        currentSegmentIndex: idx,
                      }))
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      journeyStatus.currentSegmentIndex === idx
                        ? "bg-orange-950/60 border-orange-500/60 ring-1 ring-orange-500"
                        : "bg-stone-950/80 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-orange-400">Stage {idx + 1}</span>
                      <span className="font-mono text-stone-500">{seg.distance}</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{seg.title}</div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">{seg.location}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GOFUNDME & FUNDRAISING SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "gofundme" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: GoFundMe Link & Stat Configuration Form */}
              <form
                onSubmit={handleSaveGoFundMe}
                className="lg:col-span-6 bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-400" />
                    GoFundMe &amp; Progress Settings
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Update the campaign URL and fundraising numbers displayed across the website.
                  </p>
                </div>

                {/* Campaign URL */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    GoFundMe Campaign URL
                  </label>
                  <input
                    type="url"
                    value={gfmConfig.url}
                    onChange={(e) =>
                      setGfmConfig((prev) => ({ ...prev, url: e.target.value }))
                    }
                    required
                    placeholder="https://www.gofundme.com/f/your-campaign-slug"
                    className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Paste your public GoFundMe campaign link. The website will automatically embed its official responsive widget.
                  </span>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                      Amount Raised (£)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={gfmConfig.amountRaised}
                      onChange={(e) =>
                        setGfmConfig((prev) => ({
                          ...prev,
                          amountRaised: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                      Target Goal (£)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={gfmConfig.targetAmount}
                      onChange={(e) =>
                        setGfmConfig((prev) => ({
                          ...prev,
                          targetAmount: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                      Supporter Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={gfmConfig.donorCount}
                      onChange={(e) =>
                        setGfmConfig((prev) => ({
                          ...prev,
                          donorCount: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* Success alert */}
                {gfmSaveSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>GoFundMe settings saved! Public website updated.</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={savingGfm}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white transition-all shadow-md disabled:opacity-50"
                >
                  {savingGfm ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save GoFundMe Settings</span>
                    </>
                  )}
                </button>
              </form>

              {/* Right Column: Live Widget Embed Preview */}
              <div className="lg:col-span-6 bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-400" />
                    Live Embed Widget Preview
                  </h3>
                  <a
                    href={gfmConfig.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-400 hover:text-orange-300 inline-flex items-center gap-1"
                  >
                    <span>Open GoFundMe</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="w-full bg-stone-950 rounded-2xl p-2 border border-stone-800 overflow-hidden shadow-inner flex flex-col items-center">
                  <iframe
                    title="Live GoFundMe Embed Preview"
                    src={gfmEmbedUrl}
                    className="w-full min-h-[490px] border-0 rounded-xl"
                    scrolling="no"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Broadcast Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">Send Broadcast to Subscribers?</h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              This will immediately send your update titled{" "}
              <strong className="text-white">&ldquo;{emailSubject}&rdquo;</strong> to all{" "}
              <strong className="text-orange-400">{subscribers.length} active subscriber(s)</strong> via
              Resend.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-colors shadow"
              >
                Confirm &amp; Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

