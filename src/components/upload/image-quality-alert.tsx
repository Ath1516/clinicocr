"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { QualityCheck } from "@/lib/ocr/preprocess";
import { useLanguage } from "@/language";

interface ImageQualityAlertProps {
  quality: QualityCheck | null;
}

export function ImageQualityAlert({ quality }: ImageQualityAlertProps) {
  const { t } = useLanguage();
  if (!quality) return null;

  const hasIssues = quality.warnings.length > 0;

  if (!hasIssues) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>{t("qualityCheckPassed")}</span>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm space-y-1">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>{t("qualityWarningTitle")}</span>
      </div>
      <ul className="list-disc pl-5 text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
        {quality.warnings.map((w, idx) => (
          <li key={idx}>{w}</li>
        ))}
      </ul>
      <p className="text-xs text-amber-700 dark:text-amber-400 italic pt-1">
        {t("qualityWarningAdvice")}
      </p>
    </div>
  );
}
