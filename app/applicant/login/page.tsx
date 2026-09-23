"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { APPLICANT_EMAIL_ERROR, isApplicantEmailAllowed } from "@/lib/auth/applicant-email";
import { signInWithPasswordNoEmailConfirm } from "@/lib/auth/portal-sign-in";
import { APPLICANT_DASHBOARD, ensureApplicantRole } from "@/utils/auth/applicant";
import { createClient } from "@/utils/supabase/client";

function ApplicantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(() => {
    if (searchParams.get("error") === "auth") return "Sign in failed. Please try again.";
    if (searchParams.get("error") === "role") {
      return "Your account does not have applicant access. Sign in with an applicant account or create one.";
    }
    if (searchParams.get("error") === "email_domain") {
      return APPLICANT_EMAIL_ERROR;
    }
    return "";
  });
  const [success] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingSession(false);
        return;
      }

      const role = user.app_metadata?.role;
      if (role === "applicant") {
        router.replace(searchParams.get("next")?.startsWith("/applicant/")
          ? searchParams.get("next")!
          : APPLICANT_DASHBOARD);
        return;
      }

      if (role === "officer") {
        setError("You are signed in as an officer. Sign out first to use the applicant portal.");
        setCheckingSession(false);
        return;
      }

      const ok = await ensureApplicantRole();
      if (ok) {
        router.replace(searchParams.get("next")?.startsWith("/applicant/")
          ? searchParams.get("next")!
          : APPLICANT_DASHBOARD);
        return;
      }

      setCheckingSession(false);
    }

    void checkSession();
  }, [router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isApplicantEmailAllowed(email)) {
      setError(APPLICANT_EMAIL_ERROR);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await signInWithPasswordNoEmailConfirm(
      supabase,
      email,
      password,
      "applicant",
    );
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const roleOk = await ensureApplicantRole();
    if (!roleOk) {
      setError("Your account does not have applicant access.");
      return;
    }

    const next = searchParams.get("next");
    router.push(next?.startsWith("/applicant/") ? next : APPLICANT_DASHBOARD);
    router.refresh();
  }

  return (
    <>
      {checkingSession ? (
        <div className="w-full h-48 flex items-center justify-center text-[#a1a1aa]">
          Loading…
        </div>
      ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#111827] flex items-center gap-1">
          Email
          <span className="text-[#991919] text-xs font-bold">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="h-[54px] w-full rounded-[4px] border border-[#e4e4e7] bg-white px-5 text-[#111827] placeholder-[#a1a1aa] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#111827] flex items-center gap-1">
          Password
          <span className="text-[#991919] text-xs font-bold">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="h-[54px] w-full rounded-[4px] border border-[#e4e4e7] bg-white px-5 pr-12 text-[#111827] placeholder-[#a1a1aa] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#374151] transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <div className="flex justify-end">
          <Link
            href="/applicant/forgot-password"
            className="text-[15px] text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 rounded-[4px] bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-[4px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full h-[62px] bg-[#061c2a] text-white text-lg font-medium rounded-[5px] hover:bg-[#0d2f47] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Continue
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>

      {/* Sign-up link */}
      <p className="text-center text-sm text-[#a1a1aa]">
        Don&apos;t have an account?{" "}
        <Link
          href="/applicant/signup"
          className="text-[#061c2a] font-normal underline hover:text-[#0d2f47] transition-colors"
        >
          Create one.
        </Link>
      </p>
    </form>
      )}
    </>
  );
}

export default function ApplicantLogin() {
  return (
    <AuthSplitLayout
      wide
      title={
        <>
          ICG Application
          <br />
          Portal
        </>
      }
      subtitle="Sign in with the email and password you used when you applied."
    >
      <div className="w-full flex flex-col gap-4">
        <Link
          href="/"
          className="text-sm text-[#6b7280] hover:text-[#061c2a] transition-colors flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <div className="w-full border border-[#e4e4e7] rounded-[20px] sm:rounded-[26px] p-6 sm:p-10 lg:p-12 flex flex-col items-center gap-8 sm:gap-10">
          <div className="relative w-full max-w-[360px] h-[100px] sm:h-[145px]">
            <Image
              src="/images/icg-logo.png"
              alt="Irvine Consulting Group"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Suspense
            fallback={
              <div className="w-full h-48 flex items-center justify-center text-[#a1a1aa]">
                Loading…
              </div>
            }
          >
            <ApplicantLoginForm />
          </Suspense>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
