"use client";

import { useState } from "react";
import { EmailTemplatesModal, type EmailTemplate } from "../_components/EmailTemplatesModal";

// --- Icons ---

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Types ---

type DecisionStatus = "pending" | "accepted" | "rejected";

type Decision = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  year: number;
  major: string;
  gpa: string;
  giScore: number | null;
  ccScore: number | null;
  status: DecisionStatus;
  notes: string;
};

// --- Status config ---

const STATUS_CONFIG: Record<DecisionStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:  { label: "Pending",  bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  accepted: { label: "Accepted", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  rejected: { label: "Rejected", bg: "bg-red-50",   text: "text-red-700",   dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: DecisionStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ScoreStars({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-[#a1a1aa] italic">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= value} className={n <= value ? "text-amber-400" : "text-[#e4e4e7]"} />
      ))}
    </div>
  );
}

// --- Email templates ---

const DECISION_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "decision-accept",
    name: "Acceptance Offer",
    description: "Extend membership offer",
    subject: "Welcome to ICG! – Offer of Membership",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>On behalf of the entire <strong>Irvine Consulting Group (ICG)</strong> team, we are absolutely thrilled to offer you a position as a <strong>Junior Associate</strong> for the <strong>Fall 2026</strong> term!</p>
<p>Your performance throughout the recruitment process — your application, group interview, and coffee chat — truly stood out, and we are confident you will be a tremendous asset to our team.</p>
<p><strong>Next Steps</strong></p>
<ul>
<li>Please confirm your acceptance by replying to this email by <strong>[Acceptance Deadline]</strong></li>
<li>Attend our <strong>New Member Orientation</strong> on <strong>[Orientation Date &amp; Time]</strong></li>
<li>Watch for a Slack workspace invitation to join our member channels</li>
</ul>
<p>We cannot wait to have you on the team. <strong>Welcome to ICG!</strong></p>
<p>With excitement,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

On behalf of the entire Irvine Consulting Group (ICG) team, we are absolutely thrilled to offer you a position as a Junior Associate for the Fall 2026 term!

Your performance throughout the recruitment process — your application, group interview, and coffee chat — truly stood out, and we are confident you will be a tremendous asset to our team.

Next Steps
- Please confirm your acceptance by replying to this email by [Acceptance Deadline]
- Attend our New Member Orientation on [Orientation Date & Time]
- Watch for a Slack workspace invitation to join our member channels

We cannot wait to have you on the team. Welcome to ICG!

With excitement,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
  {
    id: "decision-reject",
    name: "Rejection Notice",
    description: "Respectful rejection email",
    subject: "ICG Recruitment Update",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>Thank you sincerely for your time and dedication throughout the <strong>Irvine Consulting Group (ICG)</strong> recruitment process.</p>
<p>After thoughtful deliberation, we regret to inform you that we are unable to extend an offer at this time. This was an exceptionally competitive cycle, and this decision is in absolutely no way a reflection of your abilities or potential.</p>
<p>We deeply appreciate the effort you invested at every stage of the process, and we genuinely encourage you to apply again in a future recruitment cycle — we would love to see you back.</p>
<p>We wish you all the best in your academic and professional pursuits, and hope to stay connected.</p>
<p>Warm regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

Thank you sincerely for your time and dedication throughout the Irvine Consulting Group (ICG) recruitment process.

After thoughtful deliberation, we regret to inform you that we are unable to extend an offer at this time. This was an exceptionally competitive cycle, and this decision is in absolutely no way a reflection of your abilities or potential.

We deeply appreciate the effort you invested at every stage of the process, and we genuinely encourage you to apply again in a future recruitment cycle — we would love to see you back.

We wish you all the best in your academic and professional pursuits, and hope to stay connected.

Warm regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
];

// --- Detail panel ---

function DetailPanel({
  decision,
  onClose,
  onUpdate,
}: {
  decision: Decision;
  onClose: () => void;
  onUpdate: (patch: Partial<Decision>) => void;
}) {
  const [notes, setNotes] = useState(decision.notes);
  const initials = `${decision.firstName[0]}${decision.lastName[0]}`;
  const avgScore =
    decision.giScore !== null && decision.ccScore !== null
      ? ((decision.giScore + decision.ccScore) / 2).toFixed(1)
      : null;

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#e4e4e7] bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7]">
        <h3 className="text-base font-semibold text-[#111827]">Decision Detail</h3>
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
            <p className="text-lg font-semibold text-[#111827]">{decision.firstName} {decision.lastName}</p>
            <p className="text-sm text-[#6b7280]">{decision.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Year",  value: `Year ${decision.year}` },
            { label: "GPA",   value: decision.gpa },
            { label: "Major", value: decision.major },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 bg-[#f9fafb] rounded-lg p-3">
              <p className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        {/* Score summary */}
        <div className="flex flex-col gap-3 bg-[#f9fafb] rounded-xl p-4">
          <p className="text-sm font-semibold text-[#374151]">Score Summary</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b7280]">Group Interview</span>
              <ScoreStars value={decision.giScore} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b7280]">Coffee Chat</span>
              <ScoreStars value={decision.ccScore} />
            </div>
            {avgScore && (
              <div className="flex items-center justify-between pt-2 border-t border-[#e4e4e7] mt-1">
                <span className="text-xs font-semibold text-[#374151]">Average</span>
                <span className="text-sm font-bold text-[#061c2a]">{avgScore} / 5</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Officer Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate({ notes })}
            rows={4}
            placeholder="Add notes to support this decision…"
            className="w-full border border-[#e4e4e7] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none"
          />
        </div>

        {/* Decision actions */}
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-xs text-[#6b7280] font-medium">Current: <span className={`font-semibold ${STATUS_CONFIG[decision.status].text}`}>{STATUS_CONFIG[decision.status].label}</span></p>
          <button
            type="button"
            onClick={() => onUpdate({ status: "accepted" })}
            disabled={decision.status === "accepted"}
            className="flex items-center justify-center h-11 w-full bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Accept — Send Offer
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ status: "rejected" })}
            disabled={decision.status === "rejected"}
            className="flex items-center justify-center h-11 w-full border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reject Applicant
          </button>
          {decision.status !== "pending" && (
            <button
              type="button"
              onClick={() => onUpdate({ status: "pending" })}
              className="flex items-center justify-center h-9 w-full border border-[#e4e4e7] text-[#6b7280] text-xs font-medium rounded-lg hover:bg-[#f9fafb] transition-colors"
            >
              Reset to Pending
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Status tabs ---

const STATUS_TABS = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

// --- Main page ---

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const selected = decisions.find((d) => d.id === selectedId) ?? null;

  function updateDecision(id: string, patch: Partial<Decision>) {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  const counts: Record<StatusTab, number> = {
    all:      decisions.length,
    pending:  decisions.filter((d) => d.status === "pending").length,
    accepted: decisions.filter((d) => d.status === "accepted").length,
    rejected: decisions.filter((d) => d.status === "rejected").length,
  };

  const visible = decisions.filter((d) => {
    const matchesTab = activeTab === "all" || d.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.major.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="px-8 pt-8 pb-0 flex flex-col gap-6">
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
          <span>Recruitment</span>
          <ChevronRightIcon />
          <span className="font-medium text-[#111827]">Decisions</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#061c2a]">Decisions</h1>
            <p className="text-sm text-[#6b7280] mt-1">Fall 2026 · Junior Associate</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="flex items-center gap-2 h-9 px-4 border border-[#e4e4e7] bg-white rounded-lg text-sm font-medium text-[#374151] hover:border-[#9ca3af] hover:bg-[#f9fafb] transition-colors"
            >
              <MailIcon />
              Email Templates
            </button>

            {[
              { label: "Total",    value: counts.all,      color: "text-[#111827]" },
              { label: "Pending",  value: counts.pending,  color: "text-amber-600" },
              { label: "Accepted", value: counts.accepted, color: "text-green-600" },
              { label: "Rejected", value: counts.rejected, color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center bg-[#f9fafb] border border-[#e4e4e7] rounded-lg px-4 py-2.5 min-w-[72px]">
                <span className={`text-xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-[#a1a1aa] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 border-b border-[#e4e4e7] -mb-px">
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

          <div className="relative flex-shrink-0 w-[260px]">
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
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <CheckSquareIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">
                {decisions.length === 0 ? "No decisions yet" : "No applicants match your filters"}
              </p>
              <p className="text-sm text-[#a1a1aa] mt-1">
                {decisions.length === 0
                  ? "Applicants who complete Coffee Chats will appear here for a final decision."
                  : "Try adjusting your filters or search."}
              </p>
            </div>
          ) : (
            <div className="border border-[#e4e4e7] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] border-b border-[#e4e4e7]">
                  <tr>
                    {["Applicant", "Year / Major", "GI Score", "Chat Score", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f5]">
                  {visible.map((d) => {
                    const initials   = `${d.firstName[0]}${d.lastName[0]}`;
                    const isSelected = selectedId === d.id;

                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedId(isSelected ? null : d.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#061c2a]/5" : "bg-white hover:bg-[#f9fafb]"}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#111827]">{d.firstName} {d.lastName}</p>
                              <p className="text-xs text-[#6b7280]">{d.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[#374151] font-medium">Year {d.year}</p>
                          <p className="text-xs text-[#6b7280] mt-0.5 max-w-[160px] truncate">{d.major}</p>
                        </td>
                        <td className="px-5 py-4">
                          <ScoreStars value={d.giScore} />
                        </td>
                        <td className="px-5 py-4">
                          <ScoreStars value={d.ccScore} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDecision(d.id, { status: "accepted" });
                              }}
                              disabled={d.status === "accepted"}
                              className="h-7 px-3 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDecision(d.id, { status: "rejected" });
                              }}
                              disabled={d.status === "rejected"}
                              className="h-7 px-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <DetailPanel
            decision={selected}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => updateDecision(selected.id, patch)}
          />
        )}
      </div>

      <EmailTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={DECISION_EMAIL_TEMPLATES}
        title="Decision Email Templates"
      />
    </main>
  );
}
