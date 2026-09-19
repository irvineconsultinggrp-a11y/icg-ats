"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPipelineApplicants } from "@/lib/applicants/stages";
import type { ApplicantRow } from "@/lib/types/database";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import {
  LazyEmailTemplatesModal,
  type EmailTemplate,
} from "../_components/LazyEmailTemplatesModal";
import { getDefaultCoffeeChatCalendlyUrl } from "@/lib/calendly";
import { NotesFolder } from "@/components/notes/NotesFolder";
import { NoteSignalSummary } from "@/components/notes/NoteSignalPicker";
import { fetchApplicantNoteSignals } from "@/lib/applicants/notes";
import {
  compareByGreensDesc,
  compareByRedsDesc,
  EMPTY_SIGNAL_COUNTS,
  type NoteSignalCounts,
} from "@/lib/applicants/note-signal";

// --- Icons ---

function CoffeeIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="6" y1="1" x2="6" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="1" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

type RatingSort = "greens_desc" | "reds_desc" | "name_asc";

type ApplicantListRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  year: number;
  major: string;
  gpa: string;
};

type ApplicantSummary = ApplicantListRow & { signalCounts: NoteSignalCounts };

const LIST_FETCH_LIMIT = 3000;

const RATING_SORT_OPTIONS: { value: RatingSort; label: string }[] = [
  { value: "greens_desc", label: "Highest rating (most greens)" },
  { value: "reds_desc", label: "Lowest rating (most reds)" },
  { value: "name_asc", label: "Name (A–Z)" },
];

function rowToApplicantSummary(row: ApplicantRow): ApplicantListRow {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    year: row.grad_year ?? 0,
    major: row.majors ?? "—",
    gpa: row.gpa ?? "—",
  };
}

// --- Email templates ---

const CC_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "cc-invitation",
    name: "Coffee Chat Invite",
    description: "Invite applicant to schedule a chat",
    subject: "ICG Coffee Chat Invitation – [Date]",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>Congratulations on your performance at the <strong>ICG Group Interview</strong>! We were truly impressed and would like to invite you to a <strong>coffee chat</strong> with one of our officers as the next step in the recruitment process.</p>
<p><strong>Coffee Chat Details</strong></p>
<p><strong>Format:</strong> 1-on-1 informal conversation (~30 minutes)<br><strong>Date &amp; Time:</strong> [Date and Time]<br><strong>Location / Platform:</strong> [Zoom Link or In-Person Location]</p>
<p>This is a wonderful opportunity for us to get to know you better and for you to ask any questions about life at <strong>ICG</strong>.</p>
<p>Please reply to confirm your availability. If the proposed time doesn't work, don't hesitate to let us know and we'll find a time that suits you.</p>
<p>We look forward to connecting with you!</p>
<p>Warm regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

Congratulations on your performance at the ICG Group Interview! We were truly impressed and would like to invite you to a coffee chat with one of our officers as the next step in the recruitment process.

Coffee Chat Details
Format: 1-on-1 informal conversation (~30 minutes)
Date & Time: [Date and Time]
Location / Platform: [Zoom Link or In-Person Location]

This is a wonderful opportunity for us to get to know you better and for you to ask any questions about life at ICG.

Please reply to confirm your availability. If the proposed time doesn't work, don't hesitate to let us know and we'll find a time that suits you.

We look forward to connecting with you!

Warm regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
  {
    id: "cc-reminder",
    name: "Chat Reminder",
    description: "Day-before reminder",
    subject: "Reminder: ICG Coffee Chat Tomorrow – [Time]",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>Just a friendly reminder that your <strong>ICG Coffee Chat</strong> is scheduled for <strong>tomorrow</strong>.</p>
<p><strong>Date:</strong> [Date]<br><strong>Time:</strong> [Time]<br><strong>Location / Platform:</strong> [Zoom Link or In-Person Location]<br><strong>Your Officer:</strong> [Officer Name]</p>
<p>There's nothing to prepare — just come ready for a relaxed conversation! Feel free to bring any questions you have about ICG, consulting, or the team.</p>
<p>If anything comes up, please reply to this email as soon as possible.</p>
<p>See you tomorrow!</p>
<p>Best regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

Just a friendly reminder that your ICG Coffee Chat is scheduled for tomorrow.

Date: [Date]
Time: [Time]
Location / Platform: [Zoom Link or In-Person Location]
Your Officer: [Officer Name]

There's nothing to prepare — just come ready for a relaxed conversation! Feel free to bring any questions you have about ICG, consulting, or the team.

If anything comes up, please reply to this email as soon as possible.

See you tomorrow!

Best regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
];

