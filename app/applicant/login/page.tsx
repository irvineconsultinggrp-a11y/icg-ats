"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
      <path d="M4.405 11.9A6.01 6.01 0 014.09 10c0-.662.114-1.305.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0A9.996 9.996 0 001.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="9.5" height="9.5" fill="#F25022"/>
      <rect x="10.5" y="0" width="9.5" height="9.5" fill="#7FBA00"/>
      <rect x="0" y="10.5" width="9.5" height="9.5" fill="#00A4EF"/>
      <rect x="10.5" y="10.5" width="9.5" height="9.5" fill="#FFB900"/>
    </svg>
  );
}

export default function ApplicantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: wire up real auth
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setError("Invalid credentials. Please try again.");
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
            ICG Application
            <br />
            Portal
          </h1>

          <p className="text-white text-lg font-normal leading-7 max-w-xs">
            Sign in using your credentials, or through SSO!
          </p>
        </div>

        <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm leading-5 px-4">
          © Irvine Consulting Group 2026. All Rights Reserved
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[540px] border border-[#e4e4e7] rounded-[26px] p-12 flex flex-col items-center gap-10">
          {/* ICG Logo */}
          <div className="relative w-full max-w-[360px] h-[145px]">
            <Image
              src="/images/icg-logo.png"
              alt="Irvine Consulting Group"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#111827] flex items-center gap-1"
              >
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
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#111827] flex items-center gap-1"
              >
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

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-[4px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Continue button */}
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

            {/* SSO buttons */}
            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => {/* TODO: Google SSO */}}
                className="flex items-center justify-center gap-3 flex-1 h-[62px] border border-[#e4e4e7] rounded-[5px] text-[#061c2a] text-lg font-medium hover:bg-[#f9fafb] transition-colors"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={() => {/* TODO: Microsoft SSO */}}
                className="flex items-center justify-center gap-3 flex-1 h-[62px] border border-[#e4e4e7] rounded-[5px] text-[#061c2a] text-lg font-medium hover:bg-[#f9fafb] transition-colors"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>

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
        </div>
      </div>
    </div>
  );
}
