"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberCategory = "executive" | "director" | "member";

type Member = {
  id: string;
  name: string;
  role: string;
  category: MemberCategory;
  bio: string;
  interests: string[];
  photo: string;
  calendlyUrl: string;
};

// ─── Member Data ──────────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  {
    id: "khang-nguyen",
    name: "Khang Nguyen",
    role: "President",
    category: "executive",
    bio: "Hello! I'm Khang, a 3rd-year Business Administration major specializing in finance. I love working on strategy and helping the club grow.",
    interests: ["Finance", "Strategy", "Tennis"],
    photo: "/images/headshots/Khang Nguyen.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "mohan-krishnan",
    name: "Mohan Krishnan",
    role: "Vice President",
    category: "executive",
    bio: "Hi! I'm Mohan, a 3rd-year Computer Science and Economics double major. I'm passionate about tech consulting and building impactful products.",
    interests: ["Tech Consulting", "Coding", "Basketball"],
    photo: "/images/headshots/Mohan Krishnan.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "michelle-choy",
    name: "Michelle Choy",
    role: "Vice President",
    category: "executive",
    bio: "Hey! I'm Michelle, a 3rd-year Business Administration major. I enjoy leading project teams and developing client relationships.",
    interests: ["Leadership", "Hiking", "Cooking"],
    photo: "/images/headshots/Michelle Choy.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "kim-vuong",
    name: "Kim Vuong",
    role: "Vice President",
    category: "executive",
    bio: "Hi there! I'm Kim, a 3rd-year Economics major with a focus on data analytics. I'm excited to connect and share my consulting journey.",
    interests: ["Data Analytics", "Photography", "Reading"],
    photo: "/images/headshots/Kim Vuong.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "aaron-johnson",
    name: "Aaron Johnson",
    role: "Vice President",
    category: "executive",
    bio: "Hey! I'm Aaron, passionate about management consulting and driving organizational change. Let's chat about careers and ICG!",
    interests: ["Consulting", "Soccer", "Chess"],
    photo: "/images/headshots/Aaron Johnson.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "brian-lee",
    name: "Brian Lee",
    role: "Director of Marketing",
    category: "director",
    bio: "Hi! I'm Brian, a 2nd-year Business major. I lead our marketing efforts and love crafting stories that connect with people.",
    interests: ["Marketing", "Design", "Music"],
    photo: "/images/headshots/Brian Lee.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "justin-park",
    name: "Justin Park",
    role: "Director of Operations",
    category: "director",
    bio: "Hello! I'm Justin, a 3rd-year Information & Computer Science major. I keep our club running smoothly and love optimizing processes.",
    interests: ["Operations", "Gaming", "Weightlifting"],
    photo: "/images/headshots/Justin Park.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "sahana-chockalingam",
    name: "Sahana Chockalingam",
    role: "Director of Technology",
    category: "director",
    bio: "Hi! I'm Sahana, a 3rd-year CS major. I oversee our tech projects and am always excited to talk about product and engineering consulting.",
    interests: ["Technology", "Yoga", "Traveling"],
    photo: "/images/headshots/Sahana Chockalingam.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "joel-leong",
    name: "Joel Leong",
    role: "Director of Finance",
    category: "director",
    bio: "Hey! I'm Joel, a 2nd-year Business Economics major. I'm passionate about financial modeling and investment strategy.",
    interests: ["Finance", "Golf", "Piano"],
    photo: "/images/headshots/Joel Leong.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "trinity-nguyen",
    name: "Trinity Nguyen",
    role: "Director of Recruitment",
    category: "director",
    bio: "Hi! I'm Trinity, a 3rd-year Psychology and Business double major. I love connecting with new people and building our club community.",
    interests: ["Recruitment", "Art", "Volleyball"],
    photo: "/images/headshots/Trinity Nguyen.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "krish-marwah",
    name: "Krish Marwah",
    role: "Associate Consultant",
    category: "member",
    bio: "Hey! I'm Krish, a 2nd-year CS & Management Science major. I'm eager to chat about tech consulting and career development.",
    interests: ["Consulting", "Cricket", "Hackathons"],
    photo: "/images/headshots/Krish Marwah.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "lucia-morales",
    name: "Lucia Morales",
    role: "Associate Consultant",
    category: "member",
    bio: "Hi! I'm Lucia, a 2nd-year Business Administration major. I love working on real-world case studies and developing my consulting skills.",
    interests: ["Strategy", "Running", "Baking"],
    photo: "/images/headshots/Lucia Morales.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "abby-luong",
    name: "Abby Luong",
    role: "Associate Consultant",
    category: "member",
    bio: "Hello! I'm Abby, a 2nd-year Economics major. Excited to share my ICG experience and chat about the consulting industry.",
    interests: ["Economics", "Reading", "Badminton"],
    photo: "/images/headshots/Abby Luong.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "akash-kalita",
    name: "Akash Kalita",
    role: "Associate Consultant",
    category: "member",
    bio: "Hey! I'm Akash, a 2nd-year Data Science major. Passionate about data-driven consulting and turning insights into strategy.",
    interests: ["Data Science", "Basketball", "Cooking"],
    photo: "/images/headshots/Akash Kalita.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "eric-zheng",
    name: "Eric Zheng",
    role: "Associate Consultant",
    category: "member",
    bio: "Hi! I'm Eric, a 2nd-year Business Administration major. I enjoy case competitions and developing client-facing skills.",
    interests: ["Finance", "Soccer", "Chess"],
    photo: "/images/headshots/Eric Zheng.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "ethan-huang",
    name: "Ethan Huang",
    role: "Associate Consultant",
    category: "member",
    bio: "Hey! I'm Ethan, a 2nd-year CS major. I love bridging tech and business and would love to chat about my ICG journey.",
    interests: ["Technology", "Piano", "Hiking"],
    photo: "/images/headshots/Ethan Huang.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "ian-su",
    name: "Ian Su",
    role: "Associate Consultant",
    category: "member",
    bio: "Hi! I'm Ian, a 2nd-year Business Economics major. Ask me anything about the recruitment process or life at ICG!",
    interests: ["Strategy", "Tennis", "Film"],
    photo: "/images/headshots/Ian Su.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "madison-lee",
    name: "Madison Lee",
    role: "Associate Consultant",
    category: "member",
    bio: "Hello! I'm Madison, a 2nd-year Management Science major. I'm passionate about organizational consulting and team dynamics.",
    interests: ["Leadership", "Dance", "Traveling"],
    photo: "/images/headshots/Madison Lee.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "megan-sinaga",
    name: "Megan Sinaga",
    role: "Associate Consultant",
    category: "member",
    bio: "Hey! I'm Megan, a 2nd-year Business Administration major. I love client projects and can't wait to share my consulting experience!",
    interests: ["Marketing", "Painting", "Yoga"],
    photo: "/images/headshots/Megan Sinaga.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "parav-salaniwal",
    name: "Parav Salaniwal",
    role: "Associate Consultant",
    category: "member",
    bio: "Hi! I'm Parav, a 2nd-year CS and Business Information Management major. I enjoy working on tech strategy engagements.",
    interests: ["Tech Strategy", "Cricket", "Cooking"],
    photo: "/images/headshots/Parav Salaniwal.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "rohan-bharti",
    name: "Rohan Bharti",
    role: "Associate Consultant",
    category: "member",
    bio: "Hey! I'm Rohan, a 2nd-year Economics and Data Science major. Always happy to chat about consulting and career development!",
    interests: ["Data", "Football", "Guitar"],
    photo: "/images/headshots/Rohan Bharti.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "sathvik-lagadapati",
    name: "Sathvik Lagadapati",
    role: "Associate Consultant",
    category: "member",
    bio: "Hi! I'm Sathvik, a 2nd-year Computer Science major. Excited to talk about how tech and consulting intersect.",
    interests: ["Technology", "Badminton", "Reading"],
    photo: "/images/headshots/Sathvik Lagadapati.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "sonia-wang",
    name: "Sonia Wang",
    role: "Associate Consultant",
    category: "member",
    bio: "Hello! I'm Sonia, a 2nd-year Business Administration major. I love collaborative projects and would love to connect with you!",
    interests: ["Strategy", "Cooking", "Pilates"],
    photo: "/images/headshots/Sonia Wang.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "vasavi-suresh",
    name: "Vasavi Suresh",
    role: "Associate Consultant",
    category: "member",
    bio: "Hi! I'm Vasavi, a 2nd-year Economics major. Passionate about sustainability consulting and social impact.",
    interests: ["Sustainability", "Volleyball", "Art"],
    photo: "/images/headshots/Vasavi Suresh.png",
    calendlyUrl: "https://calendly.com",
  },
  {
    id: "zach-bosa",
    name: "Zach Bosa",
    role: "Associate Consultant",
    category: "member",
    bio: "Hey! I'm Zach, a 2nd-year Business Administration major. I enjoy diving into market research and competitive analysis.",
    interests: ["Research", "Basketball", "Podcasts"],
    photo: "/images/headshots/Zach Bosa.png",
    calendlyUrl: "https://calendly.com",
  },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar() {
  const router = useRouter();
  const navItems = [
    { key: "home", label: "Home", icon: <HouseIcon />, href: "/applicant/dashboard" },
    { key: "applications", label: "Applications", icon: <PencilIcon />, href: "/applicant/dashboard" },
    { key: "coffee-chats", label: "Coffee Chats", icon: <UsersIcon />, href: "/applicant/dashboard/coffee-chats" },
  ] as const;

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
                item.key === "coffee-chats" ? "bg-[#f4f4f5]" : "hover:bg-[#f9fafb]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center justify-between w-[208px]">
        <div className="w-[45px] h-[45px] rounded-full bg-[#061c2a] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          JD
        </div>
        <button
          type="button"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/applicant/login");
            router.refresh();
          }}
          className="text-[#a1a1aa] hover:text-red-500 transition-colors"
          aria-label="Sign out"
        >
          <LogOutIcon />
        </button>
      </div>
    </aside>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({
  member,
  onLearnMore,
  index,
}: {
  member: Member;
  onLearnMore: (m: Member) => void;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div
      className="bg-white border border-[#e4e4e7] rounded-xl p-6 flex flex-col items-center gap-4 hover:shadow-[0_8px_28px_rgba(6,28,42,0.13)] hover:-translate-y-1 hover:scale-[1.03] transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Photo */}
      <button
        type="button"
        onClick={() => onLearnMore(member)}
        className="group relative w-[120px] h-[120px] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#e4e4e7] ring-offset-2 hover:ring-[#061c2a] cursor-pointer transition-all duration-200"
        aria-label={`View ${member.name}'s profile`}
      >
        {!imgError ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#061c2a] flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-[#061c2a]/0 group-hover:bg-[#061c2a]/30 transition-colors duration-200 flex items-center justify-center">
          <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">View</span>
        </div>
      </button>

      {/* Name & Role */}
      <div className="text-center">
        <p className="font-semibold text-[15px] text-[#111827] leading-tight">{member.name}</p>
        <p className="text-sm text-[#6b7280] mt-1">{member.role}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full">
        <button
          type="button"
          onClick={() => onLearnMore(member)}
          className="flex-1 h-9 border border-[#e4e4e7] rounded-lg text-sm font-medium text-[#374151] hover:border-[#061c2a] hover:text-[#061c2a] hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          Learn More
        </button>
        <a
          href={member.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex-1 h-9 bg-[#061c2a] rounded-lg text-sm font-medium text-white hover:bg-[#0d2f47] hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 overflow-hidden"
        >
          <CalendarIcon className="flex-shrink-0" />
          <span>Book</span>
          <span className="translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 text-xs">→</span>
        </a>
      </div>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────

function ProfileModal({
  member,
  onClose,
  onTagSearch,
}: {
  member: Member;
  onClose: () => void;
  onTagSearch?: (tag: string) => void;
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
          {/* Left: large photo */}
          <div className="relative w-[200px] flex-shrink-0">
            {!imgError ? (
              <Image
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-[#061c2a] flex items-center justify-center text-white text-4xl font-bold min-h-[260px]">
                {initials}
              </div>
            )}
          </div>

          {/* Right: info */}
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

            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              {member.interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => { onTagSearch?.(interest); handleClose(); }}
                  className="inline-flex items-center h-7 px-3 bg-[#f4f4f5] rounded-full text-xs font-medium text-[#374151] hover:bg-[#061c2a] hover:text-white transition-colors"
                  title={`Filter by "${interest}"`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {/* CTA */}
            <a
              href={member.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-11 w-full bg-[#061c2a] text-white text-sm font-medium rounded-lg hover:bg-[#0d2f47] transition-colors mt-auto"
            >
              <CalendarIcon />
              Schedule Coffee Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",      label: "All Members", icon: <UserCircleIcon /> },
  { key: "executive", label: "Executives",  icon: <BriefcaseIcon /> },
  { key: "director",  label: "Directors",   icon: <MegaphoneIcon /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoffeeChatsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

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

  const filtered = MEMBERS.filter((m) => {
    const matchesTab = activeTab === "all" || m.category === activeTab;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.interests.some((i) => i.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: MEMBERS.length,
    executive: MEMBERS.filter((m) => m.category === "executive").length,
    director: MEMBERS.filter((m) => m.category === "director").length,
  };

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

      <div className="flex min-h-screen bg-white font-sans">
        <Sidebar />

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

            {/* Heading */}
            <div className="flex items-baseline justify-between">
              <h1 className="font-bold text-[18px] leading-7 text-black">Coffee Chat Scheduler</h1>
              <p className="text-sm text-[#6b7280]">
                {search || activeTab !== "all"
                  ? `${filtered.length} of ${MEMBERS.length} members`
                  : `${MEMBERS.length} members`}
              </p>
            </div>

            {/* Tabs */}
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

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <UsersIcon className="text-[#d4d4d8] w-10 h-10 mb-3" />
                <p className="text-[#374151] font-medium">No members found</p>
                <p className="text-sm text-[#a1a1aa] mt-1">Try adjusting your search.</p>
              </div>
            ) : (
              <div
                key={`${activeTab}-${search}`}
                className="grid grid-cols-4 gap-5"
              >
                {filtered.map((member, i) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onLearnMore={setSelectedMember}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedMember && (
        <ProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onTagSearch={(tag) => {
            setSearch(tag);
            setActiveTab("all");
          }}
        />
      )}
    </>
  );
}
