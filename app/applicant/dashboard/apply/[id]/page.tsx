"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";

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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// --- Sidebar ---

function Sidebar({ active }: { active: "home" | "applications" | "coffee-chats" }) {
  const navItems = [
    { key: "home" as const, label: "Home", icon: <HouseIcon />, href: "/applicant/dashboard" },
    { key: "applications" as const, label: "Applications", icon: <PencilIcon />, href: "/applicant/dashboard" },
    { key: "coffee-chats" as const, label: "Coffee Chats", icon: <UsersIcon />, href: "/applicant/dashboard" },
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
      <div className="flex items-center justify-between w-[208px]">
        <div className="w-[45px] h-[45px] rounded-full bg-[#061c2a] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          JD
        </div>
        <button type="button" className="text-[#a1a1aa] hover:text-[#374151] transition-colors" aria-label="Collapse sidebar">
          <PanelLeftCloseIcon />
        </button>
      </div>
    </aside>
  );
}

// --- Form field helpers ---

function FieldLabel({ htmlFor, children, required, optional }: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium text-black">
      {children}
      {required && <span className="text-[#991919] text-[10px] font-normal">*</span>}
      {optional && (
        <span className="bg-[#f4f4f5] text-[#27272a] text-[10px] px-1 py-0.5 rounded">optional</span>
      )}
    </label>
  );
}

function TextInput({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full border border-[#e4e4e7] rounded px-4 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
    />
  );
}

function TextArea({
  id,
  placeholder,
  value,
  onChange,
  rows = 3,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full border border-[#e4e4e7] rounded px-4 py-2.5 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none"
    />
  );
}

// --- Tab types ---

type Tab = "profile" | "short-answer" | "availability";
const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "short-answer", label: "Short Answer" },
  { key: "availability", label: "Availability" },
];

// --- Availability data ---

const AVAILABILITY_DAYS = [
  {
    date: "Friday, September 18th",
    slots: [
      "9:00AM - 10:00AM",
      "10:00AM - 11:00AM",
      "11:00AM - 12:00PM",
      "12:00PM - 1:00PM",
      "1:00PM - 2:00PM",
      "2:00PM - 3:00PM",
      "3:00PM - 4:00PM",
      "4:00PM - 5:00PM",
    ],
  },
  {
    date: "Saturday, September 19th",
    slots: [
      "9:00AM - 10:00AM",
      "10:00AM - 11:00AM",
      "11:00AM - 12:00PM",
      "12:00PM - 1:00PM",
      "1:00PM - 2:00PM",
      "2:00PM - 3:00PM",
      "3:00PM - 4:00PM",
      "4:00PM - 5:00PM",
    ],
  },
  {
    date: "Sunday, September 20th",
    slots: [
      "9:00AM - 10:00AM",
      "10:00AM - 11:00AM",
      "11:00AM - 12:00PM",
      "12:00PM - 1:00PM",
      "1:00PM - 2:00PM",
      "2:00PM - 3:00PM",
      "3:00PM - 4:00PM",
      "4:00PM - 5:00PM",
    ],
  },
];

// --- Main Page ---

