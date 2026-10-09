"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Phone, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { searchPatients } from "@/actions";
import { PatientDialog } from "./patient-dialog";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/language";
import type { Patient } from "@/lib/db/schema";

type PatientWithCount = Patient & { prescriptions: { id: string }[] };

export function PatientList({ initialPatients }: { initialPatients: PatientWithCount[] }) {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<PatientWithCount[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setPatients(initialPatients);
      return;
    }
    setSearching(true);
    try {
      const results = await searchPatients(query);
      setPatients(results as PatientWithCount[]);
    } finally {
      setSearching(false);
    }
  }

  function formatGender(gender: string) {
    if (gender.toLowerCase() === "male") return t("genderMale");
    if (gender.toLowerCase() === "female") return t("genderFemale");
    return t("genderOther");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("patientsTitle")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("patientsSubtitle")}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder={t("searchPatientsPlaceholder")}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          {t("addPatient")}
        </Button>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {searchQuery ? t("noPatientsFound") : t("noPatientsYet")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? t("tryDifferentSearch") : t("addFirstPatientDesc")}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  {t("addPatient")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.age} {t("yrsOld")}, {formatGender(patient.gender)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(patient.createdAt)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <Badge variant="secondary">
                      {patient.prescriptions.length} {t("prescriptionsCountSuffix")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <PatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
