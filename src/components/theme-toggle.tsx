"use client";

import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/language";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 transition-colors ${className}`}
    >
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        title={t("toggleTheme")}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 flex-shrink-0" />
        )}
        <span>{resolvedTheme === "dark" ? t("themeDark") : t("themeLight")}</span>
      </button>

      <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-gray-700/80 p-0.5 rounded-md">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            theme === "light"
              ? "bg-white dark:bg-gray-900 text-amber-600 shadow-xs font-bold"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
          title={t("themeLight")}
          aria-label={t("themeLight")}
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            theme === "dark"
              ? "bg-white dark:bg-gray-900 text-indigo-400 shadow-xs font-bold"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
          title={t("themeDark")}
          aria-label={t("themeDark")}
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            theme === "system"
              ? "bg-white dark:bg-gray-900 text-blue-500 shadow-xs font-bold"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
          title={t("themeSystem")}
          aria-label={t("themeSystem")}
        >
          <Monitor className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
