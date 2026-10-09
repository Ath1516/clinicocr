"use server";

import { db, isDatabaseConnected } from "@/lib/db";
import { patients, prescriptions } from "@/lib/db/schema";
import type { MedicineItem, LabTestItem, AbnormalFinding, DocumentType } from "@/types";
import { eq, desc, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { analyzeWithGemini } from "@/lib/ocr/gemini";
import { mockDb } from "@/lib/db/mock-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore outside request store
  }
}

export async function getPatients() {
  if (!isDatabaseConnected) {
    return mockDb.getPatients();
  }
  try {
    return await db.query.patients.findMany({
      orderBy: [desc(patients.createdAt)],
      with: {
        prescriptions: {
          columns: { id: true },
        },
      },
    });
  } catch (err) {
    console.warn("DB query failed, using mock store fallback:", err);
    return mockDb.getPatients();
  }
}

export async function getPatientById(id: string) {
  if (!isDatabaseConnected) {
    return mockDb.getPatientById(id);
  }
  try {
    return await db.query.patients.findFirst({
      where: eq(patients.id, id),
      with: {
        prescriptions: {
          orderBy: [desc(prescriptions.createdAt)],
        },
      },
    });
  } catch (err) {
    console.warn("DB query failed, using mock store fallback:", err);
    return mockDb.getPatientById(id);
  }
}

export async function createPatient(data: {
  name: string;
  age: number;
  gender: string;
  phone: string;
}) {
  if (!isDatabaseConnected) {
    const patient = await mockDb.createPatient(data);
    safeRevalidate("/patients");
    safeRevalidate("/dashboard");
    return patient;
  }
  try {
    const [patient] = await db.insert(patients).values(data).returning();
    safeRevalidate("/patients");
    safeRevalidate("/dashboard");
    return patient;
  } catch (err) {
    console.warn("DB insert failed, using mock store fallback:", err);
    const patient = await mockDb.createPatient(data);
    safeRevalidate("/patients");
    safeRevalidate("/dashboard");
    return patient;
  }
}

export async function updatePatient(
  id: string,
  data: { name: string; age: number; gender: string; phone: string }
) {
  if (!isDatabaseConnected) {
    const patient = await mockDb.updatePatient(id, data);
    safeRevalidate("/patients");
    safeRevalidate(`/patients/${id}`);
    return patient;
  }
  try {
    const [patient] = await db
      .update(patients)
      .set(data)
      .where(eq(patients.id, id))
      .returning();
    safeRevalidate("/patients");
    safeRevalidate(`/patients/${id}`);
    return patient;
  } catch (err) {
    console.warn("DB update failed, using mock store fallback:", err);
    const patient = await mockDb.updatePatient(id, data);
    safeRevalidate("/patients");
    safeRevalidate(`/patients/${id}`);
    return patient;
  }
}

export async function deletePatient(id: string) {
  if (!isDatabaseConnected) {
    await mockDb.deletePatient(id);
    safeRevalidate("/patients");
    safeRevalidate("/dashboard");
    return;
  }
  try {
    await db.delete(patients).where(eq(patients.id, id));
    safeRevalidate("/patients");
    safeRevalidate("/dashboard");
  } catch (err) {
    console.warn("DB delete failed, using mock store fallback:", err);
    await mockDb.deletePatient(id);
    safeRevalidate("/patients");
    safeRevalidate("/dashboard");
  }
}

export async function searchPatients(query: string) {
  if (!isDatabaseConnected) {
    return mockDb.searchPatients(query);
  }
  try {
    if (!query.trim()) return getPatients();
    const searchTerm = `%${query}%`;
    return await db.query.patients.findMany({
      where: or(
        like(patients.name, searchTerm),
        like(patients.phone, searchTerm)
      ),
      orderBy: [desc(patients.createdAt)],
      with: {
        prescriptions: {
          columns: { id: true },
        },
      },
    });
  } catch (err) {
    console.warn("DB search failed, using mock store fallback:", err);
    return mockDb.searchPatients(query);
  }
}

// ==================== PRESCRIPTION ACTIONS ====================

export async function processPrescription(
  rawOcrText: string,
  options?: { imageBase64?: string; mimeType?: string }
) {
  const aiResult = await analyzeWithGemini(rawOcrText, options);
  return aiResult;
}

