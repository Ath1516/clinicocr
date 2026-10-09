"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Calendar,
  User,
  Phone,
  Pill,
  Star,
  Download,
  ExternalLink,
  Loader2,
  Stethoscope,
  FlaskConical,
  Activity,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";
import { searchPrescriptions } from "@/actions";
import { formatDateTime } from "@/lib/utils";
import { downloadPrescriptionPdf } from "@/lib/pdf/generator";
import { useLanguage } from "@/language";
import type { MedicineItem, LabTestItem, AbnormalFinding, DocumentType } from "@/types";

interface PrescriptionSearchResult {
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
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
}

export function SearchView({ initialResults }: { initialResults: PrescriptionSearchResult[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PrescriptionSearchResult[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setResults(initialResults);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchPrescriptions(query);
      setResults(data as unknown as PrescriptionSearchResult[]);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPdf(rx: PrescriptionSearchResult) {
    downloadPrescriptionPdf({
      patient: rx.patient,
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
        doctorNotes: rx.doctorNotes,
        tags: rx.tags,
        important: rx.important,
      },
    });
  }

  function formatGender(gender: string) {
    if (gender.toLowerCase() === "male") return t("genderMale");
    if (gender.toLowerCase() === "female") return t("genderFemale");
    return t("genderOther");
  }

  function getDocTypeBadge(type?: DocumentType) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("searchTitle")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t("searchSubtitle")}</p>
      </div>

      {/* Search Bar Card */}
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="pl-9 h-11 text-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {t("search")}
            </Button>
          </form>

          {/* Quick Filter Tag Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{t("quickFiltersLabel")}</span>
            {["HbA1c", "Diabetes", "Augmentin", "Creatinine", "Hypertension", "Ramesh"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setLoading(true);
                  setSearched(true);
                  searchPrescriptions(tag).then((res) => {
                    setResults(res as unknown as PrescriptionSearchResult[]);
                    setLoading(false);
                  });
                }}
                className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {searched ? `${t("searchResultsHeading")} (${results.length})` : `${t("allPrescriptionsHeading")} (${results.length})`}
        </h2>
        {searched && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setResults(initialResults);
              setSearched(false);
            }}
          >
            {t("clearSearchBtn")}
          </Button>
        )}
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("noSearchResultsTitle")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("noSearchResultsDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((rx) => (
            <Card
              key={rx.id}
              className={`transition-all hover:shadow-sm ${
                rx.important
                  ? "border-amber-300 dark:border-amber-600/70 bg-amber-50/20 dark:bg-amber-950/20"
                  : "hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Patient & Date Meta */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getDocTypeBadge(rx.documentType)}

                      <Link
                        href={`/patients/${rx.patient.id}`}
                        className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base flex items-center gap-1.5"
                      >
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        {rx.patient.name} ({rx.patient.age} {t("yrsOld")}, {formatGender(rx.patient.gender)})
                      </Link>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {rx.patient.phone}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rx.documentDate || formatDateTime(rx.createdAt)}
                      </span>
                      {rx.important && (
                        <Badge variant="warning" className="gap-1 text-xs">
                          <Star className="h-3 w-3 fill-amber-500" />
                          {t("important")}
                        </Badge>
                      )}
                      {rx.ocrConfidence !== null && (
                        <Badge
                          variant={
                            (rx.ocrConfidence ?? 0) >= 85
                              ? "success"
                              : (rx.ocrConfidence ?? 0) >= 65
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          OCR: {rx.ocrConfidence}%
                        </Badge>
                      )}
                    </div>

                    {/* Diagnoses */}
                    {rx.diagnoses && rx.diagnoses.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          Dx:
                        </span>
                        {rx.diagnoses.map((diag, i) => (
                          <Badge key={i} variant="outline" className="text-xs py-0.5 font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
                            {diag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Simple Health Summary or Clinical Summary */}
                    {rx.plainLanguageSummary ? (
                      <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                        <div className="flex items-center gap-1 font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                          <HeartPulse className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{t("simpleHealthSummaryHeading")}</span>
                        </div>
                        <p className="line-clamp-3">{rx.plainLanguageSummary}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rx.aiSummary}</p>
                    )}

                    {/* Lab Tests Badges */}
                    {rx.labTestsJson && rx.labTestsJson.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
                          <FlaskConical className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          Tests:
                        </span>
                        {rx.labTestsJson.map((test, idx) => (
                          <Badge
                            key={idx}
                            variant={
                              test.status === "Critical"
                                ? "destructive"
                                : test.status === "High"
                                ? "warning"
                                : test.status === "Low"
                                ? "default"
                                : "success"
                            }
                            className="text-xs py-0.5"
                          >
                            {test.testName}: {test.value} {test.unit || ""}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Medicines Badges */}
                    {rx.medicinesJson && rx.medicinesJson.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1">Rx:</span>
                        {rx.medicinesJson.map((med, idx) => (
                          <Badge
                            key={idx}
                            variant={med.isUncertain ? "warning" : "success"}
                            className="text-xs py-0.5"
                          >
                            <Pill className="h-3 w-3 mr-1" />
                            {med.name} {med.dosage ? `(${med.dosage})` : ""}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {rx.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {rx.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[11px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions / Export / Thumbnail */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(rx)}
                      className="gap-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t("exportPdf")}
                    </Button>
                    <Link href={`/patients/${rx.patient.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600 dark:text-blue-400">
                        <span>{t("patientProfileBtn")}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
