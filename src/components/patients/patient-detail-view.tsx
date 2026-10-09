"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  Phone,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PatientActions } from "@/components/patients/patient-actions";
import { PrescriptionCard } from "@/components/patients/prescription-card";
import { useLanguage } from "@/language";

interface PatientDetailViewProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    createdAt: Date | string;
    prescriptions: any[];
  };
}

export function PatientDetailView({ patient }: PatientDetailViewProps) {
  const { t } = useLanguage();

  const sortedPrescriptions = [...patient.prescriptions].sort((a, b) => {
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  function formatGender(gender: string) {
    if (gender.toLowerCase() === "male") return t("genderMale");
    if (gender.toLowerCase() === "female") return t("genderFemale");
    return t("genderOther");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button variant="ghost" size="icon" title={t("back")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {patient.age} {t("yrsOld")}, {formatGender(patient.gender)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {patient.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {t("registeredOn")} {formatDate(patient.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PatientActions patient={patient as any} />
          <Link href={`/upload?patientId=${patient.id}`}>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="h-4 w-4" />
              {t("uploadPrescriptionBtn")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Prescriptions Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("prescriptionTimelineHeading")} ({patient.prescriptions.length})
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("sortedByPriorityNote")}
          </span>
        </div>

        {sortedPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("noHistoryYet")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 mt-1">
                {t("uploadForThisPatient")}
              </p>
              <Link href={`/upload?patientId=${patient.id}`}>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="h-4 w-4" />
                  {t("uploadFirstForPatientBtn")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedPrescriptions.map((rx) => (
              <PrescriptionCard
                key={rx.id}
                rx={rx as any}
                patient={{
                  id: patient.id,
                  name: patient.name,
                  age: patient.age,
                  gender: patient.gender,
                  phone: patient.phone,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