export default function ApplicationForm() {
  const params = useParams();
  const positionId = params.id as string;
  const positionTitle = positionId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [phone, setPhone] = useState("");
  const [majors, setMajors] = useState("");
  const [minors, setMinors] = useState("");

  // Short answer fields
  const [careerGoals, setCareerGoals] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [commitments, setCommitments] = useState("");
  const [infoSession, setInfoSession] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const [submitted, setSubmitted] = useState(false);

  const tabIndex = TABS.findIndex((t) => t.key === activeTab);

  function toggleSlot(slotKey: string) {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotKey)) next.delete(slotKey);
      else next.add(slotKey);
      return next;
    });
  }

  function handleFileInput(file: File | undefined | null) {
    if (!file) return;
    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      setResumeFile(file);
    }
  }

  function handleNext() {
    if (tabIndex < TABS.length - 1) {
      setActiveTab(TABS[tabIndex + 1].key);
    }
  }

  function handleBack() {
    if (tabIndex > 0) {
      setActiveTab(TABS[tabIndex - 1].key);
    }
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-white font-sans">
        <Sidebar active="home" />
        <main className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#061c2a] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Application Submitted!</h1>
              <p className="text-[#52525b] text-lg">
                Thank you for applying for the{" "}
                <span className="font-semibold text-[#061c2a]">{positionTitle}</span> position.
              </p>
              <p className="text-[#a1a1aa] text-sm mt-2">
                We&apos;ll review your application and get back to you soon.
              </p>
            </div>
            <Link
              href="/applicant/dashboard"
              className="flex items-center justify-center h-[62px] px-10 bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar active="home" />

      <main className="flex-1 px-8 py-[99px] overflow-y-auto">
        <div className="max-w-[1079px] flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[30px] font-bold leading-[38px] text-black">Application Form</h1>
            <p className="text-lg font-medium leading-7 text-[#a1a1aa]">{positionTitle}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#e4e4e7] flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-[18px] py-2 h-11 text-base transition-colors relative ${
                  activeTab === tab.key
                    ? "text-black font-normal border-b-2 border-[#18181b] -mb-px"
                    : "text-[#52525b] hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "profile" && (
            <div className="bg-white border border-[#e4e4e7] rounded-md p-8">
              <div className="flex flex-col gap-[46px]">
                {/* Row 1: First Name + Last Name */}
                <div className="flex gap-[35px]">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <FieldLabel htmlFor="firstName" required>First Name</FieldLabel>
                    <TextInput id="firstName" placeholder="Enter first name" value={firstName} onChange={setFirstName} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <FieldLabel htmlFor="lastName" required>Last Name</FieldLabel>
                    <TextInput id="lastName" placeholder="Enter last name" value={lastName} onChange={setLastName} />
                  </div>
                </div>

                {/* Row 2: Email */}
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="email" required>Email</FieldLabel>
                  <TextInput id="email" type="email" placeholder="Enter Email" value={email} onChange={setEmail} />
                </div>

                {/* Row 3: Grad Year + Phone */}
                <div className="flex gap-[35px]">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <FieldLabel htmlFor="gradYear">Grad Year</FieldLabel>
                    <div className="relative">
                      <input
                        id="gradYear"
                        type="number"
                        placeholder="2XXX"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        min={2020}
                        max={2035}
                        className="h-11 w-full border border-[#e4e4e7] rounded px-4 pr-8 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-[#e4e4e7]">
                        <button
                          type="button"
                          onClick={() => setGradYear((v) => String(Math.min(2035, Number(v || 2024) + 1)))}
                          className="flex-1 flex items-center justify-center px-1.5 border-b border-[#e4e4e7] hover:bg-[#f4f4f5] transition-colors rounded-tr"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="m18 15-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGradYear((v) => String(Math.max(2020, Number(v || 2026) - 1)))}
                          className="flex-1 flex items-center justify-center px-1.5 hover:bg-[#f4f4f5] transition-colors rounded-br"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <FieldLabel htmlFor="phone" required>Phone</FieldLabel>
                    <TextInput id="phone" type="tel" placeholder="(XXX) XXX-XXXX" value={phone} onChange={setPhone} />
                  </div>
                </div>

                {/* Row 4: Major(s) + Minor(s) */}
                <div className="flex gap-[35px]">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <FieldLabel htmlFor="majors" required>Major(s)</FieldLabel>
                    <TextInput id="majors" placeholder="e.g. Computer Science" value={majors} onChange={setMajors} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <FieldLabel htmlFor="minors" optional>Minor(s)</FieldLabel>
                    <TextInput id="minors" placeholder="e.g. Mathematics" value={minors} onChange={setMinors} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "short-answer" && (
            <div className="bg-white border border-[#e4e4e7] rounded-md p-8 flex flex-col gap-8">
              {/* Career goals */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="careerGoals" required>
                  Please provide a brief overview of your career goals — it is completely okay if you are still exploring!
                </FieldLabel>
                <TextArea id="careerGoals" placeholder="Start typing ..." value={careerGoals} onChange={setCareerGoals} rows={3} />
              </div>

              {/* LinkedIn */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="linkedinUrl" required>LinkedIn URL</FieldLabel>
                <TextInput id="linkedinUrl" placeholder="Start typing ..." value={linkedinUrl} onChange={setLinkedinUrl} />
              </div>

              {/* Commitments */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="commitments" required>
                  ICG is a long-term, high-effort commitment. List all current/potential weekly commitments (classes, work, internships, clubs, applications). Disclose, with accuracy, the total hours you can realistically dedicate to ICG, as members are held accountable. Intentional omission may lead to removal.
                </FieldLabel>
                <TextArea id="commitments" placeholder="Start typing ..." value={commitments} onChange={setCommitments} rows={3} />
              </div>

              {/* Info session */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="infoSession">Did you attend the information session</FieldLabel>
                <div className="relative">
                  <select
                    id="infoSession"
                    value={infoSession}
                    onChange={(e) => setInfoSession(e.target.value)}
                    className="h-12 w-full border border-[#e4e4e7] rounded px-4 pr-10 text-base text-[#52525b] bg-white outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition appearance-none"
                  >
                    <option value="" disabled>Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none" />
                </div>
              </div>

              {/* Resume upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileInput(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-md h-[158px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragOver ? "border-[#061c2a] bg-[#f4f4f5]" : "border-[#e4e4e7] hover:border-[#a1a1aa]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFileInput(e.target.files?.[0])}
                />
                <UploadIcon className="text-[#52525b]" />
                {resumeFile ? (
                  <p className="text-sm font-medium text-[#061c2a]">{resumeFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-black">
                      Drag and drop a <strong>PDF of your resume</strong>
                    </p>
                    <p className="text-sm text-black">.png, .jpg up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "availability" && (
            <div className="bg-white border border-[#e4e4e7] rounded-md p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] font-semibold text-black leading-7">Select Your Availability</h2>
                <p className="text-sm text-[#52525b]">
                  Please select all the times you are available for Round 1 and Round 2 interviews.
                </p>
              </div>

              {AVAILABILITY_DAYS.map((day) => (
                <div key={day.date} className="flex flex-col gap-2">
                  <p className="text-sm text-[#52525b]">{day.date}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {day.slots.map((slot) => {
                      const slotKey = `${day.date}::${slot}`;
                      const checked = selectedSlots.has(slotKey);
                      return (
                        <button
                          key={slotKey}
                          type="button"
                          onClick={() => toggleSlot(slotKey)}
                          className={`flex items-center justify-between h-14 px-4 border rounded text-sm transition-colors ${
                            checked
                              ? "border-[#061c2a] bg-[#061c2a]/5 text-[#061c2a] font-medium"
                              : "border-[#e4e4e7] text-[#27272a] hover:border-[#a1a1aa]"
                          }`}
                        >
                          <span>{slot}</span>
                          <span
                            className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                              checked ? "border-[#061c2a] bg-[#061c2a]" : "border-[#d4d4d8]"
                            }`}
                          >
                            {checked && (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-[498px] items-center">
            {tabIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 h-[62px] border-[1.3px] border-[#e4e4e7] rounded-[5px] text-[#27272a] text-lg font-medium hover:bg-[#f9fafb] transition-colors"
              >
                Back
              </button>
            ) : (
              <div className="flex-1" />
            )}

            {tabIndex < TABS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-[62px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-[62px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
