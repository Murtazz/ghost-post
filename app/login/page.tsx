"use client";

import { useState } from "react";
import { Ghost, Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ghost-Post
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {/* Logo */}
          <div className="mb-6 text-center">
            <Ghost className="mx-auto mb-3 h-10 w-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sign in to Ghost-Post
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No password needed. We&apos;ll email you a magic link.
            </p>
          </div>

          {sent ? (
            /* ── Success State ───────────────────────────────────────── */
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center dark:border-green-800 dark:bg-green-950/50">
              <Mail className="mx-auto mb-3 h-8 w-8 text-green-500" />
              <p className="font-semibold text-green-800 dark:text-green-300">
                Check your email for the magic link!
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                We sent a sign-in link to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
          ) : (
            /* ── Form ────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:bg-slate-800"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-lg font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Magic Link
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
