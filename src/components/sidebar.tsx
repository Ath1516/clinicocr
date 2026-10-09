"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Upload,
  Search,
  FileText,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, type TranslationKey } from "@/language";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  href: string;
  key: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", key: "navDashboard", icon: LayoutDashboard },
  { href: "/patients", key: "navPatients", icon: Users },
  { href: "/upload", key: "navUpload", icon: Upload },
  { href: "/search", key: "navSearch", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col min-h-screen transition-colors">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t("brandTitle")}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("brandSubtitle")}</p>
          </div>
        </Link>
      </div>

      {/* Language & Theme Controls */}
      <div className="px-4 pt-4 space-y-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                )}
              />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              {t("aiPowered")}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {t("ocrGeminiBadge")}
          </p>
        </div>
      </div>
    </aside>
  );
}
