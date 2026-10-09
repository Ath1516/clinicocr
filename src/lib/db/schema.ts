import { pgTable, uuid, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { MedicineItem, LabTestItem, AbnormalFinding, DocumentType } from '@/types';

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  rawOcr: text('raw_ocr').notNull(),
  ocrConfidence: integer('ocr_confidence').default(0),
  documentType: text('document_type').$type<DocumentType>().default('prescription'),
  documentDate: text('document_date'),
  diagnoses: jsonb('diagnoses').$type<string[]>().notNull().default([]),
  correctedText: text('corrected_text').notNull(),
  aiSummary: text('ai_summary').notNull(), // Clinical summary
  plainLanguageSummary: text('plain_language_summary'), // Simple language summary for patients
  medicinesJson: jsonb('medicines_json').$type<MedicineItem[]>().notNull().default([]),
  labTestsJson: jsonb('lab_tests_json').$type<LabTestItem[]>().notNull().default([]),
  abnormalFindings: jsonb('abnormal_findings').$type<AbnormalFinding[]>().notNull().default([]),
  doctorNotes: text('doctor_notes'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  important: boolean('important').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
}));

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
