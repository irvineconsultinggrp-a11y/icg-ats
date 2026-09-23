"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/utils/supabase/client";

function OfficerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() => {
    if (searchParams.get("error") === "auth") {
      return "Sign in failed. Please try again.";
    }
    if (searchParams.get("error") === "role") {
      return "This account does not have officer access.";
    }
    return "";
  });
  const [success] = useState(() => {
    if (searchParams.get("created") === "1") {
      return "Account created. Sign in with your email and password.";
    }
    if (searchParams.get("confirmed") === "1") {
      return "You can sign in now.";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const notConfirmed = /email not confirmed|not confirmed|confirm your email/i.test(
          signInError.message,
        );
        setError(
          notConfirmed
            ? "Please confirm your email first — check your inbox for the confirmation link we sent when you signed up."
            : signInError.message,
        );
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.role !== "officer") {
        await supabase.auth.signOut();
        setError(
          "This account does not have officer access. Use Officer Sign Up with your team invite code (not Applicant Sign Up).",
        );
        return;
      }

      router.push("/officer/dashboard");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not reach the server. If this says “Failed to fetch”, check Vercel env vars and redeploy.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel — dark navy cityscape */}
      <div className="relative w-[36%] min-w-[280px] bg-[#061c2a] overflow-hidden flex-shrink-0">
        <Image
          src="/images/cityscape.png"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />

        <div className="relative z-10 flex flex-col gap-3 px-12 pt-20">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/images/icg-icon-white.png"
              alt="ICG icon"
              fill
              className="object-contain"
            />
          </div>

          <h1 className="text-white text-4xl font-semibold leading-[44px] tracking-tight mt-2">
            Officer
            <br />
            Login
          </h1>

          <p className="text-white text-lg font-normal leading-7 max-w-xs">
            Sign in to access the ICG recruitment dashboard.
          </p>
        </div>

        <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm leading-5 px-4">
          © Irvine Consulting Group 2026. All Rights Reserved
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[480px] flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-sm text-[#6b7280] hover:text-[#061c2a] transition-colors flex items-center gap-1 mb-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </Link>
            <h2 className="text-[#061c2a] text-3xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-[#6b7280] text-base">
              Enter your officer credentials to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#111827]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@uci.edu"
                className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#111827]"
                >
                  Password
                </label>
                <Link
                  href="/officer/forgot-password"
                  className="text-sm text-[#061c2a] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-[52px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-4 pr-12 text-[#111827] placeholder-[#9ca3af] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
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
            </div>

            {success && (
              <div className="flex items-center gap-2 rounded-[8px] bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
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
              className="mt-1 flex items-center justify-center w-full h-[54px] bg-[#061c2a] text-white text-base font-medium rounded-[8px] hover:bg-[#0d2f47] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-sm text-[#6b7280] text-center">
            Don&apos;t have an officer account?{" "}
            <Link href="/officer/signup" className="text-[#061c2a] font-medium hover:underline">
              Create one with an invite code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OfficerLogin() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#6b7280]">
          Loading…
        </div>
      }
    >
      <OfficerLoginForm />
    </Suspense>
  );
}
