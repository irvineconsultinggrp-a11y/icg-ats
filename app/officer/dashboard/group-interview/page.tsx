"use client";

import { useState } from "react";
import { EmailTemplatesModal, type EmailTemplate } from "../_components/EmailTemplatesModal";

// --- Icons ---

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

type GIStatus = "pending" | "scheduled" | "completed" | "rejected";

type Applicant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  year: number;
  major: string;
  gpa: string;
  position: string;
  availableSlots: string[];
  assignedSlot: string | null;
  status: GIStatus;
  score: number | null;
  notes: string;
};

type Session = {
  id: string;
  label: string;
  date: string;
  time: string;
  capacity: number;
};

// --- Mock data ---

const SESSIONS: Session[] = [
  { id: "s1", label: "Session A", date: "Oct 3, 2026", time: "10:00 AM – 11:30 AM", capacity: 8 },
  { id: "s2", label: "Session B", date: "Oct 3, 2026", time: "2:00 PM – 3:30 PM",  capacity: 8 },
  { id: "s3", label: "Session C", date: "Oct 4, 2026", time: "11:00 AM – 12:30 PM", capacity: 8 },
  { id: "s4", label: "Session D", date: "Oct 4, 2026", time: "3:00 PM – 4:30 PM",  capacity: 8 },
];


// --- Email templates ---

const GI_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "gi-invitation",
    name: "GI Invitation",
    description: "Invite applicant to group interview",
    subject: "Invitation to ICG Group Interview – [DATE]",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>Congratulations! We are pleased to invite you to the next stage of the <strong>Irvine Consulting Group (ICG)</strong> recruitment process for the <strong>Junior Associate</strong> position.</p>
<p><strong>Group Interview Details</strong></p>
<p><strong>Date:</strong> [Date]<br><strong>Time:</strong> [Time]<br><strong>Location:</strong> [Location / Zoom Link]<br><strong>Duration:</strong> Approximately 90 minutes</p>
<p><strong>What to Expect:</strong></p>
<ul>
<li>A collaborative case study exercise (~60 minutes)</li>
<li>Group discussion and Q&amp;A with ICG officers (~30 minutes)</li>
</ul>
<p>Please confirm your attendance by replying to this email. If you have any scheduling conflicts, reach out as soon as possible so we can do our best to accommodate you.</p>
<p>We look forward to meeting you!</p>
<p>Best regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

Congratulations! We are pleased to invite you to the next stage of the Irvine Consulting Group (ICG) recruitment process for the Junior Associate position.

Group Interview Details
Date: [Date]
Time: [Time]
Location: [Location / Zoom Link]
Duration: Approximately 90 minutes

What to Expect:
- A collaborative case study exercise (~60 minutes)
- Group discussion and Q&A with ICG officers (~30 minutes)

Please confirm your attendance by replying to this email. If you have any scheduling conflicts, reach out as soon as possible so we can do our best to accommodate you.

We look forward to meeting you!

Best regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
  {
    id: "gi-reminder",
    name: "Session Reminder",
    description: "Day-before reminder email",
    subject: "Reminder: ICG Group Interview Tomorrow – [TIME]",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>This is a friendly reminder that your <strong>ICG Group Interview</strong> is scheduled for <strong>tomorrow</strong>.</p>
<p><strong>Session Details</strong></p>
<p><strong>Date:</strong> [Date]<br><strong>Time:</strong> [Time]<br><strong>Location:</strong> [Location / Zoom Link]</p>
<p><strong>A few quick notes:</strong></p>
<ul>
<li>Please arrive (or log on) <strong>5 minutes early</strong></li>
<li>Bring a <strong>copy of your resume</strong> if attending in person</li>
<li>No preparation materials are required — just come ready to collaborate!</li>
</ul>
<p>If anything comes up, please reply to this email immediately.</p>
<p>See you tomorrow!</p>
<p>Best regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

This is a friendly reminder that your ICG Group Interview is scheduled for tomorrow.

Session Details
Date: [Date]
Time: [Time]
Location: [Location / Zoom Link]

A few quick notes:
- Please arrive (or log on) 5 minutes early
- Bring a copy of your resume if attending in person
- No preparation materials are required — just come ready to collaborate!

If anything comes up, please reply to this email immediately.

See you tomorrow!

Best regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
];

// --- Status config ---

