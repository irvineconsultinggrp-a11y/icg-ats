"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/utils/auth/applicant";

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

type OAuthButtonsProps = {
  disabled?: boolean;
  onError?: (message: string) => void;
};

export function OAuthButtons({ disabled, onError }: OAuthButtonsProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    onError?.("");

    const { error } = await signInWithGoogle();

    if (error) {
      onError?.(error.message);
      setLoading(false);
    }
    // On success Supabase redirects the browser — no need to clear loading
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleGoogle}
      className="flex items-center justify-center gap-3 w-full h-[62px] border border-[#e4e4e7] rounded-[5px] text-[#061c2a] text-lg font-medium hover:bg-[#f9fafb] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
      ) : (
        <GoogleIcon />
      )}
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
