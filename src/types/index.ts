export type DocumentType =
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'diagnostic_record'
  | 'other';

export interface MedicineItem {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  purpose?: string;
  isUncertain?: boolean;
}

export type LabTestStatus = 'Normal' | 'High' | 'Low' | 'Critical';

export interface LabTestItem {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: LabTestStatus;
  interpretation?: string;
}

export interface AbnormalFinding {
  item: string;
  value: string;
  normalRange: string;
  plainExplanation: string;
  severity: 'warning' | 'critical';
}

export interface GeminiResponse {
  document_type: DocumentType;
  document_date?: string;
  diagnoses: string[];
  corrected_text: string;
  summary: string; // Physician clinical summary
  plain_language_summary: string; // AI Health Summary in Simple Language
  plain_language_summary_hi?: string;
  plain_language_summary_mr?: string;
  medicines: MedicineItem[];
  lab_tests: LabTestItem[];
  abnormal_findings: AbnormalFinding[];
  important_findings: string[];
  tags: string[];
}

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface ProcessingResult {
  rawOcr: OcrResult;
  aiResult: GeminiResponse;
  imageUrl: string;
}

export type ConfidenceLevel = 'Excellent' | 'Good' | 'Needs Review';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 85) return 'Excellent';
  if (confidence >= 65) return 'Good';
  return 'Needs Review';
}
