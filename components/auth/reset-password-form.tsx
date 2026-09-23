"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type ResetPasswordFormProps = {
  title: string;
  loginHref: string;
  afterResetHref: string;
};

export function ResetPasswordForm({
  title,
  loginHref,
  afterResetHref,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setReady(Boolean(user));
      if (!user) {
        setError(
          "This reset link is invalid or expired. Request a new link from the sign-in page.",
        );
      }
    }
    void checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage("Password updated. You can sign in with your new password.");
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = afterResetHref;
      }, 1500);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not update password. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Link href={loginHref} className="text-sm text-[#6b7280] hover:text-[#061c2a]">
          ← Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-[#061c2a]">{title}</h1>
        {!ready ? (
          <p className="text-sm text-red-600">{error || "Checking reset link…"}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="h-12 border border-[#e4e4e7] rounded-lg px-4 text-[#111827] outline-none focus:border-[#061c2a]"
            />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="h-12 border border-[#e4e4e7] rounded-lg px-4 text-[#111827] outline-none focus:border-[#061c2a]"
            />
            {message && <p className="text-sm text-green-700">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-12 bg-[#061c2a] text-white rounded-lg font-medium disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
