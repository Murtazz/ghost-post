"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface HistoryEntry {
  date: string;
  topic: string;
  posts: string[];
}

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── Load history from localStorage ────────────────────────────────
  function loadHistory() {
    try {
      const raw = localStorage.getItem("ghost_post_history");
      if (raw) {
        const parsed: HistoryEntry[] = JSON.parse(raw);
        setHistory(parsed.slice(0, 5));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();

    // Listen for updates from GeneratorForm
    const handler = () => loadHistory();
    window.addEventListener("ghost_history_updated", handler);
    return () => window.removeEventListener("ghost_history_updated", handler);
  }, []);

  // ── Clear all history ─────────────────────────────────────────────
  function handleClear() {
    localStorage.removeItem("ghost_post_history");
    setHistory([]);
    setExpandedIndex(null);
  }

  // ── Copy a post to clipboard ──────────────────────────────────────
  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  // ── Format date for display ───────────────────────────────────────
  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Don't render anything if there's no history
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-12">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-700">
            Recent Generations
          </h2>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear History
        </button>
      </div>

      {/* ── History Cards ──────────────────────────────────────────── */}
      <div className="space-y-3">
        {history.map((entry, i) => {
          const isExpanded = expandedIndex === i;

          return (
            <div
              key={`${entry.date}-${i}`}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Collapsed row */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {entry.topic}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDate(entry.date)} &middot; {entry.posts.length} post
                    {entry.posts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
                )}
              </button>

              {/* Expanded posts */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-3 space-y-3">
                  {entry.posts.map((post, pi) => {
                    const copyKey = `${i}-${pi}`;
                    return (
                      <div
                        key={pi}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                            Post {pi + 1}
                          </span>
                          <button
                            onClick={() => handleCopy(post, copyKey)}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {copiedKey === copyKey ? (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                          {post}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
