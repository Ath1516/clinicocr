# ClinicOCR — AI Medical Document Intelligence Platform

> **Status:** Phase 1 & Phase 2 Complete  
> **Project Type:** AI SaaS | Medical Document Intelligence Platform  
> **Target Audience:** Small Clinics, Private Practitioners, General Physicians, Pediatricians, ENT Specialists

ClinicOCR is an AI-powered document digitization platform that converts handwritten medical prescriptions into structured, searchable digital patient records using a two-stage extraction pipeline:
1. **Preprocessed Tesseract OCR** for verbatim, objective optical character recognition.
2. **Google Gemini Flash** for clinical spelling correction, entity extraction (medicines, dosage, frequency), and medical summaries.

---

## 🌟 Key Features

### Phase 1 (Core Foundation)
- **Clinical Dashboard:** Real-time metrics on total patients, digitized prescriptions, and recent clinical activity.
- **Patient Management:** Complete patient registry (Name, Age, Gender, Phone), search, add/edit dialogs, and individual profile timelines.
- **Prescription Upload & Analysis:** Support for JPG, JPEG, and PNG scans with drag-and-drop or file browsing.
- **Two-Stage Intelligence:**
  - Raw Tesseract OCR text preserved side-by-side.
  - Gemini Flash clinical refinement into structured medications, clinical findings, and tags.
- **Doctor-in-the-Loop Verification:** Complete editing control over every single field before persisting to the database.

### Phase 2 (Clinical Productivity Enhancements)
- **Smart Image Quality Diagnostic:** Pre-flight detection of blurry images (Laplacian variance) and poor lighting/exposure before running OCR.
- **Image Preprocessing:** Contrast enhancement, grayscale conversion, and adaptive binarization thresholding for noisy handwritten notes.
- **OCR Confidence Scoring:** Visual confidence badges (`Excellent 85%+`, `Good 65-84%`, `Needs Review <65%`).
- **Smart Medicine Badges:** Verified medication badges and flagged `Possibly [Medicine]` badges for uncertain handwriting.
- **Multi-Field Clinical Search:** Search across patient name, phone number, prescribed medication name, date, or tags.
- **⭐ Important Priority Pinning:** One-click toggle pinning critical or high-risk prescriptions to the top of the patient's timeline.
- **Physician Remarks & Doctor Notes:** Private clinical observations and follow-up guidance.
- **Clinical PDF Export:** Print-ready, branded clinical prescription summaries with auto-generated medication tables and doctor signature line.
- **Zero-Config Resilient Storage:** Connects to **Neon PostgreSQL** via Drizzle ORM when `DATABASE_URL` is set, and seamlessly falls back to an in-memory clinical demo store out of the box.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui + Lucide Icons + Sonner
- **Database & ORM:** Neon PostgreSQL + Drizzle ORM
- **OCR Engine:** `tesseract.js`
- **AI Engine:** Google Gemini Flash (`@google/genai`)
- **Document Generation:** `jspdf` + `jspdf-autotable`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Neon PostgreSQL Database Connection URL
DATABASE_URL=postgresql://your-neon-url

# Google Gemini API Key (Get at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key
```

*(Note: If `DATABASE_URL` or `GEMINI_API_KEY` are not set, ClinicOCR automatically runs in Demo Mode with built-in patient data and intelligent medical heuristic analysis).*

### 3. Database Migrations (When using Neon)
```bash
npm run drizzle:generate
npm run drizzle:push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
clinicocr/
├── src/
│   ├── actions/                  # Next.js Server Actions (CRUD, Search, AI)
│   ├── app/
│   │   ├── api/upload/route.ts   # Prescription image upload handler
│   │   ├── dashboard/            # Metrics & recent prescriptions
│   │   ├── patients/             # Patient list & individual profiles
│   │   │   └── [id]/             # Patient timeline & prescriptions
│   │   ├── search/               # Multi-field search & archive
│   │   └── upload/               # Two-stage OCR + Gemini review workflow
│   ├── components/
│   │   ├── patients/             # Patient dialog, card, actions
│   │   ├── search/               # Multi-field search view
│   │   ├── ui/                   # Reusable shadcn/ui components
│   │   ├── upload/               # Upload dropzone, quality check, review form
│   │   └── sidebar.tsx           # Clinical navigation sidebar
│   ├── lib/
│   │   ├── db/                   # Neon PostgreSQL Drizzle schema & mock store
│   │   ├── ocr/                  # Preprocessing, Tesseract & Gemini AI logic
│   │   ├── pdf/                  # Clinical PDF report generator
│   │   └── utils.ts              # Styling & date formatting helpers
│   └── types/                    # Shared TypeScript interfaces
├── drizzle.config.ts             # Drizzle Kit configuration
└── package.json
```

---

## 🩺 Clinical Workflow

1. **Select or Register Patient:** Pick an existing patient or add a new patient profile.
2. **Capture / Upload Image:** Drag and drop prescription photo.
3. **Quality Check & Enhancement:** Instant check for blur and lighting with optional contrast enhancement.
4. **OCR & AI Extraction:** Tesseract segments text, Gemini Flash structures medical entities and generates summary.
5. **Doctor Review & Sign-Off:** Attending physician reviews and fine-tunes medications, dosages, and notes.
6. **Save & Archive:** Persisted to patient history, searchable, and exportable to PDF at any time.