// --- Detail panel ---

function DetailPanel({
  applicant,
  onClose,
  onRatingChange,
}: {
  applicant: ApplicantSummary;
  onClose: () => void;
  onRatingChange: () => void;
}) {
  const initials = `${applicant.firstName[0]}${applicant.lastName[0]}`;

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#e4e4e7] bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7]">
        <h3 className="text-base font-semibold text-[#111827]">Applicant Detail</h3>
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
            { label: "Year",  value: `Year ${applicant.year}` },
            { label: "GPA",   value: applicant.gpa },
            { label: "Major", value: applicant.major },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 bg-[#f9fafb] rounded-lg p-3">
              <p className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        <NotesFolder
          applicantId={applicant.id}
          applicantName={`${applicant.firstName} ${applicant.lastName}`}
          newNotePreset="coffee-chat"
          onRatingChange={onRatingChange}
          hint="Pick green, yellow, or red on your note. Everyone can read all notes; you only edit your own."
        />
      </div>
    </div>
  );
}

const PAGE_SIZE = 50;

// --- Main page ---

export default function CoffeeChatsPage() {
  const [applicants, setApplicants] = useState<ApplicantListRow[]>([]);
  const [applicantTotal, setApplicantTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [ratingSort, setRatingSort] = useState<RatingSort>("greens_desc");
  const [signalByApplicant, setSignalByApplicant] = useState<Record<string, NoteSignalCounts>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const calendlyUrl = getDefaultCoffeeChatCalendlyUrl();

  const selected = applicants.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    setPage(0);
    setSelectedId(null);
  }, [debouncedSearch, ratingSort]);

  const refreshSignals = useCallback(async () => {
    const sigRes = await fetchApplicantNoteSignals();
    if (sigRes.data) setSignalByApplicant(sigRes.data);
  }, []);

  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setApplicants([]);
    const [result, sigRes] = await Promise.all([
      fetchPipelineApplicants("coffee-chats", {
        search: debouncedSearch,
        limit: LIST_FETCH_LIMIT,
        offset: 0,
      }),
      fetchApplicantNoteSignals(),
    ]);
    if (result.error) {
      setLoadError(result.error);
      setApplicants([]);
      setTotal(0);
    } else {
      const rows = (result.data ?? []).map(rowToApplicantSummary);
      setApplicants(rows);
      setTotal(result.total ?? rows.length);
      setApplicantTotal(result.total ?? rows.length);
    }
    if (sigRes.data) setSignalByApplicant(sigRes.data);
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    void loadApplicants();
  }, [loadApplicants]);

  const sortedApplicants = useMemo(() => {
    const withCounts: ApplicantSummary[] = applicants.map((a) => ({
      ...a,
      signalCounts: signalByApplicant[a.id] ?? EMPTY_SIGNAL_COUNTS,
    }));
    return [...withCounts].sort((a, b) => {
      if (ratingSort === "greens_desc") return compareByGreensDesc(a, b);
      if (ratingSort === "reds_desc") return compareByRedsDesc(a, b);
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
  }, [applicants, signalByApplicant, ratingSort]);

  const visible = useMemo(
    () => sortedApplicants.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [sortedApplicants, page],
  );

  const pageCount = Math.max(1, Math.ceil(sortedApplicants.length / PAGE_SIZE));
  const canPrev = page > 0;
  const canNext = page + 1 < pageCount;

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="px-8 pt-8 pb-0 flex flex-col gap-6">
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
          <span>Recruitment</span>
          <ChevronRightIcon />
          <span className="font-medium text-[#111827]">Coffee Chats</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#061c2a]">Coffee Chats</h1>
            <p className="text-sm text-[#6b7280] mt-1">Fall 2026 · Junior Associate</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="group flex items-center gap-2 h-9 px-4 border border-[#e4e4e7] bg-white rounded-lg text-sm font-medium text-[#374151] hover:border-[#061c2a] hover:bg-[#f9fafb] hover:text-[#061c2a] active:scale-[0.98] transition-all"
            >
              <MailIcon className="group-hover:scale-110 transition-transform" />
              Email Templates
            </button>

            <div className="flex flex-col items-center bg-[#f9fafb] border border-[#e4e4e7] rounded-lg px-4 py-2.5 min-w-[72px]">
              <span className="text-xl font-bold text-[#111827]">{applicantTotal}</span>
              <span className="text-xs text-[#a1a1aa] font-medium">Applicants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Scheduling via Calendly</p>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Applicants book through Calendly. Use the notes panel when reviewing each chat.
            </p>
          </div>
          {calendlyUrl ? (
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-4 bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] transition-colors flex-shrink-0"
            >
              Open Calendly
            </a>
          ) : (
            <span className="text-xs text-[#a1a1aa] italic flex-shrink-0">
              Add NEXT_PUBLIC_COFFEE_CHAT_CALENDLY_URL to enable
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <label className="sr-only" htmlFor="cc-rating-sort">
              Sort applicants
            </label>
            <select
              id="cc-rating-sort"
              value={ratingSort}
              onChange={(e) => setRatingSort(e.target.value as RatingSort)}
              className="h-9 border border-[#d4d4d8] rounded-lg px-3 text-sm text-[#374151] bg-white outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 max-w-[240px]"
            >
              {RATING_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="relative w-[260px]">
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
      </div>

      {/* Table */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-red-600 font-medium">{loadError}</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <CoffeeIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">
                {total === 0 ? "No applicants yet" : "No applicants match your search"}
              </p>
              <p className="text-sm text-[#a1a1aa] mt-1">
                {total === 0
                  ? "Submitted applications will show up here for coffee chat notes."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="border border-[#e4e4e7] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] border-b border-[#e4e4e7]">
                  <tr>
                    {["Applicant", "Year / Major", "Ratings", ""].map((label) => (
                      <th
                        key={label || "actions"}
                        className="px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f5]">
                  {visible.map((row) => {
                    const initials   = `${row.firstName[0]}${row.lastName[0]}`;
                    const isSelected = selectedId === row.id;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(isSelected ? null : row.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#061c2a]/5 border-l-[3px] border-l-[#061c2a]" : "bg-white hover:bg-[#f9fafb] border-l-[3px] border-l-transparent"}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#111827]">{row.firstName} {row.lastName}</p>
                              <p className="text-xs text-[#6b7280]">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[#374151] font-medium">Year {row.year}</p>
                          <p className="text-xs text-[#6b7280] mt-0.5 max-w-[160px] truncate">{row.major}</p>
                        </td>
                        <td className="px-5 py-4">
                          <NoteSignalSummary counts={row.signalCounts} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : row.id); }}
                            className="group flex items-center gap-1 text-xs font-medium text-[#061c2a] hover:text-[#0d2f47] transition-colors"
                          >
                            {isSelected ? "Close" : "Review"}
                            <ChevronRightIcon className={`transition-transform duration-200 ${isSelected ? "rotate-180" : "group-hover:translate-x-0.5"}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !loadError && sortedApplicants.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-[#6b7280]">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedApplicants.length)} of {sortedApplicants.length}
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
            applicant={{
              ...selected,
              signalCounts: signalByApplicant[selected.id] ?? EMPTY_SIGNAL_COUNTS,
            }}
            onClose={() => setSelectedId(null)}
            onRatingChange={() => void refreshSignals()}
          />
        )}
      </div>

      <LazyEmailTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={CC_EMAIL_TEMPLATES}
        title="Coffee Chat Email Templates"
      />
    </main>
  );
}
