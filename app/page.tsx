import { Ghost } from "lucide-react";
import GeneratorForm from "./components/GeneratorForm";
import HistoryList from "./components/HistoryList";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <Ghost className="mx-auto mb-3 h-12 w-12 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Ghost-Post Generator
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Paste a link. Get LinkedIn posts. Like magic.
        </p>
      </div>

      {/* Form */}
      <GeneratorForm />

      {/* History */}
      <HistoryList />

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm text-gray-400">
        Built by MK.
      </footer>
    </div>
  );
}
