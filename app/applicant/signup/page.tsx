"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OAuthButtons } from "@/components/applicant/oauth-buttons";
import { APPLICANT_EMAIL_ERROR, isApplicantEmailAllowed } from "@/lib/auth/applicant-email";
import { ensureApplicantRole, signUpWithPassword } from "@/utils/auth/applicant";

export default function ApplicantSignup() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

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

    if (!isApplicantEmailAllowed(email)) {
      setError(APPLICANT_EMAIL_ERROR);
      return;
    }

    setLoading(true);
    const { error: signUpError, data } = await signUpWithPassword(email, password, {
      firstName,
      lastName,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Supabase returns a session immediately when email confirmation is disabled,
    // otherwise data.session is null and we show the confirm-email message.
    if (data.session) {
      await ensureApplicantRole();
      router.push("/applicant/dashboard");
      router.refresh();
    } else {
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex font-sans">
        <div className="relative w-[36%] min-w-[280px] bg-[#061c2a] overflow-hidden flex-shrink-0">
          <Image src="/images/cityscape.png" alt="" fill className="object-cover opacity-20" priority />
          <div className="relative z-10 flex flex-col gap-3 px-12 pt-20">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image src="/images/icg-icon-white.png" alt="ICG icon" fill className="object-contain" />
            </div>
            <h1 className="text-white text-4xl font-semibold leading-[44px] tracking-tight mt-2">
              ICG Application
              <br />
              Portal
            </h1>
            <p className="text-white text-lg font-normal leading-7 max-w-xs">
              One last step — check your inbox to confirm your email.
            </p>
          </div>
          <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm leading-5 px-4">
            © Irvine Consulting Group 2026. All Rights Reserved
          </p>
        </div>

        <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[480px] flex flex-col items-center gap-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[#061c2a] text-2xl font-semibold tracking-tight">Check your email</h2>
              <p className="text-[#6b7280] text-base leading-relaxed">
                We sent a confirmation link to <span className="font-medium text-[#111827]">{email}</span>.
                Click it to activate your account and sign in.
              </p>
            </div>
            <Link
              href="/applicant/login"
              className="text-[#061c2a] text-sm font-medium underline hover:text-[#0d2f47] transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel */}
      <div className="relative w-[36%] min-w-[280px] bg-[#061c2a] overflow-hidden flex-shrink-0">
        <Image src="/images/cityscape.png" alt="" fill className="object-cover opacity-20" priority />
        <div className="relative z-10 flex flex-col gap-3 px-12 pt-20">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image src="/images/icg-icon-white.png" alt="ICG icon" fill className="object-contain" />
          </div>
          <h1 className="text-white text-4xl font-semibold leading-[44px] tracking-tight mt-2">
            ICG Application
            <br />
            Portal
          </h1>
          <p className="text-white text-lg font-normal leading-7 max-w-xs">
            Create an account to start your application.
          </p>
        </div>
        <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm leading-5 px-4">
          © Irvine Consulting Group 2026. All Rights Reserved
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-[540px] border border-[#e4e4e7] rounded-[26px] p-12 flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="relative w-full max-w-[300px] h-[120px]">
            <Image src="/images/icg-logo.png" alt="Irvine Consulting Group" fill className="object-contain" priority />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            {/* Name row */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="firstName" className="text-sm font-medium text-[#111827] flex items-center gap-1">
                  First name
                  <span className="text-[#991919] text-xs font-bold">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="h-[54px] w-full rounded-[4px] border border-[#e4e4e7] bg-white px-5 text-[#111827] placeholder-[#a1a1aa] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="lastName" className="text-sm font-medium text-[#111827] flex items-center gap-1">
                  Last name
                  <span className="text-[#991919] text-xs font-bold">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="h-[54px] w-full rounded-[4px] border border-[#e4e4e7] bg-white px-5 text-[#111827] placeholder-[#a1a1aa] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#111827] flex items-center gap-1">
                Confirm password
                <span className="text-[#991919] text-xs font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-[54px] w-full rounded-[4px] border border-[#e4e4e7] bg-white px-5 pr-12 text-[#111827] placeholder-[#a1a1aa] text-base outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#374151] transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
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

            {/* Error */}
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
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e4e4e7]" />
              <span className="text-sm text-[#a1a1aa]">or continue with</span>
              <div className="flex-1 h-px bg-[#e4e4e7]" />
            </div>

            {/* OAuth */}
            <OAuthButtons disabled={loading} onError={setError} />

            {/* Sign-in link */}
            <p className="text-center text-sm text-[#a1a1aa]">
              Already have an account?{" "}
              <Link
                href="/applicant/login"
                className="text-[#061c2a] font-normal underline hover:text-[#0d2f47] transition-colors"
              >
                Sign in.
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
