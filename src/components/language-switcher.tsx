"use client";

import { useLanguage, SUPPORTED_LANGUAGES, type Language } from "@/language";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${className}`}
    >
      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="w-full bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
        aria-label="Select Language"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option
            key={l.code}
            value={l.code}
            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          >
            {l.nativeLabel} ({l.label})
          </option>
        ))}
      </select>
    </div>
  );
}
