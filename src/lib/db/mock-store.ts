import type { MedicineItem, LabTestItem, AbnormalFinding, DocumentType } from "@/types";

export interface MockPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  createdAt: Date;
  prescriptions: MockPrescriptionSummary[];
}

export interface MockPrescriptionSummary {
  id: string;
  patientId?: string;
  createdAt?: Date;
  important?: boolean;
}

export interface MockPrescription {
  id: string;
  patientId: string;
  imageUrl: string;
  rawOcr: string;
  ocrConfidence: number;
  documentType: DocumentType;
  documentDate: string;
  diagnoses: string[];
  correctedText: string;
  aiSummary: string;
  plainLanguageSummary: string;
  medicinesJson: MedicineItem[];
  labTestsJson: LabTestItem[];
  abnormalFindings: AbnormalFinding[];
  doctorNotes: string | null;
  tags: string[];
  important: boolean;
  createdAt: Date;
  patient?: MockPatient;
}

// In-memory persistent state across requests in Node server process
let seedInitialized = false;
let patientsStore: MockPatient[] = [];
let prescriptionsStore: MockPrescription[] = [];

function initSeed() {
  if (seedInitialized) return;
  seedInitialized = true;

  const patient1Id = "p1-uuid-1111-2222-333344445555";
  const patient2Id = "p2-uuid-2222-3333-444455556666";
  const patient3Id = "p3-uuid-3333-4444-555566667777";

  const rx1Id = "rx1-uuid-aaaa-bbbb-ccccddddeeee";
  const rx2Id = "rx2-uuid-bbbb-cccc-ddddeeeeffff";
  const rx3Id = "rx3-uuid-cccc-dddd-eeeeffff0000";

  const p1: MockPatient = {
    id: patient1Id,
    name: "Ramesh Sharma",
    age: 54,
    gender: "Male",
    phone: "+91 98765 43210",
    createdAt: new Date(Date.now() - 14 * 86400000),
    prescriptions: [{ id: rx1Id }, { id: rx2Id }],
  };

  const p2: MockPatient = {
    id: patient2Id,
    name: "Priya Patel",
    age: 32,
    gender: "Female",
    phone: "+91 91234 56789",
    createdAt: new Date(Date.now() - 5 * 86400000),
    prescriptions: [{ id: rx3Id }],
  };

  const p3: MockPatient = {
    id: patient3Id,
    name: "Ananya Deshmukh",
    age: 8,
    gender: "Female",
    phone: "+91 98111 22334",
    createdAt: new Date(Date.now() - 1 * 86400000),
    prescriptions: [],
  };

  patientsStore = [p1, p2, p3];

  // 1. Prescription Record
  const rx1: MockPrescription = {
    id: rx1Id,
    patientId: patient1Id,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    rawOcr: "Rx\nAugmentin 625mg TDS x 5d\nTab Paracetamol 650mg SOS\nTab Pantocid 40mg OD ac x 5d\nAdv: Steam inhal 2x daily",
    ocrConfidence: 88,
    documentType: "prescription",
    documentDate: "2026-09-26",
    diagnoses: ["Acute Bronchitis", "Upper Respiratory Tract Infection"],
    correctedText: "Rx:\n1. Tab Augmentin 625mg - 1 tablet three times daily (TDS) for 5 days\n2. Tab Paracetamol 650mg - 1 tablet as needed (SOS) for fever\n3. Tab Pantocid 40mg - 1 tablet once daily (OD) before meals (ac) for 5 days\nAdvice: Steam inhalation twice daily",
    aiSummary: "Patient presented with acute upper respiratory tract symptoms and moderate fever. Prescribed Augmentin antibiotic, Paracetamol antipyretic, and Pantocid gastroprotection for 5 days.",
    plainLanguageSummary: "Health Overview:\nYou have a chest and throat infection causing fever and cough. The doctor has prescribed an antibiotic (Augmentin) to kill the bacteria, Paracetamol to keep fever down, and an antacid (Pantocid) to prevent acidity. Be sure to finish all 5 days of the antibiotic even if you feel better.",
    medicinesJson: [
      { name: "Augmentin", dosage: "625mg", frequency: "TDS (3x daily)", duration: "5 days", purpose: "Broad spectrum antibiotic for infection", isUncertain: false },
      { name: "Paracetamol", dosage: "650mg", frequency: "SOS (as needed)", duration: "3-5 days", purpose: "Fever and mild-to-moderate pain relief", isUncertain: false },
      { name: "Pantocid", dosage: "40mg", frequency: "OD (1x daily before breakfast)", duration: "5 days", purpose: "Acid reduction and stomach protection", isUncertain: false },
    ],
    labTestsJson: [],
    abnormalFindings: [],
    doctorNotes: "Review after 5 days if fever persists beyond 48 hours or symptoms worsen.",
    tags: ["Respiratory", "Antibiotic", "Fever"],
    important: true,
    createdAt: new Date(Date.now() - 7 * 86400000),
  };

  // 2. Comprehensive Lab Report with Abnormal Values & Plain Explanation
  const rx2: MockPrescription = {
    id: rx2Id,
    patientId: patient1Id,
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80",
    rawOcr: "CLINICAL BIOCHEMISTRY REPORT\nHbA1c: 8.4 %\nFasting Blood Sugar: 146 mg/dL\nSerum Creatinine: 1.4 mg/dL\nHemoglobin: 11.2 g/dL\nTotal Cholesterol: 228 mg/dL\nBP: 138/88 mmHg",
    ocrConfidence: 94,
    documentType: "lab_report",
    documentDate: "2026-10-02",
    diagnoses: ["Type 2 Diabetes Mellitus (Uncontrolled)", "Mild Chronic Kidney Strain", "Hypercholesterolemia"],
    correctedText: "Clinical Laboratory Report:\n• HbA1c (Glycated Hemoglobin): 8.4% (Normal: < 5.7%)\n• Fasting Blood Sugar: 146 mg/dL (Normal: 70 - 99 mg/dL)\n• Serum Creatinine: 1.4 mg/dL (Normal: 0.6 - 1.2 mg/dL)\n• Hemoglobin: 11.2 g/dL (Normal: 12.0 - 16.0 g/dL)\n• Total Cholesterol: 228 mg/dL (Normal: < 200 mg/dL)\n• Blood Pressure: 138/88 mmHg",
    aiSummary: "Comprehensive metabolic panel demonstrating significant glycemic dysregulation (HbA1c 8.4%, FBS 146 mg/dL), mild renal function decline with elevated creatinine (1.4 mg/dL), mild anemia (Hb 11.2 g/dL), and dyslipidemia (Total Cholesterol 228 mg/dL).",
    plainLanguageSummary: "AI Health Summary in Simple Language:\n• HbA1c is 8.4% (healthy target: below 5.7%): This reflects your average blood sugar over the last 3 months. A value of 8.4% means your blood sugar has been running high, indicating diabetes that needs stricter management.\n• Fasting Blood Sugar is 146 mg/dL (healthy target: below 100 mg/dL): Your morning sugar before breakfast is elevated.\n• Serum Creatinine is 1.4 mg/dL (normal target: up to 1.2 mg/dL): Creatinine is a waste product filtered by your kidneys. A slight elevation suggests your kidneys are working under extra strain and need protection by controlling blood sugar and blood pressure.\n• Hemoglobin is 11.2 g/dL (normal: 12-16 g/dL): Slightly low red blood cells (mild anemia), which can make you feel tired.\n• Total Cholesterol is 228 mg/dL (target: under 200 mg/dL): Extra cholesterol in the bloodstream that should be lowered with dietary improvements.\n\nNext Steps: Meet your doctor to adjust your diabetes medication, drink adequate water, reduce fried/sugary foods, and repeat tests in 3 months.",
    medicinesJson: [
      { name: "Glycomet-SR", dosage: "500mg", frequency: "BD (Twice daily after meals)", duration: "Ongoing", purpose: "Blood sugar reduction", isUncertain: false },
      { name: "Atorvastatin", dosage: "10mg", frequency: "OD at bedtime", duration: "Ongoing", purpose: "Cholesterol control", isUncertain: false },
    ],
    labTestsJson: [
      { testName: "HbA1c (Glycated Hemoglobin)", value: "8.4", unit: "%", referenceRange: "< 5.7%", status: "High", interpretation: "Elevated 3-month average blood glucose indicating diabetes" },
      { testName: "Fasting Blood Sugar (FBS)", value: "146", unit: "mg/dL", referenceRange: "70 - 99 mg/dL", status: "High", interpretation: "Fasting hyperglycemia" },
      { testName: "Serum Creatinine", value: "1.4", unit: "mg/dL", referenceRange: "0.6 - 1.2 mg/dL", status: "High", interpretation: "Mild kidney filtration strain" },
      { testName: "Hemoglobin (Hb)", value: "11.2", unit: "g/dL", referenceRange: "12.0 - 16.0 g/dL", status: "Low", interpretation: "Mild anemia, causes mild fatigue" },
      { testName: "Total Cholesterol", value: "228", unit: "mg/dL", referenceRange: "< 200 mg/dL", status: "High", interpretation: "Elevated circulating lipids" },
      { testName: "Blood Pressure", value: "138/88", unit: "mmHg", referenceRange: "< 120/80 mmHg", status: "High", interpretation: "Stage 1 Hypertension" },
    ],
    abnormalFindings: [
      { item: "HbA1c", value: "8.4%", normalRange: "< 5.7%", plainExplanation: "Shows high average sugar levels in your blood over the last 90 days. Indicates active diabetes requiring dietary and medication control.", severity: "warning" },
      { item: "Fasting Blood Sugar", value: "146 mg/dL", normalRange: "70-99 mg/dL", plainExplanation: "Morning fasting sugar is elevated above the normal limit of 100 mg/dL.", severity: "warning" },
      { item: "Serum Creatinine", value: "1.4 mg/dL", normalRange: "0.6-1.2 mg/dL", plainExplanation: "A waste product filtered by the kidneys. Mild elevation means kidneys are under strain.", severity: "warning" },
      { item: "Total Cholesterol", value: "228 mg/dL", normalRange: "< 200 mg/dL", plainExplanation: "Higher than recommended fats in blood that can build up along vessel walls.", severity: "warning" },
    ],
    doctorNotes: "Start Atorvastatin 10mg OD HS. Intensify Glycomet to 500mg BD. Recheck renal panel and HbA1c in 12 weeks.",
    tags: ["Lab Report", "Endocrinology", "Nephrology", "Diabetes"],
    important: true,
    createdAt: new Date(Date.now() - 2 * 86400000),
  };

  // 3. Hospital Discharge Summary Record
  const rx3: MockPrescription = {
    id: rx3Id,
    patientId: patient2Id,
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
    rawOcr: "DISCHARGE SUMMARY\nAdmission: 28/09/2026  Discharge: 01/10/2026\nDiagnosis: Acute Gastroenteritis with Moderate Dehydration\nTreatment given: IV Fluids, Ondansetron, Ciprofloxacin\nDischarge Meds: Tab Cipro 500mg BD x 3d, ORS, Probiotic cap",
    ocrConfidence: 91,
    documentType: "discharge_summary",
    documentDate: "2026-10-01",
    diagnoses: ["Acute Gastroenteritis", "Moderate Dehydration (Resolved)"],
    correctedText: "Hospital Discharge Summary:\nAdmission Date: 28 Sep 2026 | Discharge Date: 01 Oct 2026\nFinal Diagnosis: Acute Gastroenteritis with Moderate Dehydration\nHospital Course: Managed with IV fluid rehydration, antiemetics, and antimicrobial therapy. Patient hemodynamically stable at discharge.\nDischarge Medications:\n1. Tab Ciprofloxacin 500mg - 1 tab twice daily (BD) for 3 days\n2. Tab Ondansetron 4mg - 1 tab SOS for nausea\n3. Cap Bifilac Probiotic - 1 cap daily for 7 days\n4. Oral Rehydration Salts (ORS) solution regularly",
    aiSummary: "Patient admitted for 3 days with acute gastroenteritis and dehydration. Responded favorably to IV crystalloid resuscitation and supportive therapy. Discharged in stable condition on oral antibiotic and probiotic coverage.",
    plainLanguageSummary: "AI Health Summary in Simple Language:\nYou were hospitalized for a severe stomach infection (gastroenteritis) that caused vomiting, diarrhea, and dehydration. You have received fluids and medication in hospital and are now recovered and safe to go home. Continue taking the prescribed antibiotic for 3 days, take the probiotic capsule to restore healthy gut bacteria, and drink plenty of ORS / boiled water.",
    medicinesJson: [
      { name: "Ciprofloxacin", dosage: "500mg", frequency: "BD (Twice daily)", duration: "3 days", purpose: "Oral antibiotic for intestinal infection", isUncertain: false },
      { name: "Ondansetron", dosage: "4mg", frequency: "SOS", duration: "As needed", purpose: "Prevents nausea and vomiting", isUncertain: false },
      { name: "Bifilac Probiotics", dosage: "1 cap", frequency: "OD (Once daily)", duration: "7 days", purpose: "Restores healthy gut flora", isUncertain: false },
    ],
    labTestsJson: [],
    abnormalFindings: [],
    doctorNotes: "Light bland diet (khichdi, curd). Avoid raw or street food for 10 days. Follow up in OPD after 1 week.",
    tags: ["Discharge Summary", "Gastroenterology", "Inpatient"],
    important: false,
    createdAt: new Date(Date.now() - 4 * 86400000),
  };

  prescriptionsStore = [rx2, rx1, rx3];
}

