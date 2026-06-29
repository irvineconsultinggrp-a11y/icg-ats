"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplicantStats } from "@/app/api/applicants/stats/route";

// --- Icons ---

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CoffeeIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="6" y1="1" x2="6" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="1" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Pipeline & quick-action config ---

const PIPELINE_STAGES = [
  { stage: "Applications",    key: "applications" as const,    href: "/officer/dashboard/applications",   icon: <FileTextIcon />,    color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200" },
  { stage: "Group Interview", key: "groupInterview" as const, href: "/officer/dashboard/group-interview", icon: <UsersIcon />,       color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200" },
  { stage: "Coffee Chats",    key: "coffeeChats" as const,    href: "/officer/dashboard/coffee-chats",    icon: <CoffeeIcon />,      color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200" },
  { stage: "Decisions",       key: "decisions" as const,       href: "/officer/dashboard/decisions",       icon: <CheckSquareIcon />, color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200" },
];

const QUICK_ACTIONS = [
  { label: "Review Applications",    subtitle: "Manage submitted applications",   href: "/officer/dashboard/applications",   icon: <FileTextIcon />,    iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { label: "Manage Group Interview", subtitle: "Assign sessions & score applicants", href: "/officer/dashboard/group-interview", icon: <UsersIcon />,       iconBg: "bg-blue-50",   iconColor: "text-blue-600" },
  { label: "Schedule Coffee Chats",  subtitle: "Coordinate 1-on-1 officer chats",  href: "/officer/dashboard/coffee-chats",    icon: <CoffeeIcon />,      iconBg: "bg-amber-50",  iconColor: "text-amber-600" },
  { label: "Finalize Decisions",     subtitle: "Send acceptance & rejection offers", href: "/officer/dashboard/decisions",       icon: <CheckSquareIcon />, iconBg: "bg-green-50",  iconColor: "text-green-600" },
];

// --- Page ---

function pipelineCounts(stats: ApplicantStats | null) {
  return {
    applications: stats?.total ?? 0,
    groupInterview: stats?.pipeline.groupInterview ?? 0,
    coffeeChats: stats?.pipeline.coffeeChats ?? 0,
    decisions: stats?.pipeline.decisions ?? 0,
  };
}

export default function OfficerDashboardHome() {
  const [stats, setStats] = useState<ApplicantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/applicants/stats", { credentials: "include" });
      const body = (await res.json()) as { data?: ApplicantStats; error?: string };
      if (res.ok && body.data) {
        setStats(body.data);
      } else {
        setStats(null);
        setLoadError(body.error ?? "Failed to load dashboard stats.");
      }
    } catch {
      setStats(null);
      setLoadError("Network error loading dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        void loadStats();
      }
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadStats]);

  const counts = useMemo(() => pipelineCounts(stats), [stats]);

  const pipeline = PIPELINE_STAGES.map((item) => ({
    ...item,
    count: counts[item.key],
  }));

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-8 py-8 max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <div>
          <p className="text-sm text-[#6b7280] font-medium">Fall 2026 Recruitment</p>
          <h1 className="text-2xl font-bold text-[#061c2a] mt-0.5">Officer Dashboard</h1>
          <p className="text-sm text-[#6b7280] mt-1">Welcome back. Here's what's happening across the recruitment pipeline.</p>
        </div>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Pipeline stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {pipeline.map((item) => (
            <Link
              key={item.stage}
              href={item.href}
              className={`group flex flex-col gap-3 bg-white border ${item.border} rounded-xl p-5 hover:shadow-sm transition-all`}
            >
              <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {loading ? "—" : item.count}
                </p>
                <p className="text-sm font-medium text-[#374151] mt-0.5">{item.stage}</p>
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                View all <ArrowRightIcon />
              </span>
            </Link>
          ))}
        </div>

        {/* Pipeline flow */}
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#374151] mb-5">Recruitment Pipeline</h2>
          <div className="flex items-center gap-0">
            {pipeline.map((item, idx) => {
              const total = pipeline[0].count;
              const width = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const prevCount = idx > 0 ? pipeline[idx - 1].count : null;
              const advanceRate = prevCount && prevCount > 0 ? Math.round((item.count / prevCount) * 100) : null;
              return (
                <div key={item.stage} className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-[#6b7280] truncate">{item.stage}</span>
                      <span className={`text-xs font-bold ${item.count > 0 ? item.color : "text-[#a1a1aa]"}`}>
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2.5 bg-[#f4f4f5] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${item.bg.replace("-50", "-400")}`}
                        style={{ width: width > 0 ? `${width}%` : "0%" }}
                      />
                    </div>
                    {advanceRate !== null && (
                      <p className="text-xs text-[#a1a1aa] mt-1">{advanceRate}% advance rate</p>
                    )}
                    {idx > 0 && advanceRate === null && (
                      <p className="text-xs text-[#d4d4d8] mt-1">—</p>
                    )}
                  </div>
                  {idx < pipeline.length - 1 && (
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      <ChevronRightIcon className="text-[#d4d4d8]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="bg-white border border-[#e4e4e7] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#374151]">Upcoming GI Sessions</h2>
              <Link href="/officer/dashboard/group-interview" className="text-xs font-medium text-[#061c2a] hover:underline flex items-center gap-1">
                View all <ArrowRightIcon />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UsersIcon className="text-[#d4d4d8] mb-2" />
              <p className="text-sm text-[#6b7280]">No sessions scheduled yet.</p>
              <Link href="/officer/dashboard/group-interview" className="mt-2 text-xs font-medium text-[#061c2a] hover:underline">
                Set up Group Interview →
              </Link>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-[#e4e4e7] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#374151] mb-4">Recent Activity</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-[#6b7280]">Loading activity…</p>
              </div>
            ) : stats && stats.recent.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {stats.recent.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileTextIcon className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#374151]">
                        <span className="font-semibold text-[#111827]">
                          {item.firstName} {item.lastName}
                        </span>{" "}
                        submitted an application
                      </p>
                      <p className="text-xs text-[#a1a1aa] mt-0.5 flex items-center gap-1">
                        <ClockIcon className="text-[#a1a1aa]" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClockIcon className="text-[#d4d4d8] w-5 h-5 mb-2" />
                <p className="text-sm text-[#6b7280]">No activity yet.</p>
                <p className="text-xs text-[#a1a1aa] mt-1">Actions taken on applicants will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-[#374151] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-4 bg-white border border-[#e4e4e7] rounded-xl px-5 py-4 hover:border-[#061c2a] hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center ${action.iconColor} flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">{action.label}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{action.subtitle}</p>
                </div>
                <ChevronRightIcon className="text-[#d4d4d8] group-hover:text-[#374151] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
