"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { formatPositionTitle } from "@/lib/positions";
import type { ApplicantRow } from "@/lib/types/database";
import { createClient } from "@/utils/supabase/client";

function XIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function getInitials(
  first?: string | null,
  last?: string | null,
  email?: string | null,
) {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  if (b) return b.toUpperCase();

  const local = email?.split("@")[0]?.replace(/[^a-zA-Z]/g, "") ?? "";
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  if (local.length === 1) return local.toUpperCase();
  return "AP";
}

function formatMemberSince(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function AccountMenu() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState("");
  const [applications, setApplications] = useState<ApplicantRow[]>([]);

  const initials = getInitials(firstName, lastName, email);
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Applicant";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");
      setMemberSince(formatMemberSince(user.created_at));

      const meta = user.user_metadata as {
        first_name?: string;
        last_name?: string;
        firstName?: string;
        lastName?: string;
      };

      let first = meta.first_name ?? meta.firstName ?? null;
      let last = meta.last_name ?? meta.lastName ?? null;

      try {
        const res = await fetch("/api/applicants/mine", { credentials: "include" });
        const body = (await res.json()) as { data?: ApplicantRow[] };
        if (res.ok) {
          const apps = body.data ?? [];
          setApplications(apps);
          if (!first && apps[0]?.first_name) first = apps[0].first_name;
          if (!last && apps[0]?.last_name) last = apps[0].last_name;
        }
      } catch {
        setApplications([]);
      }

      setFirstName(first);
      setLastName(last);
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    if (!open) return;

    async function refreshApplications() {
      setLoading(true);
      try {
        const res = await fetch("/api/applicants/mine", { credentials: "include" });
        const body = (await res.json()) as { data?: ApplicantRow[] };
        if (res.ok) setApplications(body.data ?? []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }

    void refreshApplications();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/applicant/login");
    router.refresh();
  }

  const panel = open ? (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[#061c2a]/40 backdrop-blur-[2px]"
        aria-label="Close account menu"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-[201] w-full max-w-[380px] h-full bg-white shadow-2xl flex flex-col isolate">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4e4e7] bg-white">
          <h2 className="text-lg font-semibold text-[#111827]">Account</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[#a1a1aa] hover:text-[#374151] p-1 rounded-md hover:bg-[#f4f4f5]"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-[#111827] truncate">{displayName}</p>
              <p className="text-sm text-[#6b7280] truncate">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-[#e4e4e7] bg-[#f9fafb] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Member since</p>
              <p className="text-sm font-medium text-[#111827] mt-1">{memberSince}</p>
            </div>
            <div className="rounded-lg border border-[#e4e4e7] bg-[#f9fafb] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Applications submitted</p>
              <p className="text-sm font-medium text-[#111827] mt-1">{applications.length}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111827] mb-3">Your applications</p>
            {loading ? (
              <p className="text-sm text-[#a1a1aa]">Loading…</p>
            ) : applications.length === 0 ? (
              <p className="text-sm text-[#a1a1aa]">No applications submitted yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {applications.map((app) => (
                  <li key={app.id}>
                    <Link
                      href={`/applicant/dashboard/apply/${app.position}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg border border-[#e4e4e7] bg-white px-4 py-3 hover:border-[#061c2a] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {formatPositionTitle(app.position)}
                        </p>
                        <p className="text-xs text-[#6b7280] mt-0.5 capitalize">{app.app_status}</p>
                      </div>
                      <span className="text-xs font-medium text-[#061c2a]">Open</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-[#e4e4e7] px-6 py-4 bg-white">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="h-11 w-full rounded-lg border border-[#e4e4e7] text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-[45px] h-[45px] rounded-full bg-[#061c2a] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 hover:ring-2 hover:ring-[#061c2a]/30 transition-all"
        aria-label="Open account menu"
        title="Account"
      >
        {initials}
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
