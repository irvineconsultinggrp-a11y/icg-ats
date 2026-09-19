"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { hydrateFormFromRow } from "@/lib/applicants/form";
import { buildSlotId, GROUP_INTERVIEW_DAYS } from "@/lib/group-interview/sessions";
import { canApplyToPosition, formatPositionTitle, getPositionById } from "@/lib/positions";
import type { ApplicantRow } from "@/lib/types/database";

// --- Icons ---

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
  disabled = false,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-11 w-full border border-[#e4e4e7] rounded px-4 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition disabled:bg-[#f9fafb] disabled:text-[#6b7280]"
    />
  );
}

function TextArea({
  id,
  placeholder,
  value,
  onChange,
  rows = 3,
  disabled = false,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      disabled={disabled}
      className="w-full border border-[#e4e4e7] rounded px-4 py-2.5 text-base text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition resize-none disabled:bg-[#f9fafb] disabled:text-[#6b7280]"
    />
  );
}

// --- Tab types ---

type Tab = "information" | "availability";
const TABS: { key: Tab; label: string }[] = [
  { key: "information", label: "Information" },
  { key: "availability", label: "Availability" },
];

// --- Main Page ---

export default function ApplicationForm() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;
  const position = getPositionById(positionId);
  const positionTitle = position?.title ?? formatPositionTitle(positionId);

  const [activeTab, setActiveTab] = useState<Tab>("information");
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [existingResumeName, setExistingResumeName] = useState<string | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [phone, setPhone] = useState("");
  const [majors, setMajors] = useState("");
  const [minors, setMinors] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [commitments, setCommitments] = useState("");
  const [infoSession, setInfoSession] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const tabIndex = TABS.findIndex((t) => t.key === activeTab);
  const isEditMode = Boolean(applicationId);
  const formTitle = readOnly
    ? "View Application"
    : isEditMode
      ? "Edit Application"
      : "Application Form";

  useEffect(() => {
    void (async () => {
      setLoadingApplication(true);
      try {
        const res = await fetch(`/api/applicants/mine?position=${encodeURIComponent(positionId)}`, {
          credentials: "include",
        });
        const body = (await res.json()) as {
          data?: ApplicantRow | null;
          canEdit?: boolean;
        };

        if (res.ok && body.data) {
          const hydrated = hydrateFormFromRow(body.data);
          setApplicationId(hydrated.applicationId);
          setFirstName(hydrated.firstName);
          setLastName(hydrated.lastName);
          setEmail(hydrated.email);
          setGradYear(hydrated.gradYear);
          setPhone(hydrated.phone);
          setMajors(hydrated.majors);
          setMinors(hydrated.minors);
          setLinkedinUrl(hydrated.linkedinUrl);
          setCommitments(hydrated.commitments);
          setInfoSession(hydrated.infoSession);
          setSelectedSlots(hydrated.selectedSlots);
          if (hydrated.existingResumePath) {
            setExistingResumeName(hydrated.existingResumePath.split("/").pop() ?? "Resume on file");
          }
          setReadOnly(!body.canEdit);
        } else if (!canApplyToPosition(positionId)) {
          setReadOnly(true);
        }
      } catch {
        if (!canApplyToPosition(positionId)) setReadOnly(true);
      } finally {
        setLoadingApplication(false);
      }
    })();
  }, [positionId]);

  function buildFormData() {
    const formData = new FormData();
    formData.set("position", positionId);
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("email", email);
    formData.set("gradYear", gradYear);
    formData.set("phone", phone);
    formData.set("majors", majors);
    formData.set("minors", minors);
    formData.set("linkedinUrl", linkedinUrl);
    formData.set("commitments", commitments);
    formData.set("infoSession", infoSession);
    formData.set("availableSlots", JSON.stringify(Array.from(selectedSlots)));
    if (resumeFile) {
      formData.set("resume", resumeFile);
    }
    return formData;
  }

  function toggleSlot(slotKey: string) {
    if (readOnly) return;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotKey)) next.delete(slotKey);
      else next.add(slotKey);
      return next;
    });
  }

  function handleFileInput(file: File | undefined | null) {
    if (readOnly) return;
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

  async function handleSubmit() {
    if (readOnly) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const formData = buildFormData();
      const url = applicationId ? `/api/applicants/${applicationId}` : "/api/applicants";
      const method = applicationId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/applicant/login");
        return;
      }

      const body = (await res.json()) as { error?: string; applicationId?: string };
      if (!res.ok) {
        setSubmitError(body.error ?? "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingApplication) {
    return (
      <main className="flex-1 flex items-center justify-center px-8 py-8">
        <p className="text-[#6b7280]">Loading application…</p>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#061c2a] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                {isEditMode ? "Application Updated!" : "Application Submitted!"}
              </h1>
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
    );
  }

  return (
    <main className="flex-1 px-8 py-[99px] overflow-y-auto">
        <div className="max-w-[1079px] flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[30px] font-bold leading-[38px] text-black">{formTitle}</h1>
            <p className="text-lg font-medium leading-7 text-[#a1a1aa]">{positionTitle}</p>
            {position && (
              <p className="text-sm text-[#6b7280]">
                Deadline: {position.closeDate}
                {readOnly && isEditMode && " — editing is closed"}
              </p>
            )}
          </div>

          {readOnly && (
            <div className="rounded-md border border-[#e4e4e7] bg-[#f9fafb] px-4 py-3 text-sm text-[#52525b]">
              {isEditMode
                ? "This application has been submitted and the deadline has passed. You can review your responses below but cannot make changes."
                : "Applications for this position are closed."}
            </div>
          )}

          {!readOnly && isEditMode && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              You&apos;ve already applied for this position. Update your answers below and save before the deadline.
            </div>
          )}

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
          <fieldset disabled={readOnly} className="contents min-w-0">
          {activeTab === "information" && (
            <div className="bg-white border border-[#e4e4e7] rounded-md p-8">
              <div className="flex flex-col gap-[46px]">
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

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="email" required>Email</FieldLabel>
                  <TextInput id="email" type="email" placeholder="Enter Email" value={email} onChange={setEmail} />
                </div>

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

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="linkedinUrl" required>LinkedIn URL</FieldLabel>
                  <TextInput id="linkedinUrl" placeholder="Start typing ..." value={linkedinUrl} onChange={setLinkedinUrl} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="commitments" required>
                    ICG is a long-term, high-effort commitment. List all current/potential weekly commitments (classes, work, internships, clubs, applications). Disclose, with accuracy, the total hours you can realistically dedicate to ICG, as members are held accountable.
                  </FieldLabel>
                  <TextArea id="commitments" placeholder="Start typing ..." value={commitments} onChange={setCommitments} rows={3} />
                </div>

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
                  ) : existingResumeName ? (
                    <p className="text-sm font-medium text-[#061c2a]">{existingResumeName}</p>
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

              {GROUP_INTERVIEW_DAYS.map((day) => (
                <div key={day.date} className="flex flex-col gap-2">
                  <p className="text-sm text-[#52525b]">{day.date}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {day.slots.map((slot) => {
                      const slotKey = buildSlotId(day.date, slot);
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
          </fieldset>

          {/* Navigation buttons */}
          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
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
            ) : readOnly ? (
              <Link
                href="/applicant/dashboard"
                className="flex-1 h-[62px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors flex items-center justify-center"
              >
                Back to Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="flex-1 h-[62px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving…" : isEditMode ? "Save Changes" : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </main>
  );
}
