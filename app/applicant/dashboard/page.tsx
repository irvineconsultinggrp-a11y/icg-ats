"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// --- Icons ---

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PanelLeftCloseIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 3v18" stroke="currentColor" strokeWidth="2"/>
      <path d="m16 15-3-3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// --- Types ---

type NavItem = "home" | "applications" | "coffee-chats";

type Position = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  openDate: string;
  closeDate: string;
  isOpen: boolean;
};

// --- Mock data ---

const POSITIONS: Position[] = [
  {
    id: "junior-associate",
    title: "Junior Associate",
    description:
      "Join our team as a Junior Associate. Work on consulting deliverables, conduct research, and support associate consultants on projects.",
    tags: ["Fall Quarter", "2026"],
    openDate: "09/15/2026",
    closeDate: "09/30/2026",
    isOpen: true,
  },
  {
    id: "junior-associate-winter",
    title: "Junior Associate",
    description:
      "Join our team as a Junior Associate. Work on consulting deliverables, conduct research, and support associate consultants on projects.",
    tags: ["Winter Quarter", "2026"],
    openDate: "01/15/2026",
    closeDate: "01/30/2026",
    isOpen: false,
  },
  {
    id: "junior-associate-fall-2025",
    title: "Junior Associate",
    description:
      "Join our team as a Junior Associate. Work on consulting deliverables, conduct research, and support associate consultants on projects.",
    tags: ["Fall Quarter", "2025"],
    openDate: "09/13/2026",
    closeDate: "09/25/2025",
    isOpen: false,
  },
];

// --- Sidebar ---

function Sidebar({ active }: { active: NavItem }) {
  const navItems: { key: NavItem; label: string; icon: React.ReactNode; href: string }[] = [
    {
      key: "home",
      label: "Home",
      icon: <HouseIcon />,
      href: "/applicant/dashboard",
    },
    {
      key: "applications",
      label: "Applications",
      icon: <PencilIcon />,
      href: "/applicant/dashboard",
    },
    {
      key: "coffee-chats",
      label: "Coffee Chats",
      icon: <UsersIcon />,
      href: "/applicant/dashboard",
    },
  ];

  return (
    <aside className="w-[272px] flex-shrink-0 border-r border-[#e4e4e7] bg-white flex flex-col justify-between h-screen sticky top-0 p-8">
      <div className="flex flex-col gap-10">
        {/* Logo */}
        <div className="px-[7px]">
          <div className="relative w-[168px] h-[68px]">
            <Image
              src="/images/icg-logo.png"
              alt="Irvine Consulting Group"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 h-[58px] w-[208px] px-5 py-4 rounded-lg font-bold text-base text-[#061c2a] transition-colors ${
                active === item.key ? "bg-[#f4f4f5]" : "hover:bg-[#f9fafb]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom: avatar + collapse */}
      <div className="flex items-center justify-between w-[208px]">
        <div className="w-[45px] h-[45px] rounded-full bg-[#061c2a] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          JD
        </div>
        <button
          type="button"
          className="text-[#a1a1aa] hover:text-[#374151] transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftCloseIcon />
        </button>
      </div>
    </aside>
  );
}

// --- Position Card ---

function PositionCard({ position }: { position: Position }) {
  const dateLabel = position.isOpen
    ? `Opens ${position.openDate}`
    : `Opened ${position.openDate}`;
  const closedLabel = position.isOpen
    ? `Closes ${position.closeDate}`
    : `Closed ${position.closeDate}`;

  const cardContent = (
    <div
      className={`bg-white border border-[#e4e4e7] rounded-md p-6 flex flex-col gap-5 transition-colors ${
        position.isOpen ? "hover:border-[#061c2a] cursor-pointer" : "opacity-80"
      }`}
    >
      {/* Dates */}
      <div className="flex items-center gap-1 text-xs text-black">
        <span>{dateLabel}</span>
        <span className="mx-1 text-[#a1a1aa]">•</span>
        <span>{closedLabel}</span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5">
        <p className="font-semibold text-lg leading-7 text-black">{position.title}</p>
        <p className="text-sm leading-5 text-[#52525b] line-clamp-3">{position.description}</p>
      </div>

      {/* Tags */}
      <div className="flex gap-2.5">
        {position.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center h-6 px-2 rounded bg-[#f4f4f5] border border-[#e4e4e7] text-xs font-medium text-[#27272a]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (position.isOpen) {
    return (
      <Link href={`/applicant/dashboard/apply/${position.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// --- Main Page ---

export default function ApplicantDashboard() {
  const [search, setSearch] = useState("");

  const openPositions = POSITIONS.filter((p) => p.isOpen);
  const closedPositions = POSITIONS.filter((p) => !p.isOpen);

  const filtered = (positions: Position[]) =>
    search.trim()
      ? positions.filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
        )
      : positions;

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar active="applications" />

      {/* Main content */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="max-w-[1104px] flex flex-col gap-6">
          {/* Search & Filter */}
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
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for an application..."
                className="w-full h-12 border border-[#d4d4d8] rounded px-5 pr-12 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
            </div>
          </div>

          {/* Open Positions */}
          <section>
            <h2 className="font-bold text-[18px] leading-7 text-black mb-4">Open Positions</h2>
            {filtered(openPositions).length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtered(openPositions).map((pos) => (
                  <PositionCard key={pos.id} position={pos} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a1a1aa]">No open positions match your search.</p>
            )}
          </section>

          {/* Closed Positions */}
          <section>
            <h2 className="font-bold text-[18px] leading-7 text-black mb-4">Closed Positions</h2>
            {filtered(closedPositions).length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtered(closedPositions).map((pos) => (
                  <PositionCard key={pos.id} position={pos} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a1a1aa]">No closed positions match your search.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
