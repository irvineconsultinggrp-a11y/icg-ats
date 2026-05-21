"use client";

import { useState } from "react";
import { EmailTemplatesModal, type EmailTemplate } from "../_components/EmailTemplatesModal";

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

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m18 15-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Types ---

type CCStatus = "pending" | "scheduled" | "completed" | "rejected";

type CoffeeChat = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  year: number;
  major: string;
  gpa: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  assignedOfficer: string | null;
  status: CCStatus;
  score: number | null;
  notes: string;
};

// --- Status config ---

const STATUS_CONFIG: Record<CCStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  scheduled: { label: "Scheduled", bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  rejected:  { label: "Rejected",  bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: CCStatus }) {
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
  chat,
  onClose,
  onUpdate,
}: {
  chat: CoffeeChat;
  onClose: () => void;
  onUpdate: (patch: Partial<CoffeeChat>) => void;
}) {
  const [notes, setNotes] = useState(chat.notes);
  const [date, setDate]   = useState(chat.scheduledDate ?? "");
  const [time, setTime]   = useState(chat.scheduledTime ?? "");
  const [officer, setOfficer] = useState(chat.assignedOfficer ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const initials = `${chat.firstName[0]}${chat.lastName[0]}`;

  function triggerSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  function saveSchedule() {
    onUpdate({
      scheduledDate: date || null,
      scheduledTime: time || null,
      assignedOfficer: officer || null,
      status: date && time ? "scheduled" : chat.status,
    });
    triggerSaved();
  }

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#e4e4e7] bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7]">
        <h3 className="text-base font-semibold text-[#111827]">Coffee Chat Detail</h3>
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
            <p className="text-lg font-semibold text-[#111827]">{chat.firstName} {chat.lastName}</p>
            <p className="text-sm text-[#6b7280]">{chat.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Year",  value: `Year ${chat.year}` },
            { label: "GPA",   value: chat.gpa },
            { label: "Major", value: chat.major },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 bg-[#f9fafb] rounded-lg p-3">
              <p className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[#374151]">Schedule</p>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280] font-medium">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={saveSchedule}
                placeholder="e.g. Oct 10, 2026"
                className="h-9 border border-[#e4e4e7] rounded-lg px-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280] font-medium">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onBlur={saveSchedule}
                placeholder="e.g. 2:00 PM – 2:30 PM"
                className="h-9 border border-[#e4e4e7] rounded-lg px-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280] font-medium">Assigned Officer</label>
              <input
                type="text"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                onBlur={saveSchedule}
                placeholder="Officer name"
                className="h-9 border border-[#e4e4e7] rounded-lg px-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Status</p>
          <div className="flex flex-wrap gap-2">
            {(["pending", "scheduled", "completed", "rejected"] as CCStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ status: s })}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-all ${
                  chat.status === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} border-transparent`
                    : "bg-white text-[#6b7280] border-[#e4e4e7] hover:border-[#d1d5db]"
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#374151]">Chat Score</p>
          <StarRating value={chat.score} onChange={(v) => onUpdate({ score: v })} />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#374151]">Officer Notes</p>
            <span className={`text-xs text-green-600 font-medium flex items-center gap-1 transition-opacity duration-300 ${savedFlash ? "opacity-100" : "opacity-0"}`}>
              <CheckCircleIcon className="w-3 h-3" />
              Saved
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => { onUpdate({ notes }); triggerSaved(); }}
            rows={4}
            placeholder="Add notes from the coffee chat…"
            className="w-full border border-[#e4e4e7] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => onUpdate({ status: "completed" })}
            className="group flex items-center justify-center gap-2 h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] active:scale-[0.98] transition-all"
          >
            <CheckCircleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Advance to Decisions
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ status: "rejected" })}
            className="group flex items-center justify-center gap-2 h-11 w-full border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all"
          >
            <XIcon className="w-4 h-4" />
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

export default function CoffeeChatsPage() {
  const [chats, setChats] = useState<CoffeeChat[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "status" | "score" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const selected = chats.find((c) => c.id === selectedId) ?? null;

  function updateChat(id: string, patch: Partial<CoffeeChat>) {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleSort(col: "name" | "status" | "score") {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  const counts: Record<StatusTab, number> = {
    all:       chats.length,
    pending:   chats.filter((c) => c.status === "pending").length,
    scheduled: chats.filter((c) => c.status === "scheduled").length,
    completed: chats.filter((c) => c.status === "completed").length,
    rejected:  chats.filter((c) => c.status === "rejected").length,
  };

  const visible = chats
    .filter((c) => {
      const matchesTab = activeTab === "all" || c.status === activeTab;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.major.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      let cmp = 0;
      if (sortBy === "name") cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      else if (sortBy === "score") cmp = (a.score ?? -1) - (b.score ?? -1);
      return sortDir === "asc" ? cmp : -cmp;
    });

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

            {[
              { label: "Total",     value: counts.all,       color: "text-[#111827]" },
              { label: "Pending",   value: counts.pending,   color: "text-amber-600" },
              { label: "Scheduled", value: counts.scheduled, color: "text-blue-600" },
              { label: "Completed", value: counts.completed, color: "text-green-600" },
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
              <CoffeeIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">
                {chats.length === 0 ? "No coffee chats yet" : "No applicants match your filters"}
              </p>
              <p className="text-sm text-[#a1a1aa] mt-1">
                {chats.length === 0
                  ? "Applicants who pass the Group Interview will appear here."
                  : "Try adjusting your filters or search."}
              </p>
            </div>
          ) : (
            <div className="border border-[#e4e4e7] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] border-b border-[#e4e4e7]">
                  <tr>
                    {([
                      { label: "Applicant",    sort: "name"   as const },
                      { label: "Year / Major", sort: null },
                      { label: "Scheduled",    sort: null },
                      { label: "Officer",      sort: null },
                      { label: "Status",       sort: "status" as const },
                      { label: "Score",        sort: "score"  as const },
                      { label: "",             sort: null },
                    ] as { label: string; sort: "name" | "status" | "score" | null }[]).map(({ label, sort }) => (
                      <th
                        key={label}
                        onClick={sort ? () => handleSort(sort) : undefined}
                        className={`px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap ${sort ? "cursor-pointer hover:text-[#374151] select-none" : ""}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {sort && (
                            sortBy === sort
                              ? (sortDir === "asc" ? <ChevronUpIcon className="text-[#061c2a]" /> : <ChevronDownIcon className="text-[#061c2a]" />)
                              : <ChevronUpIcon className="opacity-0 group-hover:opacity-40" />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f5]">
                  {visible.map((chat) => {
                    const initials   = `${chat.firstName[0]}${chat.lastName[0]}`;
                    const isSelected = selectedId === chat.id;

                    return (
                      <tr
                        key={chat.id}
                        onClick={() => setSelectedId(isSelected ? null : chat.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#061c2a]/5 border-l-[3px] border-l-[#061c2a]" : "bg-white hover:bg-[#f9fafb] border-l-[3px] border-l-transparent"}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#111827]">{chat.firstName} {chat.lastName}</p>
                              <p className="text-xs text-[#6b7280]">{chat.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[#374151] font-medium">Year {chat.year}</p>
                          <p className="text-xs text-[#6b7280] mt-0.5 max-w-[160px] truncate">{chat.major}</p>
                        </td>
                        <td className="px-5 py-4">
                          {chat.scheduledDate ? (
                            <div>
                              <p className="font-medium text-[#374151]">{chat.scheduledDate}</p>
                              <p className="text-xs text-[#6b7280] mt-0.5">{chat.scheduledTime}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-[#a1a1aa] italic">Not scheduled</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {chat.assignedOfficer ? (
                            <span className="text-sm text-[#374151] font-medium">{chat.assignedOfficer}</span>
                          ) : (
                            <span className="text-xs text-[#a1a1aa] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={chat.status} />
                        </td>
                        <td className="px-5 py-4">
                          {chat.score !== null ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <StarIcon key={n} filled={n <= chat.score!} className={n <= chat.score! ? "text-amber-400" : "text-[#e4e4e7]"} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-[#a1a1aa] italic">Not scored</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : chat.id); }}
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
        </div>

        {selected && (
          <DetailPanel
            chat={selected}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => updateChat(selected.id, patch)}
          />
        )}
      </div>

      <EmailTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={CC_EMAIL_TEMPLATES}
        title="Coffee Chat Email Templates"
      />
    </main>
  );
}
