"use client";

import { useState } from "react";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type DashboardMobileShellProps = {
  title?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Desktop: sidebar + content. Mobile: top bar, drawer nav, content below.
 */
export function DashboardMobileShell({
  title = "ICG ATS",
  sidebar,
  children,
}: DashboardMobileShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-white font-sans">
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-[#e4e4e7] bg-white px-4 safe-area-top">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#061c2a] hover:bg-[#f4f4f5]"
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>
        <span className="text-sm font-semibold text-[#061c2a] truncate">{title}</span>
      </header>

      {navOpen ? (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Close navigation menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(100vw,288px)] transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 lg:w-auto ${
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("a")) setNavOpen(false);
        }}
      >
        {sidebar}
      </div>

      <div className="flex flex-1 flex-col min-w-0 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}

/** Side detail panel: full-screen sheet on phone, column on lg+. */
export const OFFICER_DETAIL_PANEL_CLASS =
  "w-full max-lg:fixed max-lg:inset-0 max-lg:z-[60] max-lg:h-[100dvh] max-lg:pt-[env(safe-area-inset-top)] lg:w-[380px] lg:flex-shrink-0 border-[#e4e4e7] bg-white flex flex-col lg:h-screen lg:sticky lg:top-0 overflow-y-auto border-l max-lg:border-l-0";
