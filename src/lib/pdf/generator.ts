import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { MedicineItem, LabTestItem, AbnormalFinding, DocumentType } from "@/types";

export interface PrescriptionPdfData {
  patient: {
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  prescription: {
    id: string;
    createdAt: Date | string;
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
  };
}

export function generatePrescriptionPdf(data: PrescriptionPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { patient, prescription } = data;
  const primaryColor: [number, number, number] = [37, 99, 235]; // Tailwind blue-600
  const darkGray: [number, number, number] = [31, 41, 55];
  const lightGray: [number, number, number] = [107, 114, 128];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ClinicOCR", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const docTypeLabel = (prescription.documentType || "Medical Record")
    .replace("_", " ")
    .toUpperCase();
  doc.text(`AI Clinical Intelligence — ${docTypeLabel}`, 14, 20);

  const formattedDate = prescription.documentDate || new Date(prescription.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setFontSize(9);
  doc.text(`Date: ${formattedDate}`, 155, 14);
  doc.text(`Ref ID: ${prescription.id.slice(0, 8)}`, 155, 20);

  // Patient Info Box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, 30, 182, 22, 2, 2, "F");

  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Patient: ${patient.name}`, 18, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Age / Gender: ${patient.age} yrs / ${patient.gender}`, 18, 46);
  doc.text(`Phone: ${patient.phone}`, 90, 46);

  if (prescription.important) {
    doc.setTextColor(217, 119, 6);
    doc.setFont("helvetica", "bold");
    doc.text("★ PRIORITY RECORD", 145, 38);
  }

  let currentY = 58;

  // Diagnoses Section
  if (prescription.diagnoses && prescription.diagnoses.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Diagnoses & Clinical Indications:", 14, currentY);

    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(prescription.diagnoses.join(" • "), 80, currentY);
    currentY += 8;
  }

  // AI Health Summary in Simple Language
  if (prescription.plainLanguageSummary) {
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.roundedRect(14, currentY, 182, 26, 2, 2, "F");

    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AI Health Summary in Simple Language (Patient Explanation):", 18, currentY + 6);

    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const plainLines = doc.splitTextToSize(prescription.plainLanguageSummary, 174);
    doc.text(plainLines.slice(0, 3), 18, currentY + 12);
    currentY += 32;
  } else {
    // Physician Clinical Summary
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Clinical Summary", 14, currentY);

    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(prescription.aiSummary, 182);
    doc.text(summaryLines, 14, currentY + 5);
    currentY += 5 + summaryLines.length * 4.5 + 4;
  }

  // Lab Tests Table if present
  if (prescription.labTestsJson && prescription.labTestsJson.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Laboratory & Diagnostic Findings", 14, currentY);

    const labTableBody = prescription.labTestsJson.map((test, index) => [
      (index + 1).toString(),
      test.testName,
      `${test.value} ${test.unit || ""}`.trim(),
      test.referenceRange || "—",
      test.status,
      test.interpretation || "—",
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [["#", "Test / Metric", "Result", "Normal Target", "Status", "Clinical Meaning"]],
      body: labTableBody,
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129], // Emerald
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 46, fontStyle: "bold" },
        2: { cellWidth: 24, fontStyle: "bold" },
        3: { cellWidth: 32 },
        4: { cellWidth: 20 },
        5: { cellWidth: 52 },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY + 6 || currentY + 35;
  }

  // Medicines Table
  if (prescription.medicinesJson && prescription.medicinesJson.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Rx — Prescribed Medications", 14, currentY);

    const tableBody = prescription.medicinesJson.map((med, index) => [
      (index + 1).toString(),
      med.name + (med.isUncertain ? " (Possibly)" : ""),
      med.dosage || "—",
      med.frequency || "—",
      med.duration || "—",
      med.purpose || "—",
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [["#", "Medicine Name", "Dosage", "Timing", "Duration", "Indication"]],
      body: tableBody,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 48, fontStyle: "bold" },
        2: { cellWidth: 24 },
        3: { cellWidth: 34 },
        4: { cellWidth: 24 },
        5: { cellWidth: 44 },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY + 6 || currentY + 35;
  }

  // Doctor Notes
  if (prescription.doctorNotes) {
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Physician Remarks", 14, currentY);

    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    const doctorLines = doc.splitTextToSize(prescription.doctorNotes, 182);
    doc.text(doctorLines, 14, currentY + 4);
    currentY += 4 + doctorLines.length * 4 + 4;
  }

  // Footer / Disclaimer
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 275, 196, 275);

  doc.setTextColor(...lightGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Generated via ClinicOCR medical document intelligence. Verified and authorized by the physician.",
    14,
    281
  );
  doc.text(
    "Doctor's Signature: _______________________",
    135,
    281
  );

  return doc;
}

export function downloadPrescriptionPdf(data: PrescriptionPdfData) {
  const doc = generatePrescriptionPdf(data);
  const patientSlug = data.patient.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const filename = `ClinicOCR-${patientSlug}-${data.prescription.id.slice(0, 6)}.pdf`;
  doc.save(filename);
}
