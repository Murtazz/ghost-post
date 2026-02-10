"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

const vibes = ["Funny", "Professional", "Crazy"] as const;

export default function GeneratorForm() {
  const [content, setContent] = useState("");
  const [vibe, setVibe] = useState<string>("Professional");
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ── Call our API route ────────────────────────────────────────────
  async function handleGenerate() {
    if (!content.trim()) {
      setError("Feed me some text first!");
      return;
    }

    setLoading(true);
    setError("");
    setPosts([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, vibe }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Copy a post to clipboard ──────────────────────────────────────
  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* ── Input Card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        {/* Textarea */}
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Paste your messy thoughts here.
        </label>
        <textarea
          id="content"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Drop an article link, brain-dump your notes, or paste anything you want turned into a LinkedIn post..."
          className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        {/* Vibe selector */}
        <div className="mt-5">
          <label
            htmlFor="vibe"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Pick a vibe
          </label>
          <div className="relative">
            <select
              id="vibe"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-gray-800 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {vibes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-lg font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-md disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Ghostwriting...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Posts
            </>
          )}
        </button>

        {/* Character hint */}
        <p className="mt-3 text-center text-xs text-gray-400">
          {content.length > 0
            ? `${content.length} characters entered`
            : "Tip: The more detail you give, the better the posts."}
        </p>
      </div>

      {/* ── Error Message ──────────────────────────────────────────── */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Loading Skeleton ───────────────────────────────────────── */}
      {loading && (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
                <div className="h-3 w-4/6 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Post Cards ─────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-center text-lg font-semibold text-gray-700">
            Your LinkedIn posts are ready!
          </h2>

          {posts.map((post, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Card header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Post {index + 1}
                </span>
                <button
                  onClick={() => handleCopy(post, index)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Post content — preserve line breaks */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {post}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
