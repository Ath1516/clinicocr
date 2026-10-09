"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { deletePatient } from "@/actions";
import { PatientDialog } from "./patient-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/language";
import type { Patient } from "@/lib/db/schema";

export function PatientActions({ patient }: { patient: Patient }) {
  const { t } = useLanguage();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(t("deletePatientConfirm"))) {
      return;
    }
    setDeleting(true);
    try {
      await deletePatient(patient.id);
      toast.success(t("patientDeletedSuccess"));
      router.push("/patients");
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setEditOpen(true)} title={t("edit")}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDelete}
        disabled={deleting}
        title={t("delete")}
        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <PatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
        onSuccess={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
