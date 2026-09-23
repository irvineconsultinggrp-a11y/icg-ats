"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplicantStats } from "@/app/api/applicants/stats/route";
import { fetchApplicantsList } from "@/lib/applicants/stages";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { ApplicantRow } from "@/lib/types/database";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { SendTransactionalEmailModal } from "@/components/email/SendTransactionalEmailModal";
import { StatusChangeWithEmailDialog } from "@/components/email/StatusChangeWithEmailDialog";
import { APPLICATION_EMAIL_UI } from "@/lib/email/transactional-templates";
import { OFFICER_DETAIL_PANEL_CLASS } from "@/components/layout/DashboardMobileShell";
import { LazyEmailTemplatesModal } from "../_components/LazyEmailTemplatesModal";

// --- Icons ---

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Types ---

type AppStatus = "new" | "reviewing" | "advanced" | "rejected";

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  year: number;
  major: string;
  gpa: string;
  position: string;
  submittedAt: string;
  status: AppStatus;
  notes: string;
};

function rowToApplication(row: ApplicantRow): Application {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    year: row.grad_year ?? 0,
    major: row.majors ?? "—",
    gpa: row.gpa ?? "—",
    position: row.position,
    submittedAt: new Date(row.created_at).toLocaleDateString(),
    status: (row.app_status as AppStatus) || "new",
    notes: row.notes ?? "",
  };
}

// --- Status config ---

