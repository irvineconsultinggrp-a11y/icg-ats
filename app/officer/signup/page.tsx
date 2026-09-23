"use client";

import Link from "next/link";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { useState } from "react";
export default function OfficerSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/officer-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, code }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setLoading(false);
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create your account.");
        return;
      }
      window.location.href = "/officer/login?created=1";
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <AuthSplitLayout
      title={
        <>
          Officer
          <br />
          Sign Up
        </>
      }
      subtitle="Create an officer account with your team's invite code."
    >
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Link
              href="/officer/login"
              className="text-sm text-[#6b7280] hover:text-[#061c2a] transition-colors flex items-center gap-1 mb-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to sign in
            </Link>
            <h2 className="text-[#061c2a] text-3xl font-semibold tracking-tight">Create officer account</h2>
            <p className="text-[#6b7280] text-base">Enter the invite code your team shared with you.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-[#111827]">First name</label>
                <input
                  id="firstName" type="text" required value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} placeholder="Jane"
                  className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-[#111827]">Last name</label>
                <input
                  id="lastName" type="text" required value={lastName}
                  onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                  className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#111827]">Email address</label>
              <input
                id="email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@uci.edu"
                className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#111827]">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 pr-12 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
                <button
                  type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors text-xs font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#111827]">Confirm password</label>
              <input
                id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="code" className="text-sm font-medium text-[#111827]">Officer invite code</label>
              <input
                id="code" type="text" required value={code}
                onChange={(e) => setCode(e.target.value)} placeholder="Enter the code your team shared"
                className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="mt-1 flex items-center justify-center w-full h-[54px] bg-[#061c2a] text-white text-base font-medium rounded-[8px] hover:bg-[#0d2f47] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
    </AuthSplitLayout>
  );
}