const STATUS_CONFIG: Record<GIStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  scheduled: { label: "Scheduled", bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  rejected:  { label: "Rejected",  bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: GIStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// --- Star rating ---

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          className={`transition-colors ${n <= (hovered ?? value ?? 0) ? "text-amber-400" : "text-[#d4d4d8]"}`}
          aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
        >
          <StarIcon filled={n <= (hovered ?? value ?? 0)} />
        </button>
      ))}
      {value !== null && <span className="ml-1.5 text-xs text-[#71717a] font-medium">{value}/5</span>}
    </div>
  );
}

// --- Detail panel ---

function DetailPanel({
  applicant,
  sessions,
  onClose,
  onUpdate,
}: {
  applicant: Applicant;
  sessions: Session[];
  onClose: () => void;
  onUpdate: (updated: Partial<Applicant>) => void;
}) {
  const [notes, setNotes] = useState(applicant.notes);
  const initials = `${applicant.firstName[0]}${applicant.lastName[0]}`;

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#e4e4e7] bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7]">
        <h3 className="text-base font-semibold text-[#111827]">Applicant Detail</h3>
        <button type="button" onClick={onClose} className="text-[#a1a1aa] hover:text-[#374151] transition-colors" aria-label="Close panel">
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
            { label: "Year",     value: `Year ${applicant.year}` },
            { label: "GPA",      value: applicant.gpa },
            { label: "Major",    value: applicant.major },
            { label: "Position", value: applicant.position },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 bg-[#f9fafb] rounded-lg p-3">
              <p className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Status</p>
          <div className="flex flex-wrap gap-2">
            {(["pending", "scheduled", "completed", "rejected"] as GIStatus[]).map((s) => (
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
          <p className="text-sm font-medium text-[#374151]">Assigned Session</p>
          <div className="flex flex-col gap-2">
            {sessions.map((session) => {
              const isSelected  = applicant.assignedSlot === session.id;
              const isAvailable = applicant.availableSlots.includes(session.id);
              return (
                <button
                  key={session.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onUpdate({ assignedSlot: isSelected ? null : session.id })}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                    isSelected
                      ? "border-[#061c2a] bg-[#061c2a]/5"
                      : isAvailable
                      ? "border-[#e4e4e7] hover:border-[#9ca3af] bg-white"
                      : "border-[#e4e4e7] bg-[#f9fafb] opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${isSelected ? "text-[#061c2a]" : "text-[#374151]"}`}>{session.label}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{session.date} · {session.time}</p>
                  </div>
                  {isAvailable ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isSelected ? "bg-[#061c2a] text-white" : "bg-[#f4f4f5] text-[#6b7280]"}`}>
                      {isSelected ? "Assigned" : "Available"}
                    </span>
                  ) : (
                    <span className="text-xs text-[#a1a1aa]">Unavailable</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Interview Score</p>
          <StarRating value={applicant.score} onChange={(v) => onUpdate({ score: v })} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Officer Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate({ notes })}
            rows={4}
            placeholder="Add notes about this applicant's performance…"
            className="w-full border border-[#e4e4e7] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => onUpdate({ status: "completed" })}
            className="flex items-center justify-center h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] transition-colors"
          >
            Advance to Coffee Chat
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ status: "rejected" })}
            className="flex items-center justify-center h-11 w-full border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject Applicant
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Status tabs ---

const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "rejected",  label: "Rejected" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

// --- Main page ---

export default function GroupInterviewPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<string>("all");
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const selectedApplicant = applicants.find((a) => a.id === selectedId) ?? null;

  function updateApplicant(id: string, patch: Partial<Applicant>) {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  const counts: Record<StatusTab, number> = {
    all:       applicants.length,
    pending:   applicants.filter((a) => a.status === "pending").length,
    scheduled: applicants.filter((a) => a.status === "scheduled").length,
    completed: applicants.filter((a) => a.status === "completed").length,
    rejected:  applicants.filter((a) => a.status === "rejected").length,
  };

  const sessionCounts = SESSIONS.map((s) => ({
    ...s,
    assigned: applicants.filter((a) => a.assignedSlot === s.id).length,
  }));

  const visible = applicants.filter((a) => {
    const matchesTab    = activeTab === "all" || a.status === activeTab;
    const matchesSession = sessionFilter === "all" || a.assignedSlot === sessionFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.major.toLowerCase().includes(q);
    return matchesTab && matchesSession && matchesSearch;
  });

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="px-8 pt-8 pb-0 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
          <span>Recruitment</span>
          <ChevronRightIcon />
          <span className="font-medium text-[#111827]">Group Interview</span>
        </div>

        {/* Title + actions + stats */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#061c2a]">Group Interview</h1>
            <p className="text-sm text-[#6b7280] mt-1">Fall 2026 · Junior Associate</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Email templates button */}
            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="flex items-center gap-2 h-9 px-4 border border-[#e4e4e7] bg-white rounded-lg text-sm font-medium text-[#374151] hover:border-[#9ca3af] hover:bg-[#f9fafb] transition-colors"
            >
              <MailIcon />
              Email Templates
            </button>

            {/* Stats */}
            {[
              { label: "Total",     value: applicants.length,  color: "text-[#111827]" },
              { label: "Pending",   value: counts.pending,     color: "text-amber-600" },
              { label: "Scheduled", value: counts.scheduled,   color: "text-blue-600" },
              { label: "Completed", value: counts.completed,   color: "text-green-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center bg-[#f9fafb] border border-[#e4e4e7] rounded-lg px-4 py-2.5 min-w-[72px]">
                <span className={`text-xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-[#a1a1aa] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSessionFilter("all")}
            className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition-all ${
              sessionFilter === "all"
                ? "bg-[#061c2a] text-white border-transparent"
                : "bg-white text-[#374151] border-[#e4e4e7] hover:border-[#9ca3af]"
            }`}
          >
            All Sessions
          </button>
          {sessionCounts.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSessionFilter(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium border transition-all ${
                sessionFilter === s.id
                  ? "bg-[#061c2a] text-white border-transparent"
                  : "bg-white text-[#374151] border-[#e4e4e7] hover:border-[#9ca3af]"
              }`}
            >
              <span>{s.label}</span>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                sessionFilter === s.id ? "bg-white/20 text-white" : "bg-[#f4f4f5] text-[#374151]"
              }`}>
                {s.assigned}
              </span>
            </button>
          ))}
        </div>

        {/* Status tabs + search */}
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

      {/* Table area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <UsersIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">No applicants found</p>
              <p className="text-sm text-[#a1a1aa] mt-1">Try adjusting your filters or search.</p>
            </div>
          ) : (
            <div className="border border-[#e4e4e7] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] border-b border-[#e4e4e7]">
                  <tr>
                    {["Applicant", "Year / Major", "Session", "Status", "Score", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f5]">
                  {visible.map((applicant) => {
                    const initials  = `${applicant.firstName[0]}${applicant.lastName[0]}`;
                    const session   = SESSIONS.find((s) => s.id === applicant.assignedSlot);
                    const isSelected = selectedId === applicant.id;

                    return (
                      <tr
                        key={applicant.id}
                        onClick={() => setSelectedId(isSelected ? null : applicant.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#061c2a]/5" : "bg-white hover:bg-[#f9fafb]"}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#111827]">{applicant.firstName} {applicant.lastName}</p>
                              <p className="text-xs text-[#6b7280]">{applicant.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[#374151] font-medium">Year {applicant.year}</p>
                          <p className="text-xs text-[#6b7280] mt-0.5 max-w-[180px] truncate">{applicant.major}</p>
                        </td>
                        <td className="px-5 py-4">
                          {session ? (
                            <div>
                              <p className="font-medium text-[#374151]">{session.label}</p>
                              <p className="text-xs text-[#6b7280] mt-0.5">{session.date}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-[#a1a1aa] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={applicant.status} />
                        </td>
                        <td className="px-5 py-4">
                          {applicant.score !== null ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <StarIcon key={n} filled={n <= applicant.score!} className={n <= applicant.score! ? "text-amber-400" : "text-[#e4e4e7]"} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-[#a1a1aa] italic">Not scored</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : applicant.id); }}
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
        </div>

        {selectedApplicant && (
          <DetailPanel
            applicant={selectedApplicant}
            sessions={SESSIONS}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => updateApplicant(selectedApplicant.id, patch)}
          />
        )}
      </div>

      <EmailTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={GI_EMAIL_TEMPLATES}
        title="Group Interview Email Templates"
      />
    </main>
  );
}
