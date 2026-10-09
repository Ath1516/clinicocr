"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Download,
  FileText,
  Pill,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  Stethoscope,
  FlaskConical,
  Activity,
  HeartPulse,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toggleImportant, updatePrescriptionNotes, deletePrescription } from "@/actions";
import { downloadPrescriptionPdf } from "@/lib/pdf/generator";
import { toast } from "sonner";
import { useLanguage } from "@/language";
import type { MedicineItem, LabTestItem, AbnormalFinding, DocumentType } from "@/types";

interface PrescriptionCardProps {
  rx: {
    id: string;
    patientId: string;
    imageUrl: string;
    rawOcr: string;
    ocrConfidence: number | null;
    documentType?: DocumentType;
    documentDate?: string;
    diagnoses?: string[];
    correctedText: string;
    aiSummary: string;
    plainLanguageSummary?: string | null;
    medicinesJson: MedicineItem[];
    labTestsJson?: LabTestItem[];
    abnormalFindings?: AbnormalFinding[];
    doctorNotes: string | null;
    tags: string[];
    important: boolean;
    createdAt: Date | string;
  };
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  onUpdate?: () => void;
}

export function PrescriptionCard({ rx, patient, onUpdate }: PrescriptionCardProps) {
  const { t } = useLanguage();
  const [important, setImportant] = useState(rx.important);
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(rx.doctorNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  async function handleToggleImportant() {
    try {
      setImportant(!important);
      await toggleImportant(rx.id);
      toast.success(important ? t("removedImportantToast") : t("markedImportantToast"));
      if (onUpdate) onUpdate();
    } catch {
      setImportant(important);
      toast.error("Failed to update status");
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await updatePrescriptionNotes(rx.id, notes);
      setEditingNotes(false);
      toast.success(t("doctorNotesUpdatedToast"));
      if (onUpdate) onUpdate();
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("deletePrescriptionConfirm"))) return;
    try {
      await deletePrescription(rx.id, rx.patientId);
      toast.success(t("prescriptionDeletedToast"));
      if (onUpdate) onUpdate();
      window.location.reload();
    } catch {
      toast.error("Failed to delete prescription");
    }
  }

  function handleExportPdf() {
    downloadPrescriptionPdf({
      patient,
      prescription: {
        id: rx.id,
        createdAt: rx.createdAt,
        ocrConfidence: rx.ocrConfidence,
        documentType: rx.documentType,
        documentDate: rx.documentDate,
        diagnoses: rx.diagnoses,
        correctedText: rx.correctedText,
        aiSummary: rx.aiSummary,
        plainLanguageSummary: rx.plainLanguageSummary,
        medicinesJson: rx.medicinesJson,
        labTestsJson: rx.labTestsJson,
        abnormalFindings: rx.abnormalFindings,
        doctorNotes: notes || rx.doctorNotes,
        tags: rx.tags,
        important,
      },
    });
  }

  function getDocumentTypeBadge(type?: DocumentType) {
    switch (type) {
      case "lab_report":
        return (
          <Badge variant="success" className="gap-1 text-[11px]">
            <FlaskConical className="h-3 w-3" />
            {t("docTypeLabReport")}
          </Badge>
        );
      case "discharge_summary":
        return (
          <Badge variant="default" className="gap-1 text-[11px] bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800">
            <FileText className="h-3 w-3" />
            {t("docTypeDischargeSummary")}
          </Badge>
        );
      case "diagnostic_record":
        return (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <Activity className="h-3 w-3" />
            {t("docTypeDiagnosticRecord")}
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="gap-1 text-[11px]">
            <Stethoscope className="h-3 w-3" />
            {t("docTypePrescription")}
          </Badge>
        );
    }
  }

  return (
    <Card
      className={`transition-all ${
        important
          ? "border-amber-300 dark:border-amber-600/70 bg-amber-50/20 dark:bg-amber-950/20 shadow-sm"
          : "hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-2">
              {getDocumentTypeBadge(rx.documentType)}

              {rx.documentDate && (
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  {rx.documentDate}
                </span>
              )}

              <span className="text-xs text-gray-500 dark:text-gray-400">
                • Digitized {formatDateTime(rx.createdAt)}
              </span>

              <button
                type="button"
                onClick={handleToggleImportant}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                  important
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Star
                  className={`h-3 w-3 ${important ? "fill-amber-500 text-amber-500" : "text-gray-400 dark:text-gray-500"}`}
                />
                {important ? `⭐ ${t("priority")}` : t("important")}
              </button>

              {rx.ocrConfidence !== null && (
                <Badge
                  variant={
                    (rx.ocrConfidence ?? 0) >= 85
                      ? "success"
                      : (rx.ocrConfidence ?? 0) >= 65
                      ? "default"
                      : "warning"
                  }
                  className="text-[11px]"
                >
                  OCR: {rx.ocrConfidence}%
                </Badge>
              )}
            </div>

            {/* Diagnoses */}
            {rx.diagnoses && rx.diagnoses.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  Dx:
                </span>
                {rx.diagnoses.map((diag, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-0.5 font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800/80">
                    {diag}
                  </Badge>
                ))}
              </div>
            )}

            {/* AI Health Summary in Simple Language Card */}
            {rx.plainLanguageSummary && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-white dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-gray-900 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                  <HeartPulse className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t("simpleHealthSummaryHeading")}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line font-normal">
                  {rx.plainLanguageSummary}
                </p>

                {/* Abnormal Findings List */}
                {rx.abnormalFindings && rx.abnormalFindings.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {t("abnormalFindingsAlertHeading")}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rx.abnormalFindings.map((finding, idx) => (
                        <div key={idx} className="p-2 rounded-md bg-white/90 dark:bg-gray-800/90 border border-amber-200/80 dark:border-amber-900/50 text-[11px] space-y-0.5">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-gray-900 dark:text-gray-100">{finding.item}</span>
                            <Badge variant={finding.severity === "critical" ? "destructive" : "warning"} className="text-[10px] px-1 py-0">
                              {finding.value}
                            </Badge>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-[10px]">Normal: {finding.normalRange}</p>
                          <p className="text-amber-900 dark:text-amber-200 pt-0.5 font-normal">{finding.plainExplanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Physician Clinical Summary (if plain language summary is not set or physician view) */}
            {!rx.plainLanguageSummary && (
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                {rx.aiSummary}
              </p>
            )}

            {/* Lab Tests Table / Badges if present */}
            {rx.labTestsJson && rx.labTestsJson.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {t("labTestsHeading")} ({rx.labTestsJson.length}):
                </span>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="py-2 px-3">{t("testNameCol")}</th>
                        <th className="py-2 px-3">{t("valueCol")}</th>
                        <th className="py-2 px-3">{t("referenceRangeCol")}</th>
                        <th className="py-2 px-3">{t("statusCol")}</th>
                        <th className="py-2 px-3">{t("interpretationCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      {rx.labTestsJson.map((test, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-2 px-3 font-semibold text-gray-900 dark:text-gray-100">{test.testName}</td>
                          <td className="py-2 px-3 font-bold text-gray-900 dark:text-gray-100">{test.value} {test.unit || ""}</td>
                          <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{test.referenceRange || "—"}</td>
                          <td className="py-2 px-3">
                            <Badge
                              variant={
                                test.status === "Critical"
                                  ? "destructive"
                                  : test.status === "High"
                                  ? "warning"
                                  : test.status === "Low"
                                  ? "default"
                                  : "success"
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {test.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{test.interpretation || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Medicine badges */}
            {rx.medicinesJson && rx.medicinesJson.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
                  <Pill className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Rx:
                </span>
                {rx.medicinesJson.map((med, i) => (
                  <Badge
                    key={i}
                    variant={med.isUncertain ? "warning" : "success"}
                    className="text-xs py-0.5"
                  >
                    {med.name} {med.dosage ? `(${med.dosage})` : ""}
                    {med.frequency ? ` • ${med.frequency}` : ""}
                    {med.purpose ? ` • ${med.purpose}` : ""}
                  </Badge>
                ))}
              </div>
            )}

            {/* Tags */}
            {rx.tags && rx.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {rx.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Doctor Notes Box */}
            <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  {t("physicianRemarksTitle")}
                </span>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] cursor-pointer"
                  >
                    {notes ? t("editNotesBtn") : t("addNotesBtn")}
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div className="space-y-2 mt-1">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder={t("doctorRemarksPlaceholder")}
                    className="text-xs"
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingNotes(false)}
                      className="h-7 text-xs"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Check className="h-3 w-3" />
                      {t("saveNotesBtn")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {notes || t("noPhysicianRemarks")}
                </p>
              )}
            </div>

            {/* Expand / Collapse Full Details */}
            {expanded && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-3 animate-in fade-in-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {t("rawTextHeading")}
                    </h5>
                    <pre className="p-2.5 bg-gray-900 text-gray-200 rounded text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-800">
                      {rx.rawOcr || "No raw text available."}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {t("correctedTextHeading")}
                    </h5>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {rx.correctedText || "No transcription available."}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Thumbnail & Actions */}
          <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
            {rx.imageUrl && (
              <div className="h-28 w-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 flex items-center justify-center flex-shrink-0">
                <img
                  src={rx.imageUrl}
                  alt="Medical Document"
                  className="max-h-full max-w-full object-contain cursor-pointer"
                  onClick={() => window.open(rx.imageUrl, "_blank")}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                className="gap-1 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                {t("exportPdf")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="gap-1 text-xs text-gray-600 dark:text-gray-300"
              >
                {expanded ? (
                  <>
                    <span>{t("lessOcrBtn")}</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>{t("compareOcrBtn")}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                title={t("delete")}
                className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