export async function savePrescription(data: {
  patientId: string;
  imageUrl: string;
  rawOcr: string;
  ocrConfidence: number;
  documentType?: DocumentType;
  documentDate?: string;
  diagnoses?: string[];
  correctedText: string;
  aiSummary: string;
  plainLanguageSummary?: string;
  medicinesJson: MedicineItem[];
  labTestsJson?: LabTestItem[];
  abnormalFindings?: AbnormalFinding[];
  doctorNotes?: string;
  tags: string[];
  important?: boolean;
}) {
  if (!isDatabaseConnected) {
    const rx = await mockDb.savePrescription(data);
    safeRevalidate(`/patients/${data.patientId}`);
    safeRevalidate("/dashboard");
    safeRevalidate("/prescriptions");
    return rx;
  }
  try {
    const [prescription] = await db
      .insert(prescriptions)
      .values({
        patientId: data.patientId,
        imageUrl: data.imageUrl,
        rawOcr: data.rawOcr,
        ocrConfidence: data.ocrConfidence,
        documentType: data.documentType || "prescription",
        documentDate: data.documentDate || new Date().toISOString().split("T")[0],
        diagnoses: data.diagnoses || [],
        correctedText: data.correctedText,
        aiSummary: data.aiSummary,
        plainLanguageSummary: data.plainLanguageSummary || null,
        medicinesJson: data.medicinesJson,
        labTestsJson: data.labTestsJson || [],
        abnormalFindings: data.abnormalFindings || [],
        doctorNotes: data.doctorNotes || null,
        tags: data.tags,
        important: data.important || false,
      })
      .returning();
    safeRevalidate(`/patients/${data.patientId}`);
    safeRevalidate("/dashboard");
    safeRevalidate("/prescriptions");
    return prescription;
  } catch (err) {
    console.warn("DB save prescription failed, using mock store fallback:", err);
    const rx = await mockDb.savePrescription(data);
    safeRevalidate(`/patients/${data.patientId}`);
    safeRevalidate("/dashboard");
    safeRevalidate("/prescriptions");
    return rx;
  }
}

export async function updatePrescriptionNotes(id: string, notes: string) {
  if (!isDatabaseConnected) {
    const rx = await mockDb.updatePrescriptionNotes(id, notes);
    safeRevalidate(`/patients/${rx.patientId}`);
    return rx;
  }
  try {
    const [prescription] = await db
      .update(prescriptions)
      .set({ doctorNotes: notes })
      .where(eq(prescriptions.id, id))
      .returning();
    safeRevalidate(`/patients/${prescription.patientId}`);
    return prescription;
  } catch (err) {
    console.warn("DB update notes failed, using mock store fallback:", err);
    const rx = await mockDb.updatePrescriptionNotes(id, notes);
    safeRevalidate(`/patients/${rx.patientId}`);
    return rx;
  }
}

export async function toggleImportant(id: string) {
  if (!isDatabaseConnected) {
    const rx = await mockDb.toggleImportant(id);
    safeRevalidate(`/patients/${rx.patientId}`);
    return rx;
  }
  try {
    const existing = await db.query.prescriptions.findFirst({
      where: eq(prescriptions.id, id),
    });
    if (!existing) throw new Error("Prescription not found");

    const [updated] = await db
      .update(prescriptions)
      .set({ important: !existing.important })
      .where(eq(prescriptions.id, id))
      .returning();
    safeRevalidate(`/patients/${updated.patientId}`);
    return updated;
  } catch (err) {
    console.warn("DB toggle important failed, using mock store fallback:", err);
    const rx = await mockDb.toggleImportant(id);
    safeRevalidate(`/patients/${rx.patientId}`);
    return rx;
  }
}

export async function deletePrescription(id: string, patientId: string) {
  if (!isDatabaseConnected) {
    await mockDb.deletePrescription(id, patientId);
    safeRevalidate(`/patients/${patientId}`);
    safeRevalidate("/dashboard");
    return;
  }
  try {
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
    safeRevalidate(`/patients/${patientId}`);
    safeRevalidate("/dashboard");
  } catch (err) {
    console.warn("DB delete prescription failed, using mock store fallback:", err);
    await mockDb.deletePrescription(id, patientId);
    safeRevalidate(`/patients/${patientId}`);
    safeRevalidate("/dashboard");
  }
}

export async function getPrescriptionById(id: string) {
  if (!isDatabaseConnected) {
    return mockDb.getPrescriptionById(id);
  }
  try {
    return await db.query.prescriptions.findFirst({
      where: eq(prescriptions.id, id),
      with: {
        patient: true,
      },
    });
  } catch (err) {
    console.warn("DB get prescription failed, using mock store fallback:", err);
    return mockDb.getPrescriptionById(id);
  }
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  if (!isDatabaseConnected) {
    return mockDb.getDashboardStats();
  }
  try {
    const totalPatients = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients);
    const totalPrescriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(prescriptions);
    const recentPrescriptions = await db.query.prescriptions.findMany({
      orderBy: [desc(prescriptions.createdAt)],
      limit: 5,
      with: {
        patient: true,
      },
    });

    return {
      totalPatients: Number(totalPatients[0].count),
      totalPrescriptions: Number(totalPrescriptions[0].count),
      recentPrescriptions,
    };
  } catch (err) {
    console.warn("DB stats failed, using mock store fallback:", err);
    return mockDb.getDashboardStats();
  }
}

// ==================== SEARCH (Phase 2) ====================

export async function searchPrescriptions(query: string) {
  if (!query.trim()) return [];
  if (!isDatabaseConnected) {
    return mockDb.searchPrescriptions(query);
  }
  try {
    const searchTerm = `%${query}%`;
    const results = await db.query.prescriptions.findMany({
      where: or(
        like(prescriptions.correctedText, searchTerm),
        like(prescriptions.aiSummary, searchTerm),
        sql`${prescriptions.medicinesJson}::text ILIKE ${searchTerm}`,
        sql`${prescriptions.tags}::text ILIKE ${searchTerm}`
      ),
      orderBy: [desc(prescriptions.createdAt)],
      limit: 20,
      with: {
        patient: true,
      },
    });

    return results;
  } catch (err) {
    console.warn("DB search failed, using mock store fallback:", err);
    return mockDb.searchPrescriptions(query);
  }
}
