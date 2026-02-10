"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, ChevronDown, ChevronUp, Copy, Check, Cloud, Linkedin, Twitter } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface HistoryEntry {
  date: string;
  topic: string;
  vibe?: string;
  posts: string[];
}

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [syncActive, setSyncActive] = useState(false);

  // ── Check auth state ──────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) setSyncActive(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) setSyncActive(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load history (Supabase if logged in, localStorage if guest) ──
  useEffect(() => {
    if (user) {
      loadFromSupabase();
    } else {
      loadFromLocalStorage();
    }

    const handler = () => {
      if (user) {
        loadFromSupabase();
      } else {
        loadFromLocalStorage();
      }
    };
    window.addEventListener("ghost_history_updated", handler);
    return () => window.removeEventListener("ghost_history_updated", handler);
  }, [user]);

  async function loadFromSupabase() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const entries: HistoryEntry[] = (data || []).map((row) => ({
        date: row.created_at,
        topic: row.topic,
        vibe: row.vibe,
        posts: row.generated_content,
      }));
      setHistory(entries);
    } catch (err) {
      console.error("Failed to load from Supabase:", err);
      loadFromLocalStorage();
    }
  }

  function loadFromLocalStorage() {
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

  // ── Clear history ─────────────────────────────────────────────────
  async function handleClear() {
    if (user) {
      try {
        const supabase = createClient();
        await supabase.from("posts").delete().eq("user_id", user.id);
      } catch (err) {
        console.error("Failed to clear Supabase history:", err);
      }
    }
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
  if (history.length === 0 && !syncActive) return null;

  return (
    <div className="w-full max-w-2xl mt-12">
      {/* ── Sync Toast ───────────────────────────────────────────────── */}
      {syncActive && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
          onAnimationEnd={() => {
            // Auto-dismiss after display
          }}
        >
          <Cloud className="h-4 w-4" />
          History Sync Active — your posts are saved to the cloud.
        </div>
      )}

      {history.length === 0 && syncActive ? null : (
        <>
          {/* ── Section Header ───────────────────────────────────────── */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Recent Generations
              </h2>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-gray-400 dark:hover:border-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </button>
          </div>

          {/* ── History Cards ────────────────────────────────────────── */}
          <div className="space-y-3">
            {history.map((entry, i) => {
              const isExpanded = expandedIndex === i;
              const isTwitter = entry.topic.startsWith("(Twitter) ");
              const cleanTopic = entry.topic.replace(/^\(Twitter\)\s*/, "");
              const shortTitle =
                cleanTopic.length > 60
                  ? cleanTopic.slice(0, 60) + "…"
                  : cleanTopic;

              return (
                <div
                  key={`${entry.date}-${i}`}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  {/* Collapsed row */}
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isTwitter ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-gray-200 dark:text-gray-900">
                            <Twitter className="h-2.5 w-2.5" />
                            X
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            <Linkedin className="h-2.5 w-2.5" />
                            In
                          </span>
                        )}
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                          {shortTitle}
                        </p>
                      </div>
                      <p className="mt-0.5 ml-[42px] text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(entry.date)}
                        {entry.vibe && ` · ${entry.vibe}`}
                        {" · "}
                        {entry.posts.length} {isTwitter ? "tweet" : "post"}
                        {entry.posts.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="ml-3 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>

                  {/* Expanded posts */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-3 space-y-3 dark:border-slate-700">
                      {entry.posts.map((post, pi) => {
                        const copyKey = `${i}-${pi}`;
                        return (
                          <div
                            key={pi}
                            className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className={`text-xs font-bold uppercase tracking-wider ${isTwitter ? "text-gray-800 dark:text-gray-200" : "text-blue-600 dark:text-blue-400"}`}>
                                {isTwitter ? `Tweet ${pi + 1}` : `Post ${pi + 1}`}
                              </span>
                              <button
                                onClick={() => handleCopy(post, copyKey)}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-slate-600 dark:hover:text-blue-400"
                              >
                                {copiedKey === copyKey ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400">
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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
        </>
      )}
    </div>
  );
}
