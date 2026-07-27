"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function formatMemberSince(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function deriveName(email: string, fullName?: string): { displayName: string; initials: string } {
  const local = email.split("@")[0] ?? "officer";
  const parts = local.replace(/[._-]/g, " ").split(/\s+/).filter(Boolean);
  const displayName =
    fullName?.trim() ||
    (parts.length >= 2 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0] ?? "Officer");
  const source = fullName?.trim() ? fullName.trim().split(/\s+/) : parts;
  const initials =
    source.length >= 2
      ? `${source[0][0] ?? ""}${source[source.length - 1][0] ?? ""}`.toUpperCase()
      : (source[0]?.slice(0, 2) ?? "O").toUpperCase();
  return { displayName, initials };
}

export function OfficerAccountMenu() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState<string | undefined>(undefined);
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.full_name as string | undefined);
      setMemberSince(formatMemberSince(user.created_at));
    })();
  }, []);

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

  const { displayName, initials } = deriveName(email, fullName);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/officer/login");
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
              <p className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Email</p>
              <p className="text-sm font-medium text-[#111827] mt-1 break-all">{email || "—"}</p>
            </div>
            <div className="rounded-lg border border-[#e4e4e7] bg-[#f9fafb] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Role</p>
              <p className="text-sm font-medium text-[#111827] mt-1">Officer</p>
            </div>
            <div className="rounded-lg border border-[#e4e4e7] bg-[#f9fafb] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">Member since</p>
              <p className="text-sm font-medium text-[#111827] mt-1">{memberSince}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e4e4e7] px-6 py-4 bg-white">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="h-11 w-full rounded-lg border border-[#e4e4e7] text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors flex items-center justify-center gap-2"
          >
            <LogOutIcon />
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
        className="flex items-center gap-3 min-w-0 w-full rounded-lg p-1 -m-1 hover:bg-[#f9fafb] transition-colors text-left"
        aria-label="Open account menu"
        title="Account"
      >
        <div className="w-[40px] h-[40px] rounded-full bg-[#061c2a] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate">{displayName}</p>
          <p className="text-xs text-[#a1a1aa] truncate">{email || "Signed in"}</p>
        </div>
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
