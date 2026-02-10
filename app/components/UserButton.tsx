"use client";

import { useEffect, useState } from "react";
import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function UserButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get the current user on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  // Don't render anything while checking auth
  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-600 sm:inline dark:text-gray-400">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-blue-400"
    >
      <LogIn className="h-3.5 w-3.5" />
      Login
    </Link>
  );
}
