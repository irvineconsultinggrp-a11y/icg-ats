"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OfficerAccountMenu } from "./OfficerAccountMenu";

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 8 11 8 13a4 4 0 0 0 8 0c0-3-2-5-4-11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type OfficerNav =
  | "home"
  | "applications"
  | "coffee-chats"
  | "interview-schedule"
  | "round-1"
  | "round-2"
  | "bbq-social"
  | "decisions";

function getActiveNav(pathname: string): OfficerNav {
  if (pathname === "/officer/dashboard") return "home";
  if (pathname.includes("/applications")) return "applications";
  if (pathname.includes("/coffee-chats")) return "coffee-chats";
  if (pathname.includes("/interview-schedule")) return "interview-schedule";
  if (pathname.includes("/round-1")) return "round-1";
  if (pathname.includes("/round-2")) return "round-2";
  if (pathname.includes("/bbq-social")) return "bbq-social";
  if (pathname.includes("/decisions")) return "decisions";
  return "home";
}

export function Sidebar() {
  const pathname = usePathname();
  const active = getActiveNav(pathname);

  const navItems: { key: OfficerNav; label: string; icon: React.ReactNode; href: string }[] = [
    { key: "home",         label: "Home",         icon: <HouseIcon />,       href: "/officer/dashboard" },
    { key: "applications", label: "Applications", icon: <FileTextIcon />,    href: "/officer/dashboard/applications" },
    { key: "coffee-chats", label: "Coffee Chats", icon: <CoffeeIcon />,      href: "/officer/dashboard/coffee-chats" },
    { key: "interview-schedule", label: "Interview Schedule", icon: <UsersIcon />, href: "/officer/dashboard/interview-schedule" },
    { key: "round-1",      label: "Round 1",      icon: <UsersIcon />,       href: "/officer/dashboard/round-1" },
    { key: "round-2",      label: "Round 2",      icon: <UsersIcon />,       href: "/officer/dashboard/round-2" },
    { key: "bbq-social",   label: "BBQ Social",   icon: <FireIcon />,        href: "/officer/dashboard/bbq-social" },
    { key: "decisions",    label: "Decisions",    icon: <CheckSquareIcon />, href: "/officer/dashboard/decisions" },
  ];

  return (
    <aside className="w-[272px] flex-shrink-0 border-r border-[#e4e4e7] bg-white flex flex-col justify-between h-screen sticky top-0 p-8">
      <div className="flex flex-col gap-10">
        <div className="px-[7px]">
          <div className="relative w-[168px] h-[68px]">
            <Image src="/images/icg-logo.png" alt="Irvine Consulting Group" fill className="object-contain" />
          </div>
        </div>
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

      <div className="w-[208px]">
        <OfficerAccountMenu />
      </div>
    </aside>
  );
}
