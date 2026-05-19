"use client";

import { useState } from "react";

// --- Icons ---

function XIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Types ---

export type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  /** Full HTML body for clipboard — preserves bold, lists, etc. when pasted into email clients */
  html: string;
  /** Plain text fallback for clipboard */
  text: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  templates: EmailTemplate[];
  title?: string;
};

// --- Rich-text clipboard copy ---

async function copyTemplateToClipboard(html: string, text: string): Promise<void> {
  try {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([text], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
  } catch {
    // Fallback — some browsers disallow ClipboardItem; copy plain text
    await navigator.clipboard.writeText(text);
  }
}

// --- Component ---

export function EmailTemplatesModal({ isOpen, onClose, templates, title = "Email Templates" }: Props) {
  const [activeId, setActiveId] = useState<string>(templates[0]?.id ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const active = templates.find((t) => t.id === activeId) ?? templates[0];

  async function handleCopy(template: EmailTemplate) {
    await copyTemplateToClipboard(template.html, template.text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#061c2a]/8 flex items-center justify-center">
              <MailIcon className="text-[#061c2a]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Copy a template — bold text and formatting are preserved when pasting into email clients.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-[#374151] transition-colors p-1"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: template list */}
          <div className="w-52 flex-shrink-0 border-r border-[#e4e4e7] flex flex-col gap-1 p-3 overflow-y-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`text-left flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-colors ${
                  activeId === t.id
                    ? "bg-[#061c2a] text-white"
                    : "text-[#374151] hover:bg-[#f4f4f5]"
                }`}
              >
                <span className="text-sm font-semibold leading-tight">{t.name}</span>
                <span className={`text-xs leading-snug ${activeId === t.id ? "text-white/70" : "text-[#6b7280]"}`}>
                  {t.description}
                </span>
              </button>
            ))}
          </div>

          {/* Right: preview + actions */}
          {active && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Subject line */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e4e4e7] bg-[#f9fafb]">
                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide flex-shrink-0">Subject</span>
                <span className="text-sm text-[#111827] font-medium truncate">{active.subject}</span>
              </div>

              {/* Template body preview */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div
                  className="prose prose-sm max-w-none text-[#374151] [&_strong]:text-[#111827] [&_strong]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_li]:my-1"
                  dangerouslySetInnerHTML={{ __html: active.html }}
                />
              </div>

              {/* Footer: copy button */}
              <div className="px-6 py-4 border-t border-[#e4e4e7] flex items-center justify-between gap-4 bg-[#fafafa]">
                <p className="text-xs text-[#6b7280]">
                  Replace <span className="font-mono bg-[#f4f4f5] px-1 rounded text-[#374151]">[bracketed]</span> fields before sending.
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(active)}
                  className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all ${
                    copiedId === active.id
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-[#061c2a] text-white hover:bg-[#0d2f47]"
                  }`}
                >
                  {copiedId === active.id ? (
                    <>
                      <CheckIcon />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Copy Template
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
