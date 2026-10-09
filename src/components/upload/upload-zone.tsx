"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Upload,
  FileImage,
  FileText,
  Sparkles,
  Loader2,
  Sliders,
  UserPlus,
} from "lucide-react";
import { loadImageToCanvas, checkImageQuality, preprocessImage, type QualityCheck } from "@/lib/ocr/preprocess";
import { extractText } from "@/lib/ocr/tesseract";
import { processPrescription } from "@/actions";
import { ImageQualityAlert } from "./image-quality-alert";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { toast } from "sonner";
import { useLanguage } from "@/language";
import type { GeminiResponse, OcrResult } from "@/types";

interface UploadZoneProps {
  patients: { id: string; name: string; age: number; phone: string }[];
  initialPatientId?: string;
  onAnalysisComplete: (data: {
    imageUrl: string;
    ocrResult: OcrResult;
    aiResult: GeminiResponse;
    patientId: string;
  }) => void;
}

export function UploadZone({ patients: initialPatients, initialPatientId, onAnalysisComplete }: UploadZoneProps) {
  const { t } = useLanguage();
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || (initialPatients[0]?.id ?? ""));
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  // File & Preprocessing State
  const [file, setFile] = useState<File | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preprocessedUrl, setPreprocessedUrl] = useState<string | null>(null);
  const [showPreprocessed, setShowPreprocessed] = useState(false);
  const [quality, setQuality] = useState<QualityCheck | null>(null);

  // Analysis Progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    const isFilePdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    const isImage = selectedFile.type.startsWith("image/");

    if (!isFilePdf && !isImage) {
      toast.error("Please select a valid image (JPG, PNG) or PDF document.");
      return;
    }

    setFile(selectedFile);
    setIsPdf(isFilePdf);

    if (isFilePdf) {
      setPreviewUrl(null);
      setPreprocessedUrl(null);
      setQuality(null);
      return;
    }

    // For image files, generate preview and canvas diagnostics
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    try {
      const canvas = await loadImageToCanvas(selectedFile);
      canvasRef.current = canvas;

      // Run Quality Diagnostics
      const qual = checkImageQuality(canvas);
      setQuality(qual);

      // Create Preprocessed Copy
      const preprocessedDataUrl = preprocessImage(canvas);
      setPreprocessedUrl(preprocessedDataUrl);
    } catch (err) {
      console.error("Failed to inspect image:", err);
      toast.error("Could not load image canvas. Please try another file.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelected(droppedFile);
    },
    [handleFileSelected]
  );

  async function handleStartAnalysis() {
    if (!file) {
      toast.error("Please select or drop a prescription or medical report first.");
      return;
    }
    if (!selectedPatientId) {
      toast.error(t("selectPatientToast"));
      return;
    }

    setIsAnalyzing(true);
    try {
      // Step 1: Upload and run High-Precision Server-Side OCR (with Sharp & local Tesseract)
      setAnalysisStep(t("uploadingToServerStep"));
      const formData = new FormData();
      formData.append("file", file);

      let ocrResult: OcrResult = { text: "", confidence: 0 };
      let savedUrl = "";

      try {
        setAnalysisStep(t("extractingOcrStep"));
        const ocrRes = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        });

        if (ocrRes.ok) {
          const ocrData = await ocrRes.json();
          savedUrl = ocrData.fileUrl || ocrData.imageUrl;
          ocrResult = {
            text: ocrData.text || "",
            confidence: Number(ocrData.confidence) || 0,
          };
          if (ocrData.processedImageUrl && !preprocessedUrl) {
            setPreprocessedUrl(ocrData.processedImageUrl);
          }
        } else {
          throw new Error("Server OCR failed, trying fallback");
        }
      } catch (serverOcrErr) {
        console.warn("Server OCR failed, attempting client-side fallback:", serverOcrErr);

        // Client-side fallback for images
        if (!isPdf && (previewUrl || preprocessedUrl)) {
          // Upload raw file first
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            savedUrl = data.imageUrl;
          }

          const imageToOcr = showPreprocessed && preprocessedUrl ? preprocessedUrl : previewUrl!;
          ocrResult = await extractText(imageToOcr);
        } else {
          throw serverOcrErr;
        }
      }

      // Step 2: Google Gemini Multimodal Vision + Doctor Intelligence Analysis
      setAnalysisStep(t("refiningGeminiStep"));
      const imageBase64 = showPreprocessed && preprocessedUrl ? preprocessedUrl : previewUrl || undefined;
      const aiResult = await processPrescription(ocrResult.text, {
        imageBase64: imageBase64 ? imageBase64 : undefined,
        mimeType: file.type || "image/jpeg",
      });

      toast.success(t("saveSuccessToast"));

      // Complete! Hand off to ReviewForm
      onAnalysisComplete({
        imageUrl: savedUrl || (isPdf ? "/pdf-icon.png" : previewUrl || ""),
        ocrResult,
        aiResult,
        patientId: selectedPatientId,
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast.error(error instanceof Error ? error.message : "Error analyzing prescription");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient Assignment Card */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{t("step1SelectPatient")}</CardTitle>
            <CardDescription>{t("step1SelectPatientDesc")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPatientDialogOpen(true)}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {t("newPatientBtn")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/60 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <span>{t("noPatientsAlert")}</span>
              <Button size="sm" onClick={() => setPatientDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                {t("addPatient")}
              </Button>
            </div>
          ) : (
            <Select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full text-sm font-medium"
            >
              <option value="" disabled>{t("selectPatientPlaceholder")}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.age} {t("yrsOld")}, {p.phone}
                </option>
              ))}
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Upload & Dropzone Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("step2CaptureUpload")}</CardTitle>
          <CardDescription>{t("step2CaptureUploadDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
            }}
          />

          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 flex flex-col items-center justify-center gap-3"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {t("clickToUploadOrDrop")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supports High-Res Images (PNG, JPG) and PDF Reports
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2 gap-2">
                <FileImage className="h-4 w-4" />
                {t("browseFilesBtn")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>{isPdf ? "Uploaded PDF Document" : t("originalImageLabel")}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-6 text-xs text-blue-600 dark:text-blue-400"
                    >
                      {t("changePhotoBtn")}
                    </Button>
                  </div>
                  <div className="h-64 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center border border-gray-800 p-2">
                    {isPdf ? (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-gray-200">
                        <FileText className="h-16 w-16 text-red-400 mb-2" />
                        <p className="font-semibold text-sm truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB PDF</p>
                        <span className="mt-3 px-2.5 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                          Ready for Native PDF Analysis
                        </span>
                      </div>
                    ) : (
                      <img
                        src={showPreprocessed && preprocessedUrl ? preprocessedUrl : previewUrl || ""}
                        alt="Prescription preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  {/* Quality Pre-Check Card */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                      {t("qualityCheckHeading")}
                    </h4>
                    {isPdf ? (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>Digital PDF detected: High-fidelity document structure will be extracted directly.</span>
                      </div>
                    ) : (
                      <ImageQualityAlert quality={quality} />
                    )}
                  </div>

                  {/* Preprocessing Toggle for images */}
                  {!isPdf && preprocessedUrl && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>{t("adaptiveThresholdLabel")}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreprocessed(!showPreprocessed)}
                        className="h-7 text-xs"
                      >
                        {showPreprocessed ? t("viewOriginalBtn") : t("viewEnhancedBtn")}
                      </Button>
                    </div>
                  )}

                  {/* Start Analysis Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing || !selectedPatientId}
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white h-11 text-base shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{t("processing")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          <span>{t("analyzeWithAiBtn")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress Stepper Bar while analyzing */}
              {isAnalyzing && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 animate-in fade-in-0">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{analysisStep}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                        {t("runningAiMsg")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PatientDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        onSuccess={() => {
          setPatientDialogOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
