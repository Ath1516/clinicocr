"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Clock, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/language";

interface DashboardViewProps {
  stats: {
    totalPatients: number;
    totalPrescriptions: number;
    recentPrescriptions: any[];
  };
}

export function DashboardView({ stats }: DashboardViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboardTitle")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("dashboardSubtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/patients">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addPatient")}
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="h-4 w-4" />
              {t("newPrescription")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("totalPatients")}
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("totalPrescriptions")}
            </CardTitle>
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPrescriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("recentActivity")}
            </CardTitle>
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.recentPrescriptions.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("recentUploadsCount")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentPrescriptionsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {t("noPrescriptionsYet")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t("uploadFirstPrescriptionDesc")}
              </p>
              <Link href="/upload">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="h-4 w-4" />
                  {t("uploadPrescriptionBtn")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {rx.patient.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(rx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rx.documentType && (
                      <Badge variant="outline" className="text-xs uppercase font-medium">
                        {rx.documentType.replace("_", " ")}
                      </Badge>
                    )}
                    {rx.important && (
                      <Badge variant="warning">⭐ {t("important")}</Badge>
                    )}
                    {(rx.tags as string[]).slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    <Link href={`/patients/${rx.patientId}`}>
                      <Button variant="ghost" size="sm">
                        {t("view")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
