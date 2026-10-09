"use client";

import { useState } from "react";
import { UploadZone } from "./upload-zone";
import { ReviewForm } from "./review-form";
import { useLanguage } from "@/language";
import type { GeminiResponse, OcrResult } from "@/types";

interface UploadWorkspaceProps {
  patients: { id: string; name: string; age: number; phone: string }[];
  initialPatientId?: string;
}

export function UploadWorkspace({ patients, initialPatientId }: UploadWorkspaceProps) {
  const { t } = useLanguage();
  const [analysisData, setAnalysisData] = useState<{
    imageUrl: string;
    ocrResult: OcrResult;
    aiResult: GeminiResponse;
    patientId: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("uploadPageTitle")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t("uploadPageSubtitle")}</p>
      </div>

      {analysisData ? (
        <ReviewForm
          patients={patients}
          selectedPatientId={analysisData.patientId}
          imageUrl={analysisData.imageUrl}
          ocrResult={analysisData.ocrResult}
          aiResult={analysisData.aiResult}
          onReset={() => setAnalysisData(null)}
        />
      ) : (
        <UploadZone
          patients={patients}
          initialPatientId={initialPatientId}
          onAnalysisComplete={(data) => setAnalysisData(data)}
        />
      )}
    </div>
  );
}
