import { Ghost } from "lucide-react";
import GeneratorForm from "./components/GeneratorForm";
import HistoryList from "./components/HistoryList";
import UserButton from "./components/UserButton";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gray-50 px-4 py-16 dark:bg-slate-950">
      {/* Top-right controls */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeToggle />
        <UserButton />
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <Ghost className="mx-auto mb-3 h-12 w-12 text-blue-600 dark:text-blue-400" />
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-gray-100">
          Ghost-Post Generator
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          Paste a link or messy notes. Get polished posts and tweets. Like magic.
        </p>
      </div>

      {/* Form */}
      <GeneratorForm />

      {/* History */}
      <HistoryList />

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm text-gray-400 dark:text-gray-600">
        Built by MK.
      </footer>
    </div>
  );
}
