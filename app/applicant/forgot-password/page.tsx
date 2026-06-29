"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ApplicantForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/applicant/login?confirmed=1`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("If an account exists for that email, a reset link has been sent.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Link href="/applicant/login" className="text-sm text-[#6b7280] hover:text-[#061c2a]">
          ← Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-[#061c2a]">Reset your password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-12 border border-[#e4e4e7] rounded-lg px-4 text-[#111827] outline-none focus:border-[#061c2a]"
          />
          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#061c2a] text-white rounded-lg font-medium disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