const STATUS_CONFIG: Record<AppStatus, { label: string; bg: string; text: string; dot: string }> = {
  new:      { label: "New",       bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  reviewing:{ label: "Reviewing", bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  advanced: { label: "Advanced",  bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  rejected: { label: "Rejected",  bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// --- Detail panel ---

function DetailPanel({
  applicant,
  resumeSignedUrl,
  onClose,
  onUpdate,
  onRejectClick,
  onSendReceivedClick,
  saveError,
  saving,
}: {
  applicant: Application;
  resumeSignedUrl: string | null;
  onClose: () => void;
  onUpdate: (patch: Partial<Application>) => void;
  onRejectClick: () => void;
  onSendReceivedClick: () => void;
  saveError: string;
  saving: boolean;
}) {
  const [notes, setNotes] = useState(applicant.notes);
  const initials = `${applicant.firstName[0]}${applicant.lastName[0]}`;

  useEffect(() => {
    setNotes(applicant.notes);
  }, [applicant.id, applicant.notes]);

  return (
    <div className={OFFICER_DETAIL_PANEL_CLASS}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7]">
        <h3 className="text-base font-semibold text-[#111827]">Application Detail</h3>
        <button type="button" onClick={onClose} className="text-[#a1a1aa] hover:text-[#374151] transition-colors" aria-label="Close">
          <XIcon />
        </button>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-[#111827]">{applicant.firstName} {applicant.lastName}</p>
            <p className="text-sm text-[#6b7280]">{applicant.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Year",      value: `Year ${applicant.year}` },
            { label: "GPA",       value: applicant.gpa },
            { label: "Major",     value: applicant.major },
            { label: "Position",  value: applicant.position },
            { label: "Submitted", value: applicant.submittedAt },
          ].map(({ label, value }) => (
            <div key={label} className={`flex flex-col gap-0.5 bg-[#f9fafb] rounded-lg p-3 ${label === "Submitted" ? "col-span-2" : ""}`}>
              <p className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Status</p>
          <div className="flex flex-wrap gap-2">
            {(["new", "reviewing", "advanced", "rejected"] as AppStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ status: s })}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-all ${
                  applicant.status === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} border-transparent`
                    : "bg-white text-[#6b7280] border-[#e4e4e7] hover:border-[#d1d5db]"
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Officer Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== applicant.notes) {
                onUpdate({ notes });
              }
            }}
            rows={4}
            placeholder="Add notes about this application…"
            disabled={saving}
            className="w-full border border-[#e4e4e7] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none disabled:opacity-60"
          />
          {saveError && (
            <p className="text-xs text-red-600">{saveError}</p>
          )}
          {saving && (
            <p className="text-xs text-[#6b7280]">Saving…</p>
          )}
        </div>

        {resumeSignedUrl && (
          <a
            href={resumeSignedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-10 w-full border border-[#e4e4e7] rounded-lg text-sm font-medium text-[#061c2a] hover:border-[#061c2a] transition-colors"
          >
            View Resume
          </a>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => onUpdate({ status: "advanced" })}
            className="flex items-center justify-center h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] transition-colors"
          >
            Advance to Coffee Chats
          </button>
          <button
            type="button"
            onClick={onSendReceivedClick}
            className="flex items-center justify-center h-10 w-full border border-[#061c2a] text-[#061c2a] text-sm font-medium rounded-lg hover:bg-[#061c2a]/5 transition-colors"
          >
            Send application received email
          </button>
          <button
            type="button"
            onClick={onRejectClick}
            disabled={applicant.status === "rejected"}
            className="flex items-center justify-center h-11 w-full border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            {applicant.status === "rejected" ? "Rejected" : "Reject Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Status tabs ---

const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "new",       label: "New" },
  { key: "reviewing", label: "Reviewing" },
  { key: "advanced",  label: "Advanced" },
  { key: "rejected",  label: "Rejected" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

const PAGE_SIZE = 50;

// --- Main page ---

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [receivedEmailOpen, setReceivedEmailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<ApplicantStats["byStatus"] | null>(null);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeTab]);

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/applicants/stats", { credentials: "include" });
      const body = (await res.json()) as { data?: ApplicantStats };
      if (res.ok && body.data) setStatusCounts(body.data.byStatus);
    } catch {
      setStatusCounts(null);
    }
  }, []);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await fetchApplicantsList({
        search: debouncedSearch,
        appStatus: activeTab,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (result.error) {
        setLoadError(result.error);
        setApplications([]);
        setTotal(0);
        return;
      }
      setApplications((result.data ?? []).map(rowToApplication));
      setTotal(result.total ?? 0);
    } catch {
      setLoadError("Network error loading applications.");
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, page]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (!selectedId) {
      setResumeSignedUrl(null);
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/applicants/${selectedId}/resume`, {
          credentials: "include",
        });
        const body = (await res.json()) as { resumeSignedUrl?: string | null };
        if (res.ok) {
          setResumeSignedUrl(body.resumeSignedUrl ?? null);
        } else {
          setResumeSignedUrl(null);
        }
      } catch {
        setResumeSignedUrl(null);
      }
    })();
  }, [selectedId]);

  async function updateApplication(id: string, patch: Partial<Application>): Promise<boolean> {
    const previous = applications;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    const apiPatch: { app_status?: string; notes?: string } = {};
    if (patch.status !== undefined) apiPatch.app_status = patch.status;
    if (patch.notes !== undefined) apiPatch.notes = patch.notes;
    if (Object.keys(apiPatch).length === 0) return true;

    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch(`/api/applicants/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPatch),
      });
      const body = (await res.json()) as { data?: ApplicantRow; error?: string };
      if (!res.ok || !body.data) {
        setApplications(previous);
        setSaveError(body.error ?? "Failed to save changes.");
        return false;
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? rowToApplication(body.data!) : a)),
      );
      if (patch.status !== undefined) {
        void loadCounts();
        if (activeTab !== "all") {
          setSelectedId(null);
          void loadApplications();
        }
      }
      return true;
    } catch {
      setApplications(previous);
      setSaveError("Network error saving changes.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const counts: Record<StatusTab, number> = useMemo(() => {
    if (statusCounts) {
      return {
        all:
          statusCounts.new +
          statusCounts.reviewing +
          statusCounts.advanced +
          statusCounts.rejected,
        new: statusCounts.new,
        reviewing: statusCounts.reviewing,
        advanced: statusCounts.advanced,
        rejected: statusCounts.rejected,
      };
    }
    return {
      all: total,
      new: applications.filter((a) => a.status === "new").length,
      reviewing: applications.filter((a) => a.status === "reviewing").length,
      advanced: applications.filter((a) => a.status === "advanced").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };
  }, [statusCounts, total, applications]);

  const visible = applications;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 0;
  const canNext = page + 1 < pageCount;

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-0 flex flex-col gap-4 lg:gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
          <span>Recruitment</span>
          <ChevronRightIcon />
          <span className="font-medium text-[#111827]">Applications</span>
        </div>

        {/* Title + actions + stats */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#061c2a]">Applications</h1>
            <p className="text-sm text-[#6b7280] mt-1">Fall 2026 · Junior Associate</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="flex items-center gap-2 h-9 px-3 sm:px-4 border border-[#e4e4e7] bg-white rounded-lg text-sm font-medium text-[#374151] hover:border-[#9ca3af] hover:bg-[#f9fafb] transition-colors"
            >
              <MailIcon />
              Email Templates
            </button>

            {[
              { label: "Total",     value: counts.all,       color: "text-[#111827]" },
              { label: "New",       value: counts.new,       color: "text-violet-600" },
              { label: "Reviewing", value: counts.reviewing, color: "text-amber-600" },
              { label: "Advanced",  value: counts.advanced,  color: "text-green-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center bg-[#f9fafb] border border-[#e4e4e7] rounded-lg px-4 py-2.5 min-w-[72px]">
                <span className={`text-xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-[#a1a1aa] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-1 border-b border-[#e4e4e7] -mb-px overflow-x-auto max-w-full">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 h-10 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#061c2a] text-[#061c2a]"
                    : "border-transparent text-[#6b7280] hover:text-[#374151]"
                }`}
              >
                {tab.label}
                <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-xs font-bold ${
                  activeTab === tab.key ? "bg-[#061c2a] text-white" : "bg-[#f4f4f5] text-[#6b7280]"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-[260px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants…"
              className="h-9 w-full border border-[#d4d4d8] rounded-lg px-4 pr-10 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
        <div
          className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 min-h-0 ${selected ? "max-lg:hidden" : ""}`}
        >
            {loading ? (
              <TableSkeleton rows={10} />
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-red-600 font-medium">{loadError}</p>
              </div>
            ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileTextIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">
                {total === 0 ? "No applications yet" : "No applicants match your filters"}
              </p>
              <p className="text-sm text-[#a1a1aa] mt-1">
                {total === 0
                  ? "Applications will appear here once the recruitment cycle opens."
                  : "Try adjusting your filters or search."}
              </p>
            </div>
          ) : (
            <div className="border border-[#e4e4e7] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] border-b border-[#e4e4e7]">
                  <tr>
                    {["Applicant", "Year / Major", "GPA", "Submitted", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f5]">
                  {visible.map((app) => {
                    const initials   = `${app.firstName[0]}${app.lastName[0]}`;
                    const isSelected = selectedId === app.id;

                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedId(isSelected ? null : app.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#061c2a]/5" : "bg-white hover:bg-[#f9fafb]"}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#111827]">{app.firstName} {app.lastName}</p>
                              <p className="text-xs text-[#6b7280]">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[#374151] font-medium">Year {app.year}</p>
                          <p className="text-xs text-[#6b7280] mt-0.5 max-w-[180px] truncate">{app.major}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-[#374151]">{app.gpa}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-[#6b7280]">{app.submittedAt}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : app.id); }}
                            className="flex items-center gap-1 text-xs font-medium text-[#061c2a] hover:underline"
                          >
                            Review
                            <ChevronRightIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !loadError && total > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-[#6b7280]">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-9 px-4 border border-[#e4e4e7] rounded-lg text-sm font-medium text-[#374151] disabled:opacity-40 hover:border-[#061c2a] transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 px-4 border border-[#e4e4e7] rounded-lg text-sm font-medium text-[#374151] disabled:opacity-40 hover:border-[#061c2a] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <DetailPanel
            applicant={selected}
            resumeSignedUrl={resumeSignedUrl}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => void updateApplication(selected.id, patch)}
            onRejectClick={() => setRejectDialogOpen(true)}
            onSendReceivedClick={() => setReceivedEmailOpen(true)}
            saveError={saveError}
            saving={saving}
          />
        )}
      </div>

      {selected && (
        <>
          <StatusChangeWithEmailDialog
            open={rejectDialogOpen}
            onClose={() => setRejectDialogOpen(false)}
            applicantId={selected.id}
            templateId="app-not-selected"
            actionLabel="Reject application"
            onConfirmStatus={async () => {
              const ok = await updateApplication(selected.id, { status: "rejected" });
              if (!ok) throw new Error("Could not update status.");
            }}
          />
          <SendTransactionalEmailModal
            open={receivedEmailOpen}
            onClose={() => setReceivedEmailOpen(false)}
            applicantId={selected.id}
            templateId="app-received"
            title="Application received"
          />
        </>
      )}

      <LazyEmailTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={APPLICATION_EMAIL_UI}
        title="Application Email Templates"
      />
    </main>
  );
}