export const mockDb = {
  getPatients: async () => {
    initSeed();
    return [...patientsStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getPatientById: async (id: string) => {
    initSeed();
    const patient = patientsStore.find((p) => p.id === id);
    if (!patient) return null;
    const rxs = prescriptionsStore
      .filter((rx) => rx.patientId === id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return {
      ...patient,
      prescriptions: rxs,
    };
  },

  createPatient: async (data: { name: string; age: number; gender: string; phone: string }) => {
    initSeed();
    const newPatient: MockPatient = {
      id: "p-" + Math.random().toString(36).substring(2, 10),
      name: data.name,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      createdAt: new Date(),
      prescriptions: [],
    };
    patientsStore.unshift(newPatient);
    return newPatient;
  },

  updatePatient: async (
    id: string,
    data: { name: string; age: number; gender: string; phone: string }
  ) => {
    initSeed();
    const idx = patientsStore.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Patient not found");
    patientsStore[idx] = {
      ...patientsStore[idx],
      ...data,
    };
    return patientsStore[idx];
  },

  deletePatient: async (id: string) => {
    initSeed();
    patientsStore = patientsStore.filter((p) => p.id !== id);
    prescriptionsStore = prescriptionsStore.filter((rx) => rx.patientId !== id);
  },

  searchPatients: async (query: string) => {
    initSeed();
    const q = query.toLowerCase();
    return patientsStore
      .filter((p) => p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  savePrescription: async (data: {
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
  }) => {
    initSeed();
    const newRx: MockPrescription = {
      id: "rx-" + Math.random().toString(36).substring(2, 10),
      patientId: data.patientId,
      imageUrl: data.imageUrl,
      rawOcr: data.rawOcr,
      ocrConfidence: data.ocrConfidence,
      documentType: data.documentType || "prescription",
      documentDate: data.documentDate || new Date().toISOString().split("T")[0],
      diagnoses: data.diagnoses || [],
      correctedText: data.correctedText,
      aiSummary: data.aiSummary,
      plainLanguageSummary: data.plainLanguageSummary || data.aiSummary,
      medicinesJson: data.medicinesJson || [],
      labTestsJson: data.labTestsJson || [],
      abnormalFindings: data.abnormalFindings || [],
      doctorNotes: data.doctorNotes || null,
      tags: data.tags,
      important: data.important || false,
      createdAt: new Date(),
    };
    prescriptionsStore.unshift(newRx);

    // Update patient's prescription count
    const p = patientsStore.find((item) => item.id === data.patientId);
    if (p) {
      p.prescriptions.unshift({ id: newRx.id });
    }

    return newRx;
  },

  getPrescriptionById: async (id: string) => {
    initSeed();
    const rx = prescriptionsStore.find((r) => r.id === id);
    if (!rx) return null;
    const patient = patientsStore.find((p) => p.id === rx.patientId);
    return {
      ...rx,
      patient: patient || {
        id: rx.patientId,
        name: "Unknown Patient",
        age: 0,
        gender: "Unknown",
        phone: "",
        createdAt: new Date(),
        prescriptions: [],
      },
    };
  },

  toggleImportant: async (id: string) => {
    initSeed();
    const rx = prescriptionsStore.find((r) => r.id === id);
    if (!rx) throw new Error("Prescription not found");
    rx.important = !rx.important;
    return rx;
  },

  updatePrescriptionNotes: async (id: string, notes: string) => {
    initSeed();
    const rx = prescriptionsStore.find((r) => r.id === id);
    if (!rx) throw new Error("Prescription not found");
    rx.doctorNotes = notes;
    return rx;
  },

  deletePrescription: async (id: string, patientId: string) => {
    initSeed();
    prescriptionsStore = prescriptionsStore.filter((r) => r.id !== id);
    const p = patientsStore.find((item) => item.id === patientId);
    if (p) {
      p.prescriptions = p.prescriptions.filter((item) => item.id !== id);
    }
  },

  getDashboardStats: async () => {
    initSeed();
    const recent = prescriptionsStore.slice(0, 5).map((rx) => {
      const patient = patientsStore.find((p) => p.id === rx.patientId);
      return {
        ...rx,
        patient: patient || {
          id: rx.patientId,
          name: "Patient",
          age: 0,
          gender: "Unknown",
          phone: "",
          createdAt: new Date(),
          prescriptions: [],
        },
      };
    });

    return {
      totalPatients: patientsStore.length,
      totalPrescriptions: prescriptionsStore.length,
      recentPrescriptions: recent,
    };
  },

  searchPrescriptions: async (query: string) => {
    initSeed();
    const q = query.toLowerCase().trim();
    if (!q) {
      return prescriptionsStore.slice(0, 20).map((rx) => {
        const patient = patientsStore.find((p) => p.id === rx.patientId);
        return {
          ...rx,
          patient: patient || {
            id: rx.patientId,
            name: "Patient",
            age: 0,
            gender: "Unknown",
            phone: "",
            createdAt: new Date(),
            prescriptions: [],
          },
        };
      });
    }

    return prescriptionsStore
      .filter((rx) => {
        const patient = patientsStore.find((p) => p.id === rx.patientId);
        const matchPatient = patient && (patient.name.toLowerCase().includes(q) || patient.phone.includes(q));
        const matchText = rx.correctedText.toLowerCase().includes(q) || rx.aiSummary.toLowerCase().includes(q) || (rx.plainLanguageSummary && rx.plainLanguageSummary.toLowerCase().includes(q));
        const matchMeds = rx.medicinesJson.some((m) => m.name.toLowerCase().includes(q) || (m.purpose && m.purpose.toLowerCase().includes(q)));
        const matchLabs = rx.labTestsJson.some((l) => l.testName.toLowerCase().includes(q) || (l.interpretation && l.interpretation.toLowerCase().includes(q)));
        const matchDiagnoses = rx.diagnoses.some((d) => d.toLowerCase().includes(q));
        const matchTags = rx.tags.some((t) => t.toLowerCase().includes(q));
        return matchPatient || matchText || matchMeds || matchLabs || matchDiagnoses || matchTags;
      })
      .map((rx) => {
        const patient = patientsStore.find((p) => p.id === rx.patientId);
        return {
          ...rx,
          patient: patient || {
            id: rx.patientId,
            name: "Patient",
            age: 0,
            gender: "Unknown",
            phone: "",
            createdAt: new Date(),
            prescriptions: [],
          },
        };
      });
  },
};
