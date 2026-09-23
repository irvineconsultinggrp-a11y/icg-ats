"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  COFFEE_CHAT_MEMBERS,
  type CoffeeChatMember,
} from "@/lib/officers/directory-members";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { resolveCoffeeChatCalendlyUrl } from "@/lib/calendly";

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

type Member = CoffeeChatMember;

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({
  member,
  onLearnMore,
  onChat,
  index,
}: {
  member: Member;
  onLearnMore: (m: Member) => void;
  onChat: (m: Member) => void;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div
      className="bg-white border border-[#e4e4e7] rounded-xl p-6 flex flex-col items-center gap-4 hover:shadow-[0_8px_28px_rgba(6,28,42,0.13)] hover:-translate-y-1 hover:scale-[1.03] transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        type="button"
        onClick={() => onLearnMore(member)}
        className="flex flex-col items-center gap-4 w-full rounded-lg cursor-pointer group/card focus:outline-none focus-visible:ring-2 focus-visible:ring-[#061c2a]/30"
        aria-label={`View ${member.name}'s profile`}
      >
        <span className="relative w-[120px] h-[120px] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#e4e4e7] ring-offset-2 group-hover/card:ring-[#061c2a] transition-all duration-200">
          {!imgError ? (
            <Image
              src={member.photo}
              alt=""
              fill
              sizes="120px"
              loading="lazy"
              className="object-cover object-top group-hover/card:scale-105 transition-transform duration-200"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="absolute inset-0 bg-[#061c2a] flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </span>
          )}
          <span className="absolute inset-0 bg-[#061c2a]/0 group-hover/card:bg-[#061c2a]/30 transition-colors duration-200 flex items-center justify-center">
            <span className="text-white text-xs font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">View</span>
          </span>
        </span>

        <span className="text-center">
          <span className="block font-semibold text-[15px] text-[#111827] leading-tight group-hover/card:text-[#061c2a] transition-colors">
            {member.name}
          </span>
          <span className="block text-sm text-[#6b7280] mt-1">{member.role}</span>
        </span>
      </button>

      <div className="flex gap-2 w-full">
        <button
          type="button"
          onClick={() => onLearnMore(member)}
          className="flex-1 h-10 border border-[#e4e4e7] rounded-lg text-sm font-medium text-[#374151] hover:border-[#061c2a] hover:text-[#061c2a] hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          Learn More
        </button>
        <button
          type="button"
          onClick={() => onChat(member)}
          className="flex-1 h-10 bg-[#061c2a] rounded-lg text-sm font-medium text-white hover:bg-[#0d2f47] transition-colors"
        >
          Chat
        </button>
      </div>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────

function ProfileModal({
  member,
  onClose,
  onTagSearch,
  onChat,
}: {
  member: Member;
  onClose: () => void;
  onTagSearch?: (tag: string) => void;
  onChat: (m: Member) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/40 backdrop-blur-[2px]" : "bg-transparent"
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden transition-all duration-200 ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="flex">
          <div className="relative w-[200px] flex-shrink-0 min-h-[260px]">
            {!imgError ? (
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="200px"
                className="object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-[#061c2a] flex items-center justify-center text-white text-4xl font-bold min-h-[260px]">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">{member.name}</h2>
                <p className="text-sm text-[#6b7280] mt-0.5">{member.role}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-[#a1a1aa] hover:text-[#374151] transition-colors p-1 rounded-md hover:bg-[#f4f4f5] -mt-1 -mr-1"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <p className="text-sm text-[#374151] leading-relaxed">{member.bio}</p>

            <div className="flex flex-col divide-y divide-[#f1f1f2] rounded-xl border border-[#ececee] bg-[#fafafa] overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Major</span>
                <span className="text-sm font-medium text-[#111827] text-right">{member.major}</span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Graduation</span>
                <span className="text-sm font-medium text-[#111827] text-right">
                  {member.graduationYear ? `Class of ${member.graduationYear}` : "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Interests</span>
              <div className="flex flex-wrap gap-2">
                {member.interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => { onTagSearch?.(interest); handleClose(); }}
                    className="inline-flex items-center h-7 px-3 bg-white border border-[#e4e4e7] rounded-full text-xs font-medium text-[#374151] hover:bg-[#061c2a] hover:text-white hover:border-[#061c2a] transition-colors"
                    title={`Filter by "${interest}"`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onChat(member)}
              className="flex items-center justify-center gap-2 h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] transition-colors mt-auto"
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "all", label: "All Members", icon: <UserCircleIcon /> },
  { key: "executive", label: "Executives", icon: <BriefcaseIcon /> },
  { key: "director", label: "Directors", icon: <MegaphoneIcon /> },
  { key: "member", label: "Consultants", icon: <UsersIcon /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const MEMBERS = COFFEE_CHAT_MEMBERS;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoffeeChatsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [notice, setNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  function handleRequestChat(member: Member) {
    const url = resolveCoffeeChatCalendlyUrl(member.calendly);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setNotice(`${member.name.split(" ")[0]}'s scheduling link isn't set up yet — check back soon!`);
  }

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return MEMBERS.filter((m) => {
      const matchesTab = activeTab === "all" || m.category === activeTab;
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.interests.some((i) => i.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, debouncedSearch]);

  const tabCounts = useMemo(
    () => ({
      all: MEMBERS.length,
      executive: MEMBERS.filter((m) => m.category === "executive").length,
      director: MEMBERS.filter((m) => m.category === "director").length,
      member: MEMBERS.filter((m) => m.category === "member").length,
    }),
    [],
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-[1104px] flex flex-col gap-6">
          <div className="flex gap-3 items-center">
            <button
              type="button"
              className="flex items-center gap-2.5 h-12 px-5 bg-[#f4f4f5] border border-[#e4e4e7] rounded text-sm font-medium text-[#27272a] hover:bg-[#ececed] transition-colors flex-shrink-0"
            >
              <FilterIcon />
              Filter
            </button>
            <div className="relative flex-1">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, or interest… (/)"
                className="w-full h-12 border border-[#d4d4d8] rounded px-5 pr-12 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#374151] transition-colors"
                  aria-label="Clear search"
                >
                  <XIcon />
                </button>
              ) : (
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
              )}
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h1 className="font-bold text-[18px] leading-7 text-black">Coffee Chat Scheduler</h1>
            <p className="text-sm text-[#6b7280]">
              {search || activeTab !== "all"
                ? `${filtered.length} of ${MEMBERS.length} members`
                : `${MEMBERS.length} members`}
            </p>
          </div>

          <div className="border-b border-[#e4e4e7] -mt-2">
            <div className="flex items-center gap-0">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-[18px] py-2 text-base border-b-2 transition-colors whitespace-nowrap rounded-t-md ${
                    activeTab === tab.key
                      ? "border-[#061c2a] text-[#111827] font-medium"
                      : "border-transparent text-[#52525b] hover:text-[#374151] hover:bg-[#f9fafb]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold transition-colors ${
                    activeTab === tab.key ? "bg-[#061c2a] text-white" : "bg-[#f4f4f5] text-[#6b7280]"
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <UsersIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
              <p className="text-[#374151] font-medium">No members found</p>
              <p className="text-sm text-[#a1a1aa] mt-1">Try adjusting your search.</p>
            </div>
          ) : (
            <div
              key={`${activeTab}-${debouncedSearch}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {filtered.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  onLearnMore={setSelectedMember}
                  onChat={handleRequestChat}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedMember && (
        <ProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onChat={handleRequestChat}
          onTagSearch={(tag) => {
            setSearch(tag);
            setActiveTab("all");
          }}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] rounded-lg bg-[#061c2a] text-white text-sm font-medium px-5 py-3 shadow-lg animate-fade-in"
        >
          {notice}
        </div>
      )}
    </>
  );
}
