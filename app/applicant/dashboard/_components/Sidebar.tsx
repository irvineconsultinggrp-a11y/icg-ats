"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "./AccountMenu";

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

type ApplicantNav = "applications" | "coffee-chats";

function getActiveNav(pathname: string): ApplicantNav {
  if (pathname.includes("/coffee-chats")) return "coffee-chats";
  return "applications";
}

export function Sidebar() {
  const pathname = usePathname();
  const active = getActiveNav(pathname);

  const navItems: { key: ApplicantNav; label: string; icon: React.ReactNode; href: string }[] = [
    { key: "applications", label: "Applications", icon: <PencilIcon />, href: "/applicant/dashboard" },
    { key: "coffee-chats", label: "Coffee Chats", icon: <UsersIcon />, href: "/applicant/dashboard/coffee-chats" },
  ];

  return (
    <aside className="w-full lg:w-[272px] flex-shrink-0 border-r border-[#e4e4e7] bg-white flex flex-col justify-between h-full min-h-[100dvh] lg:h-screen lg:sticky lg:top-0 p-6 lg:p-8">
      <div className="flex flex-col gap-10">
        <div className="px-[7px]">
          <div className="relative w-[168px] h-[68px]">
            <Image
              src="/images/icg-logo.png"
              alt="Irvine Consulting Group"
              fill
              sizes="168px"
              className="object-contain"
            />
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 h-[58px] w-full max-w-[208px] px-5 py-4 rounded-lg font-bold text-base text-[#061c2a] transition-colors ${
                active === item.key ? "bg-[#f4f4f5]" : "hover:bg-[#f9fafb]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center w-[208px]">
        <AccountMenu />
      </div>
    </aside>
  );
}
