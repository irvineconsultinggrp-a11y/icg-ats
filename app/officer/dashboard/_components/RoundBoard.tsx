"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPipelineApplicants,
  patchApplicant,
  rowToRound,
  roundToPatch,
  type OfficerApplicantPatch,
  type PipelineStage,
  type RoundKey,
  type RoundStatus,
} from "@/lib/applicants/stages";
import type { ApplicantStats, RoundStatusCounts } from "@/app/api/applicants/stats/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

type Applicant = ReturnType<typeof rowToRound>;

const PAGE_SIZE = 50;

const STATUS_META: Record<RoundStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-[#f4f4f5]", text: "text-[#6b7280]" },
  scheduled: { label: "Scheduled", bg: "bg-blue-50", text: "text-blue-600" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-600" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-600" },
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={filled ? "text-amber-400" : "text-[#e4e4e7]"} aria-hidden="true">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star`}>
          <Star filled={value !== null && n <= value} />
        </button>
      ))}
      {value !== null && <span className="ml-2 text-xs text-[#6b7280]">{value}/5</span>}
    </div>
  );
}

export function RoundBoard({
  round,
  title,
  subtitle,
  advanceLabel,
  advancePatch,
}: {
  round: RoundKey;
  title: string;
  subtitle: string;
  advanceLabel: string;
  advancePatch: OfficerApplicantPatch;
}) {
  const stage: PipelineStage = round === 1 ? "round-1" : "round-2";
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [counts, setCounts] = useState<RoundStatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const selected = applicants.find((a) => a.id === selectedId) ?? null;

  useEffect(() => {
    setPage(0);
    setSelectedId(null);
  }, [debouncedSearch, activeTab]);

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/applicants/stats", { credentials: "include" });
      const body = (await res.json()) as { data?: ApplicantStats };
      if (res.ok && body.data) setCounts(round === 1 ? body.data.r1ByStatus : body.data.r2ByStatus);
    } catch {
      setCounts(null);
    }
  }, [round]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const result = await fetchPipelineApplicants(stage, {
      search: debouncedSearch,
      ...(round === 1 ? { giStatus: activeTab } : { r2Status: activeTab }),
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    if (result.error) {
      setLoadError(result.error);
      setApplicants([]);
      setTotal(0);
    } else {
      setApplicants((result.data ?? []).map((r) => rowToRound(r, round)));
      setTotal(result.total ?? 0);
    }
    setLoading(false);
  }, [stage, round, debouncedSearch, activeTab, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  async function update(id: string, patch: OfficerApplicantPatch) {
    const previous = applicants;
    setSaveError("");
    const result = await patchApplicant(id, patch);
    if (result.error || !result.data) {
      setApplicants(previous);
      setSaveError(result.error ?? "Failed to save.");
      return;
    }
    setApplicants((prev) => prev.map((a) => (a.id === id ? rowToRound(result.data!, round) : a)));
    void loadCounts();
    // A status change moves the applicant between tabs — reload the filtered view so it
    // drops out of the wrong tab (e.g. rejecting someone while viewing "Pending").
    if (patch.gi_status !== undefined || patch.r2_status !== undefined) {
      if (activeTab !== "all") {
        setSelectedId(null);
        void load();
      }
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-8 py-8 flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[#6b7280] font-medium">Fall 2026 Recruitment</p>
            <h1 className="text-2xl font-bold text-[#061c2a] mt-0.5">{title}</h1>
            <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>
          </div>
          {counts && (
            <div className="flex gap-3">
              {(["total", "pending", "completed", "rejected"] as const).map((k) => (
                <div key={k} className="rounded-lg border border-[#e4e4e7] px-4 py-2 text-center min-w-[68px]">
                  <p className="text-lg font-bold text-[#061c2a]">{counts[k]}</p>
                  <p className="text-[11px] uppercase tracking-wide text-[#a1a1aa]">{k}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key ? "bg-[#061c2a] text-white" : "bg-[#f4f4f5] text-[#6b7280] hover:bg-[#e4e4e7]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants…"
            className="h-9 w-64 border border-[#d4d4d8] rounded-lg px-4 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <TableSkeleton />
            ) : applicants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d4d4d8] py-16 text-center text-sm text-[#a1a1aa]">
                No applicants in this view.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#e4e4e7]">
                <table className="w-full text-left">
                  <thead className="bg-[#fafafa] border-b border-[#e4e4e7]">
                    <tr className="text-xs uppercase tracking-wide text-[#a1a1aa]">
                      <th className="px-5 py-3 font-medium">Applicant</th>
                      <th className="px-5 py-3 font-medium">Year / Major</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Score</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f1f2]">
                    {applicants.map((a) => (
                      <tr key={a.id} className={`hover:bg-[#fafafa] transition-colors ${selectedId === a.id ? "bg-[#f4f4f5]" : ""}`}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#111827]">{a.firstName} {a.lastName}</p>
                          <p className="text-xs text-[#6b7280]">{a.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#374151]">
                          {a.year ? `'${String(a.year).slice(-2)}` : "—"} · {a.major}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex h-6 px-2.5 items-center rounded-full text-xs font-medium ${STATUS_META[a.status].bg} ${STATUS_META[a.status].text}`}>
                            {STATUS_META[a.status].label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {a.score !== null ? <span className="text-sm text-[#374151]">{a.score}/5</span> : <span className="text-xs text-[#a1a1aa] italic">Not scored</span>}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button type="button" onClick={() => setSelectedId(a.id)} className="text-sm font-medium text-[#061c2a] hover:underline">
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && total > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 text-sm text-[#6b7280]">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40 hover:text-[#061c2a]">← Prev</button>
                <span>Page {page + 1} of {pageCount}</span>
                <button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40 hover:text-[#061c2a]">Next →</button>
              </div>
            )}
          </div>

          {selected && (
            <div className="w-[360px] flex-shrink-0 rounded-xl border border-[#e4e4e7] bg-white p-6 flex flex-col gap-5 h-fit sticky top-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-[#111827]">{selected.firstName} {selected.lastName}</p>
                  <p className="text-sm text-[#6b7280]">{selected.email}</p>
                  <p className="text-xs text-[#a1a1aa] mt-1">{selected.major}</p>
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="text-[#a1a1aa] hover:text-[#374151]" aria-label="Close">✕</button>
              </div>

              {saveError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{saveError}</div>}

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-[#374151]">Status</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as RoundStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void update(selected.id, roundToPatch(round, { status: s }))}
                      className={`h-7 px-3 rounded-full text-xs font-medium border transition-all ${
                        selected.status === s ? `${STATUS_META[s].bg} ${STATUS_META[s].text} border-transparent` : "bg-white text-[#6b7280] border-[#e4e4e7] hover:border-[#d1d5db]"
                      }`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-[#374151]">Score</p>
                <StarRating value={selected.score} onChange={(v) => void update(selected.id, roundToPatch(round, { score: v }))} />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-[#374151]">Notes</p>
                <textarea
                  defaultValue={selected.notes}
                  key={selected.id}
                  onBlur={(e) => { if (e.target.value !== selected.notes) void update(selected.id, roundToPatch(round, { notes: e.target.value })); }}
                  rows={6}
                  placeholder="Add notes about this applicant's round…"
                  className="w-full border border-[#e4e4e7] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void update(selected.id, advancePatch)}
                  className="h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] active:scale-[0.98] transition-all"
                >
                  {advanceLabel}
                </button>
                <button
                  type="button"
                  onClick={() => void update(selected.id, roundToPatch(round, { status: "rejected" }))}
                  className="h-11 w-full border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all"
                >
                  Reject Applicant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
