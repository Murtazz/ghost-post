"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  Linkedin,
  Twitter,
} from "lucide-react";

const vibes = ["Funny", "Professional", "Crazy"] as const;
type Platform = "linkedin" | "twitter";

export default function GeneratorForm() {
  const [content, setContent] = useState("");
  const [vibe, setVibe] = useState<string>("Professional");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isLinkedIn = platform === "linkedin";
  const isTwitter = platform === "twitter";

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
        body: JSON.stringify({ content, vibe, platform }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const data = await res.json();
      setPosts(data.posts);

      // ── Save to localStorage history ──────────────────────────────
      try {
        const historyRaw = localStorage.getItem("ghost_post_history");
        const history: Array<{
          date: string;
          topic: string;
          posts: string[];
        }> = historyRaw ? JSON.parse(historyRaw) : [];

        const platformLabel = isTwitter ? "(Twitter) " : "";
        const aiTitle = data.title || "";
        const topic = aiTitle
          ? platformLabel + aiTitle
          : platformLabel +
            (content.length > 120 ? content.slice(0, 120) + "…" : content);

        history.unshift({
          date: new Date().toISOString(),
          topic,
          posts: data.posts,
        });

        // Keep only the last 20 entries to avoid bloating storage
        localStorage.setItem(
          "ghost_post_history",
          JSON.stringify(history.slice(0, 20))
        );

        // Notify other components that history changed
        window.dispatchEvent(new Event("ghost_history_updated"));
      } catch {
        // localStorage errors are non-critical — silently ignore
      }
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        {/* ── Platform Toggle ──────────────────────────────────────── */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Choose your platform
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPlatform("linkedin")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                isLinkedIn
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300"
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              }`}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setPlatform("twitter")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                isTwitter
                  ? "border-gray-800 bg-gray-900 text-white shadow-sm dark:border-gray-400 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              }`}
            >
              <Twitter className="h-4 w-4" />
              X / Twitter
            </button>
          </div>
        </div>

        {/* Textarea */}
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Paste your messy thoughts here.
        </label>
        <textarea
          id="content"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isTwitter
              ? "Drop a topic, hot take, or idea you want turned into viral tweets..."
              : "Drop an article link, brain-dump your notes, or paste anything you want turned into a LinkedIn post..."
          }
          className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:bg-slate-800"
        />

        {/* Vibe selector */}
        <div className="mt-5">
          <label
            htmlFor="vibe"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Pick a vibe
          </label>
          <div className="relative">
            <select
              id="vibe"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-gray-800 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-slate-800"
            >
              {vibes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-lg font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-md disabled:active:scale-100 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Ghostwriting...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate {isTwitter ? "Tweets" : "Posts"}
            </>
          )}
        </button>

        {/* Character hint */}
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          {content.length > 0
            ? `${content.length} characters entered`
            : isTwitter
              ? "Tip: Keep it spicy. Twitter loves hot takes."
              : "Tip: The more detail you give, the better the posts."}
        </p>
      </div>

      {/* ── Error Message ──────────────────────────────────────────── */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Loading Skeleton ───────────────────────────────────────── */}
      {loading && (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-slate-700" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-slate-700" />
                {isLinkedIn && (
                  <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-slate-700" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Post Cards ─────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">
            {isTwitter
              ? "Your tweets are ready to fire!"
              : "Your LinkedIn posts are ready!"}
          </h2>

          {posts.map((post, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              {/* Card header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isTwitter ? (
                    <Twitter className="h-3.5 w-3.5 text-gray-800 dark:text-gray-200" />
                  ) : (
                    <Linkedin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isTwitter
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {isTwitter ? `Tweet ${index + 1}` : `Post ${index + 1}`}
                  </span>
                  {isTwitter && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({post.length}/280)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(post, index)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Copied!</span>
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
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {post}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
