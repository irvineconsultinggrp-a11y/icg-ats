"use client";

import { useState } from "react";
import { EmailTemplatesModal, type EmailTemplate } from "../_components/EmailTemplatesModal";

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

// --- Email templates ---

const APP_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "app-received",
    name: "Application Received",
    description: "Confirm receipt of application",
    subject: "Your ICG Application Has Been Received",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>Thank you for applying to <strong>Irvine Consulting Group (ICG)</strong> for the <strong>Junior Associate</strong> position — Fall 2026.</p>
<p>We have successfully received your application and our team will be reviewing it shortly. You can expect to hear back from us regarding next steps within the next <strong>1–2 weeks</strong>.</p>
<p>In the meantime, if you have any questions, feel free to reach out by replying to this email.</p>
<p>We appreciate your interest in ICG and look forward to learning more about you!</p>
<p>Best regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

Thank you for applying to Irvine Consulting Group (ICG) for the Junior Associate position — Fall 2026.

We have successfully received your application and our team will be reviewing it shortly. You can expect to hear back from us regarding next steps within the next 1–2 weeks.

In the meantime, if you have any questions, feel free to reach out by replying to this email.

We appreciate your interest in ICG and look forward to learning more about you!

Best regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
  {
    id: "app-not-selected",
    name: "Not Moving Forward",
    description: "Early-stage rejection",
    subject: "ICG Application Update",
    html: `<p>Dear <strong>[First Name]</strong>,</p>
<p>Thank you for your interest in <strong>Irvine Consulting Group (ICG)</strong> and for taking the time to apply for the <strong>Junior Associate</strong> position.</p>
<p>After carefully reviewing your application, we regret to inform you that we will not be moving forward with your candidacy at this time. This was a competitive process, and this decision is in no way a reflection of your potential.</p>
<p>We encourage you to apply again in a future recruitment cycle and wish you all the best in your academic and professional journey.</p>
<p>Thank you again for your interest in ICG.</p>
<p>Warm regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group | University of California, Irvine</p>`,
    text: `Dear [First Name],

Thank you for your interest in Irvine Consulting Group (ICG) and for taking the time to apply for the Junior Associate position.

After carefully reviewing your application, we regret to inform you that we will not be moving forward with your candidacy at this time. This was a competitive process, and this decision is in no way a reflection of your potential.

We encourage you to apply again in a future recruitment cycle and wish you all the best in your academic and professional journey.

Thank you again for your interest in ICG.

Warm regards,
The ICG Recruitment Team
Irvine Consulting Group | University of California, Irvine`,
  },
];

// --- Detail panel ---

function DetailPanel({
  applicant,
  onClose,
  onUpdate,
}: {
  applicant: Application;
  onClose: () => void;
  onUpdate: (patch: Partial<Application>) => void;
}) {
  const [notes, setNotes] = useState(applicant.notes);
  const initials = `${applicant.firstName[0]}${applicant.lastName[0]}`;

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#e4e4e7] bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
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
            onBlur={() => onUpdate({ notes })}
            rows={4}
            placeholder="Add notes about this application…"
            className="w-full border border-[#e4e4e7] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => onUpdate({ status: "advanced" })}
            className="flex items-center justify-center h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] transition-colors"
          >
            Advance to Group Interview
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ status: "rejected" })}
            className="flex items-center justify-center h-11 w-full border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject Application
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

// --- Main page ---

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  function updateApplication(id: string, patch: Partial<Application>) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  const counts: Record<StatusTab, number> = {
    all:       applications.length,
    new:       applications.filter((a) => a.status === "new").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    advanced:  applications.filter((a) => a.status === "advanced").length,
    rejected:  applications.filter((a) => a.status === "rejected").length,
  };

  const visible = applications.filter((a) => {
    const matchesTab = activeTab === "all" || a.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.major.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="px-8 pt-8 pb-0 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
          <span>Recruitment</span>
          <ChevronRightIcon />
          <span className="font-medium text-[#111827]">Applications</span>
        </div>

        {/* Title + actions + stats */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#061c2a]">Applications</h1>
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
              <FileTextIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">
                {applications.length === 0 ? "No applications yet" : "No applicants match your filters"}
              </p>
              <p className="text-sm text-[#a1a1aa] mt-1">
                {applications.length === 0
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
        </div>

        {selected && (
          <DetailPanel
            applicant={selected}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => updateApplication(selected.id, patch)}
          />
        )}
      </div>

      <EmailTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={APP_EMAIL_TEMPLATES}
        title="Application Email Templates"
      />
    </main>
  );
}
