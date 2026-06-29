"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { POSITIONS, type Position } from "@/lib/positions";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { ApplicantRow } from "@/lib/types/database";

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

type ApplicationMeta = {
  position: string;
  canEdit: boolean;
};

function PositionCard({
  position,
  application,
  canEdit,
}: {
  position: Position;
  application?: ApplicantRow;
  canEdit: boolean;
}) {
  const dateLabel = position.isOpen
    ? `Opens ${position.openDate}`
    : `Opened ${position.openDate}`;
  const closedLabel = position.isOpen
    ? `Closes ${position.closeDate}`
    : `Closed ${position.closeDate}`;

  let actionLabel = "Apply";
  let actionHref = `/applicant/dashboard/apply/${position.id}`;
  let badge: { text: string; className: string } | null = null;

  if (application) {
    if (canEdit) {
      actionLabel = "Edit application";
      badge = { text: "Submitted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    } else {
      actionLabel = "View application";
      badge = { text: "Locked", className: "bg-[#f4f4f5] text-[#52525b] border-[#e4e4e7]" };
    }
  } else if (!position.isOpen) {
    actionHref = "";
  }

  const cardContent = (
    <div
      className={`bg-white border border-[#e4e4e7] rounded-md p-6 flex flex-col gap-5 transition-colors ${
        actionHref ? "hover:border-[#061c2a] cursor-pointer" : "opacity-80"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-black">
          <span>{dateLabel}</span>
          <span className="mx-1 text-[#a1a1aa]">•</span>
          <span>{closedLabel}</span>
        </div>
        {badge && (
          <span className={`inline-flex items-center h-6 px-2 rounded border text-xs font-medium ${badge.className}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="font-semibold text-lg leading-7 text-black">{position.title}</p>
        <p className="text-sm leading-5 text-[#52525b] line-clamp-3">{position.description}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
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
        {actionHref && (
          <span className="text-sm font-medium text-[#061c2a]">{actionLabel} →</span>
        )}
      </div>
    </div>
  );

  if (actionHref) {
    return (
      <Link href={actionHref} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default function ApplicantDashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [applications, setApplications] = useState<ApplicantRow[]>([]);
  const [meta, setMeta] = useState<ApplicationMeta[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/applicants/mine", { credentials: "include" });
        const body = (await res.json()) as {
          data?: ApplicantRow[];
          meta?: ApplicationMeta[];
        };
        if (res.ok) {
          setApplications(body.data ?? []);
          setMeta(body.meta ?? []);
        }
      } catch {
        setApplications([]);
        setMeta([]);
      }
    })();
  }, []);

  const openPositions = POSITIONS.filter((p) => p.isOpen);
  const closedPositions = POSITIONS.filter((p) => !p.isOpen);

  const filterPositions = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return (positions: Position[]) =>
      q
        ? positions.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q)),
          )
        : positions;
  }, [debouncedSearch]);

  const filteredOpen = useMemo(
    () => filterPositions(openPositions),
    [filterPositions, openPositions],
  );
  const filteredClosed = useMemo(
    () => filterPositions(closedPositions),
    [filterPositions, closedPositions],
  );

  const applicationByPosition = useMemo(() => {
    const map = new Map<string, ApplicantRow>();
    for (const a of applications) map.set(a.position, a);
    return map;
  }, [applications]);

  const canEditByPosition = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const m of meta) map.set(m.position, m.canEdit);
    return map;
  }, [meta]);

  function getApplicationForPosition(positionId: string) {
    return applicationByPosition.get(positionId);
  }

  function getCanEdit(positionId: string) {
    return canEditByPosition.get(positionId) ?? false;
  }

  return (
    <main className="flex-1 px-8 py-8 overflow-y-auto">
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
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for an application..."
              className="w-full h-12 border border-[#d4d4d8] rounded px-5 pr-12 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
            />
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
          </div>
        </div>

        <section>
          <h2 className="font-bold text-[18px] leading-7 text-black mb-4">Open Positions</h2>
          {filteredOpen.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredOpen.map((pos) => (
                <PositionCard
                  key={pos.id}
                  position={pos}
                  application={getApplicationForPosition(pos.id)}
                  canEdit={getCanEdit(pos.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#a1a1aa]">No open positions match your search.</p>
          )}
        </section>

        <section>
          <h2 className="font-bold text-[18px] leading-7 text-black mb-4">Closed Positions</h2>
          {filteredClosed.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredClosed.map((pos) => (
                <PositionCard
                  key={pos.id}
                  position={pos}
                  application={getApplicationForPosition(pos.id)}
                  canEdit={getCanEdit(pos.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#a1a1aa]">No closed positions match your search.</p>
          )}
        </section>
      </div>
    </main>
  );
}
