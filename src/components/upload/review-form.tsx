"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Star,
  Pill,
  Save,
  RotateCcw,
  Activity,
  AlertTriangle,
  HeartPulse,
  Calendar,
  Stethoscope,
  FlaskConical,
} from "lucide-react";
import { savePrescription } from "@/actions";
import { toast } from "sonner";
import { useLanguage } from "@/language";
import type {
  GeminiResponse,
  MedicineItem,
  LabTestItem,
  AbnormalFinding,
  DocumentType,
  LabTestStatus,
  OcrResult,
} from "@/types";

interface ReviewFormProps {
  patients: { id: string; name: string; age: number; phone: string }[];
  selectedPatientId: string;
  imageUrl: string;
  ocrResult: OcrResult;
  aiResult: GeminiResponse;
  onReset: () => void;
}

export function ReviewForm({
  patients,
  selectedPatientId: initialPatientId,
  imageUrl,
  ocrResult,
  aiResult,
  onReset,
}: ReviewFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);

  // Document Metadata State
  const [documentType, setDocumentType] = useState<DocumentType>(aiResult.document_type || "prescription");
  const [documentDate, setDocumentDate] = useState<string>(
    aiResult.document_date || new Date().toISOString().split("T")[0]
  );
  const [diagnoses, setDiagnoses] = useState<string[]>(aiResult.diagnoses || []);
  const [newDiagnosis, setNewDiagnosis] = useState("");

  // Clinical & Simple Health Summaries
  const [correctedText, setCorrectedText] = useState(aiResult.corrected_text);
  const [summary, setSummary] = useState(aiResult.summary);
  const [plainLanguageSummary, setPlainLanguageSummary] = useState(aiResult.plain_language_summary || "");
  const [summaryLanguage, setSummaryLanguage] = useState<"en" | "hi" | "mr">("en");

  // Clinical Entities
  const [medicines, setMedicines] = useState<MedicineItem[]>(aiResult.medicines || []);
  const [labTests, setLabTests] = useState<LabTestItem[]>(aiResult.lab_tests || []);
  const [abnormalFindings, setAbnormalFindings] = useState<AbnormalFinding[]>(
    aiResult.abnormal_findings || []
  );

  const [doctorNotes, setDoctorNotes] = useState("");
  const [tags, setTags] = useState<string[]>(aiResult.tags || []);
  const [newTag, setNewTag] = useState("");
  const [important, setImportant] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(true);

  // Confidence styling
  const confidence = ocrResult.confidence;
  const confidenceVariant =
    confidence >= 85 ? "success" : confidence >= 65 ? "default" : "warning";

  // Summary language tab switch
  function handleSummaryLangChange(lang: "en" | "hi" | "mr") {
    setSummaryLanguage(lang);
    if (lang === "hi" && aiResult.plain_language_summary_hi) {
      setPlainLanguageSummary(aiResult.plain_language_summary_hi);
    } else if (lang === "mr" && aiResult.plain_language_summary_mr) {
      setPlainLanguageSummary(aiResult.plain_language_summary_mr);
    } else {
      setPlainLanguageSummary(aiResult.plain_language_summary || "");
    }
  }

  // Diagnoses operations
  function handleAddDiagnosis() {
    const trimmed = newDiagnosis.trim();
    if (trimmed && !diagnoses.includes(trimmed)) {
      setDiagnoses([...diagnoses, trimmed]);
      setNewDiagnosis("");
    }
  }

  function handleRemoveDiagnosis(item: string) {
    setDiagnoses(diagnoses.filter((d) => d !== item));
  }

  // Lab test operations
  function handleAddLabTest() {
    setLabTests([
      ...labTests,
      {
        testName: "",
        value: "",
        unit: "",
        referenceRange: "",
        status: "Normal",
        interpretation: "",
      },
    ]);
  }

  function handleUpdateLabTest(index: number, field: keyof LabTestItem, value: any) {
    const updated = [...labTests];
    updated[index] = { ...updated[index], [field]: value };
    setLabTests(updated);
  }

  function handleRemoveLabTest(index: number) {
    setLabTests(labTests.filter((_, i) => i !== index));
  }

  // Medicine operations
  function handleAddMedicine() {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "OD",
        duration: "5 days",
        purpose: "",
        isUncertain: false,
      },
    ]);
  }

  function handleUpdateMedicine(index: number, field: keyof MedicineItem, value: any) {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  }

  function handleRemoveMedicine(index: number) {
    setMedicines(medicines.filter((_, i) => i !== index));
  }

  // Tag operations
  function handleAddTag() {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  async function handleSave() {
    if (!patientId) {
      toast.error(t("selectPatientToast"));
      return;
    }

    setSaving(true);
    try {
      await savePrescription({
        patientId,
        imageUrl,
        rawOcr: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        documentType,
        documentDate,
        diagnoses,
        correctedText,
        aiSummary: summary,
        plainLanguageSummary,
        medicinesJson: medicines,
        labTestsJson: labTests,
        abnormalFindings,
        doctorNotes: doctorNotes.trim() || undefined,
        tags,
        important,
      });

      toast.success(t("saveSuccessToast"));
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save prescription. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("reviewBannerTitle")}</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            {t("reviewBannerSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            {t("startOverBtn")}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !patientId}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4" />
            {saving ? t("saving") : t("approveAndSaveBtn")}
          </Button>
        </div>
      </div>

      {/* Patient Assignment & Document Classification Card */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Patient Selector */}
            <div className="sm:col-span-5">
              <Label htmlFor="patientSelect" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 block">
                {t("assignPatientLabel")}
              </Label>
              <Select
                id="patientSelect"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full font-medium"
              >
                <option value="" disabled>{t("selectPatientPlaceholder")}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age} {t("yrsOld")}, {p.phone})
                  </option>
                ))}
              </Select>
            </div>

            {/* Document Type Selector */}
            <div className="sm:col-span-3">
              <Label htmlFor="docTypeSelect" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 block">
                {t("documentTypeLabel")}
              </Label>
              <Select
                id="docTypeSelect"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full font-medium"
              >
                <option value="prescription">{t("docTypePrescription")}</option>
                <option value="lab_report">{t("docTypeLabReport")}</option>
                <option value="discharge_summary">{t("docTypeDischargeSummary")}</option>
                <option value="diagnostic_record">{t("docTypeDiagnosticRecord")}</option>
                <option value="other">{t("docTypeOther")}</option>
              </Select>
            </div>

            {/* Document Date */}
            <div className="sm:col-span-2">
              <Label htmlFor="docDate" className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 block">
                {t("documentDateLabel")}
              </Label>
              <Input
                id="docDate"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="font-medium"
              />
            </div>

            {/* Mark Important Checkbox */}
            <div className="sm:col-span-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer select-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors w-full h-10">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200 text-xs">
                  <Star className={`h-3.5 w-3.5 ${important ? "text-amber-500 fill-amber-500" : "text-gray-400 dark:text-gray-500"}`} />
                  {t("markImportantLabel")}
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnoses & Clinical Impressions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {t("diagnosesHeading")}
          </CardTitle>
          <CardDescription>{t("diagnosesSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {diagnoses.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No specific diagnosis tagged yet.</span>
            ) : (
              diagnoses.map((diag) => (
                <Badge
                  key={diag}
                  variant="default"
                  className="flex items-center gap-1.5 text-xs py-1 px-3"
                >
                  <span>{diag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDiagnosis(diag)}
                    className="hover:text-red-300 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 max-w-md">
            <Input
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDiagnosis())}
              placeholder={t("addDiagnosisPlaceholder")}
              className="h-8 text-xs"
            />
            <Button size="sm" variant="outline" onClick={handleAddDiagnosis} className="h-8 text-xs">
              {t("addDiagnosisBtn")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Health Summary in Simple Language (Highlighted Patient-Facing Feature) */}
      <Card className="border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 dark:from-indigo-950/20 dark:via-gray-900 dark:to-blue-950/20 shadow-xs">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
              <HeartPulse className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              {t("simpleHealthSummaryHeading")}
            </CardTitle>
            <CardDescription className="text-xs text-indigo-900/70 dark:text-indigo-300/70">
              {t("simpleHealthSummarySubtitle")}
            </CardDescription>
          </div>

          {/* Simple Language Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-indigo-200 dark:border-indigo-900/80">
            <button
              type="button"
              onClick={() => handleSummaryLangChange("en")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                summaryLanguage === "en"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t("viewSummaryInEn")}
            </button>
            <button
              type="button"
              onClick={() => handleSummaryLangChange("hi")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                summaryLanguage === "hi"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t("viewSummaryInHi")}
            </button>
            <button
              type="button"
              onClick={() => handleSummaryLangChange("mr")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                summaryLanguage === "mr"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t("viewSummaryInMr")}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={plainLanguageSummary}
            onChange={(e) => setPlainLanguageSummary(e.target.value)}
            rows={4}
            className="text-sm leading-relaxed border-indigo-200 dark:border-indigo-900/80 bg-white/80 dark:bg-gray-900/80"
            placeholder="AI Plain Language Summary explaining what this record means for the patient and their family..."
          />

          {/* Abnormal Findings & Organ Impact Alert */}
          {abnormalFindings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/70 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  {t("abnormalFindingsAlertHeading")} ({abnormalFindings.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {abnormalFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white dark:bg-gray-900/90 border border-amber-200 dark:border-amber-900/50 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{finding.item}</span>
                      <Badge variant={finding.severity === "critical" ? "destructive" : "warning"} className="text-[10px]">
                        {finding.value}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t("normalRangeLabel")}: <span className="font-semibold text-gray-700 dark:text-gray-300">{finding.normalRange}</span>
                    </p>
                    <p className="text-xs text-amber-900 dark:text-amber-200 font-normal pt-1 border-t border-amber-100 dark:border-amber-900/30">
                      {finding.plainExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Reports & Diagnostic Test Values Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {t("labTestsHeading")} ({labTests.length})
            </CardTitle>
            <CardDescription>{t("labTestsSubtitle")}</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddLabTest} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            {t("addLabTestBtn")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {labTests.length === 0 ? (
            <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              {t("noLabTestsExtracted")}
            </div>
          ) : (
            <div className="space-y-2.5">
              {labTests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3.5 rounded-lg border text-xs transition-colors ${
                    test.status === "High" || test.status === "Critical"
                      ? "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                      : test.status === "Low"
                      ? "bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50"
                      : "bg-white dark:bg-gray-850 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">#{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={test.status}
                        onChange={(e) => handleUpdateLabTest(index, "status", e.target.value as LabTestStatus)}
                        className="h-7 text-xs w-28 font-bold"
                      >
                        <option value="Normal">{t("statusNormal")}</option>
                        <option value="High">{t("statusHigh")}</option>
                        <option value="Low">{t("statusLow")}</option>
                        <option value="Critical">{t("statusCritical")}</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLabTest(index)}
                        className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title={t("delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("testNameCol")}</Label>
                      <Input
                        value={test.testName}
                        onChange={(e) => handleUpdateLabTest(index, "testName", e.target.value)}
                        placeholder="e.g. HbA1c, Fasting Glucose"
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("valueCol")}</Label>
                      <Input
                        value={test.value}
                        onChange={(e) => handleUpdateLabTest(index, "value", e.target.value)}
                        placeholder="e.g. 8.4"
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">Unit</Label>
                      <Input
                        value={test.unit || ""}
                        onChange={(e) => handleUpdateLabTest(index, "unit", e.target.value)}
                        placeholder="%, mg/dL"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("referenceRangeCol")}</Label>
                      <Input
                        value={test.referenceRange || ""}
                        onChange={(e) => handleUpdateLabTest(index, "referenceRange", e.target.value)}
                        placeholder="e.g. < 5.7%, 70 - 99 mg/dL"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("interpretationCol")}</Label>
                    <Input
                      value={test.interpretation || ""}
                      onChange={(e) => handleUpdateLabTest(index, "interpretation", e.target.value)}
                      placeholder="e.g. Elevated 3-month blood sugar indicating diabetes"
                      className="h-8 text-xs text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2-Column Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image + Raw OCR (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Document Scan Image */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{t("originalPrescriptionCard")}</CardTitle>
                <CardDescription>{t("uploadedDocumentDesc")}</CardDescription>
              </div>
              <Badge variant={confidenceVariant} className="text-xs">
                OCR: {confidence}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 flex items-center justify-center min-h-[300px] max-h-[460px]">
                <img
                  src={imageUrl}
                  alt="Medical Document Scan"
                  className="w-full h-full object-contain max-h-[460px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Raw OCR Output */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  {t("rawOcrTitle")}
                </CardTitle>
                <CardDescription>{t("rawOcrSubtitle")}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRawOcr(!showRawOcr)}
              >
                {showRawOcr ? t("collapseBtn") : t("expandBtn")}
              </Button>
            </CardHeader>
            {showRawOcr && (
              <CardContent>
                <div className="p-3 bg-gray-50 dark:bg-gray-850 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {ocrResult.text || t("noRawOcrDetected")}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column: Medications, Summary & Notes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Physician Clinical Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {t("clinicalSummaryTitle")}
              </CardTitle>
              <CardDescription>{t("clinicalSummarySubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="text-sm leading-relaxed"
                placeholder={t("clinicalSummarySubtitle")}
              />
            </CardContent>
          </Card>

          {/* Prescribed Medications */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {t("prescribedMedsTitle")} ({medicines.length})
                </CardTitle>
                <CardDescription>{t("prescribedMedsSubtitle")}</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddMedicine} className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" />
                {t("addMedicineBtn")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {medicines.length === 0 ? (
                <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  {t("noMedsExtractedNotice")}
                </div>
              ) : (
                medicines.map((med, index) => (
                  <div
                    key={index}
                    className={`p-3.5 rounded-lg border transition-all ${
                      med.isUncertain
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
                        : "bg-white dark:bg-gray-850 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 w-5">#{index + 1}</span>
                        {med.isUncertain && (
                          <Badge variant="warning" className="text-[11px] py-0 px-1.5">
                            {t("possiblyBadge")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={med.isUncertain || false}
                            onChange={(e) => handleUpdateMedicine(index, "isUncertain", e.target.checked)}
                            className="rounded text-amber-600 text-xs"
                          />
                          {t("uncertainLabel")}
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMedicine(index)}
                          className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                          title={t("delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("medNameLabel")}</Label>
                        <Input
                          value={med.name}
                          onChange={(e) => handleUpdateMedicine(index, "name", e.target.value)}
                          placeholder="e.g. Augmentin / Glycomet"
                          className="h-8 text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("dosageLabel")}</Label>
                        <Input
                          value={med.dosage || ""}
                          onChange={(e) => handleUpdateMedicine(index, "dosage", e.target.value)}
                          placeholder="e.g. 500mg"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("frequencyLabel")}</Label>
                        <Input
                          value={med.frequency || ""}
                          onChange={(e) => handleUpdateMedicine(index, "frequency", e.target.value)}
                          placeholder="e.g. BD after meals"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">{t("durationLabel")}</Label>
                        <Input
                          value={med.duration || ""}
                          onChange={(e) => handleUpdateMedicine(index, "duration", e.target.value)}
                          placeholder="e.g. 5 days"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <Label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">Clinical Purpose / Indication</Label>
                      <Input
                        value={med.purpose || ""}
                        onChange={(e) => handleUpdateMedicine(index, "purpose", e.target.value)}
                        placeholder="e.g. Blood pressure reduction / Antibiotic for infection"
                        className="h-8 text-xs text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Corrected Full Transcription */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("correctedTranscriptionTitle")}</CardTitle>
              <CardDescription>{t("correctedTranscriptionSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                rows={4}
                className="text-sm font-sans leading-relaxed"
                placeholder={t("correctedTranscriptionSubtitle")}
              />
            </CardContent>
          </Card>

          {/* Tags & Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("tagsTitle")}</CardTitle>
              <CardDescription>{t("tagsSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600 dark:hover:text-red-400 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder={t("addTagPlaceholder")}
                  className="h-8 text-xs"
                />
                <Button size="sm" variant="outline" onClick={handleAddTag} className="h-8 text-xs">
                  {t("addTagBtn")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Private Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("doctorRemarksTitle")}</CardTitle>
              <CardDescription>{t("doctorRemarksSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={2}
                placeholder={t("doctorRemarksPlaceholder")}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* Final Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onReset}>
              {t("discardBtn")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !patientId}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm"
            >
              <Save className="h-4 w-4" />
              {saving ? t("saving") : t("approveSaveFullBtn")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
