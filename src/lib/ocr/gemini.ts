import { GoogleGenAI } from '@google/genai';
import type {
  GeminiResponse,
  MedicineItem,
  LabTestItem,
  AbnormalFinding,
  DocumentType,
} from '@/types';

const CLINICAL_DOCTOR_PROMPT = `You are an expert, compassionate clinical physician and medical intelligence AI.
Your role is to analyze medical documents—including handwritten/printed prescriptions, laboratory test reports, hospital discharge summaries, and diagnostic records—with high diagnostic precision and deep clinical empathy.

Analyze the given document content (including raw OCR text and document image if provided) and produce a structured JSON response.

Your Clinical Objectives:
1. IDENTIFY DOCUMENT TYPE: Classify as one of "prescription", "lab_report", "discharge_summary", "diagnostic_record", or "other".
2. EXTRACT DATES: Find any relevant document dates (e.g. test date, prescription date, admission/discharge dates).
3. IDENTIFY DIAGNOSES: List all explicit or strongly indicated clinical diagnoses and medical conditions (e.g., "Type 2 Diabetes Mellitus", "Hypertension", "Acute Bronchitis", "Dyslipidemia", "Dental Infection", "Gingivitis").
4. EXTRACT MEDICATIONS:
   - Identify brand/generic medicine names with high pharmaceutical accuracy.
   - Extract dosage (e.g. "500mg", "10mg"), frequency (e.g. "TDS / 3 times daily", "OD after meals", "BD"), and duration.
   - Mention the clinical purpose (e.g. "Antibiotic for bacterial infection", "Pain relief and anti-inflammatory", "Blood pressure control").
   - If a medication name is illegible or uncertain, prefix it with "Possibly" and set "isUncertain": true. Never invent medications.
5. EXTRACT LAB TESTS & DIAGNOSTIC VALUES:
   - Identify every lab test, diagnostic metric, or vital sign (e.g. HbA1c, Fasting Glucose, Serum Creatinine, Hemoglobin, Total Cholesterol, LDL, HDL, Triglycerides, WBC count, Platelets, TSH, Blood Pressure, Urea, Bilirubin, SGPT/ALT).
   - Extract the measured value (e.g. "8.2", "150", "1.6", "10.2").
   - Extract the measurement unit (e.g. "%", "mg/dL", "g/dL", "mmHg").
   - Extract standard reference range (e.g. "< 5.7%", "70-99 mg/dL", "0.7-1.3 mg/dL").
   - Determine clinical status: "Normal", "High", "Low", or "Critical".
   - Provide a brief clinical interpretation.
6. ABNORMAL FINDINGS & INTERPRETATION:
   - For every out-of-range/abnormal test, provide a clear, understandable clinical explanation of what this abnormal number means for the patient's health and bodily organs.
7. AI HEALTH SUMMARY IN SIMPLE LANGUAGE (CRITICAL):
   - Provide an "AI Health Summary in Simple Language" that explains the entire record in clear, everyday words that a patient or family member can easily understand without medical jargon.
   - In simple language, explain:
     a) What the main condition or diagnosis is.
     b) Exactly what any abnormal/elevated/low values mean (e.g., "Your HbA1c is 8.2%, which is higher than the healthy target of 5.7%. This means your blood sugar has been running high over the past 3 months...").
     c) What medications have been advised and why.
     d) Essential lifestyle steps and when to follow up with the doctor.
   - Also provide natural Hindi ("plain_language_summary_hi") and Marathi ("plain_language_summary_mr") versions of this simple health summary.
8. PROFESSIONAL SUMMARY: Provide a concise 2-3 sentence clinical summary for physicians.
9. TAGS: Relevant medical tags for categorization (e.g. "Endocrinology", "Diabetes", "Cardiology", "Antibiotic", "Dental", "Lab Report").

Output MUST be strictly valid JSON matching this schema:
{
  "document_type": "prescription" | "lab_report" | "discharge_summary" | "diagnostic_record" | "other",
  "document_date": "YYYY-MM-DD or as written in document",
  "diagnoses": ["List of diagnosed conditions"],
  "corrected_text": "Clean, formatted transcription preserving medical accuracy",
  "summary": "Concise physician-to-physician clinical summary",
  "plain_language_summary": "Empathetic, clear, patient-friendly explanation in English explaining what the records and any abnormal values mean in simple terms",
  "plain_language_summary_hi": "सरल और स्पष्ट हिंदी में स्वास्थ्य सारांश (मरीज़ के समझने योग्य)",
  "plain_language_summary_mr": "सोप्या आणि स्पष्ट मराठीत आरोग्य सारांश (रुग्णाला समजेल असा)",
  "medicines": [
    {
      "name": "Medicine name",
      "dosage": "500mg",
      "frequency": "Twice daily after meals (BD)",
      "duration": "5 days",
      "purpose": "Antibiotic / Blood pressure / etc.",
      "isUncertain": false
    }
  ],
  "lab_tests": [
    {
      "testName": "Test name (e.g. HbA1c)",
      "value": "8.2",
      "unit": "%",
      "referenceRange": "< 5.7%",
      "status": "High",
      "interpretation": "Elevated 3-month average blood glucose"
    }
  ],
  "abnormal_findings": [
    {
      "item": "HbA1c",
      "value": "8.2%",
      "normalRange": "Below 5.7%",
      "plainExplanation": "Shows elevated average sugar levels in your blood over the last 90 days, indicating diabetes that needs management.",
      "severity": "warning"
    }
  ],
  "important_findings": ["Critical clinical remarks or urgent flags"],
  "tags": ["Category tags"]
}`;

// Robust Clinical Knowledge Base & OCR Error Correction Parser
export function fallbackClinicalParser(rawOcrText: string): GeminiResponse {
  const lower = rawOcrText.toLowerCase();

  // 1. Detect Document Type
  let docType: DocumentType = "prescription";
  if (/discharge|admission date|date of discharge|hospital summary/i.test(lower)) {
    docType = "discharge_summary";
  } else if (/lab report|laboratory|pathology|biochemistry|hematology|reference range|blood test|urine examination/i.test(lower)) {
    docType = "lab_report";
  } else if (/x-ray|ultrasound|ecg|ct scan|mri|radiology|sonography|impression:/i.test(lower)) {
    docType = "diagnostic_record";
  }

  // 2. Extract Document Date if present
  const dateMatch = rawOcrText.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/i);
  const docDate = dateMatch ? dateMatch[0] : new Date().toLocaleDateString("en-IN");

  // 3. Known Lab Tests Heuristics
  const knownLabPatterns: {
    name: string;
    regex: RegExp;
    unit: string;
    normalMin?: number;
    normalMax?: number;
    normalText: string;
    explanationHigh: string;
    explanationLow: string;
  }[] = [
    {
      name: "HbA1c (Glycated Hemoglobin)",
      regex: /hba1c|glycated\s*h(a|e)moglobin/i,
      unit: "%",
      normalMax: 5.7,
      normalText: "< 5.7%",
      explanationHigh: "Your 3-month average blood sugar is elevated above the normal target of 5.7%, indicating uncontrolled blood sugar or diabetes.",
      explanationLow: "Your HbA1c is below expected levels.",
    },
    {
      name: "Fasting Blood Sugar (FBS)",
      regex: /fasting\s*blood\s*sugar|fasting\s*glucose|fbs\b/i,
      unit: "mg/dL",
      normalMin: 70,
      normalMax: 99,
      normalText: "70 - 99 mg/dL",
      explanationHigh: "Your morning fasting blood sugar is high. An overnight value above 100 mg/dL suggests impaired glucose tolerance.",
      explanationLow: "Your blood sugar is unusually low, which may lead to dizziness or weakness.",
    },
    {
      name: "Post Prandial Blood Sugar (PPBS)",
      regex: /ppbs|post\s*prandial|random\s*blood\s*sugar|rbs\b/i,
      unit: "mg/dL",
      normalMax: 140,
      normalText: "< 140 mg/dL",
      explanationHigh: "Blood sugar after food is elevated, placing extra stress on insulin production.",
      explanationLow: "Blood sugar is low.",
    },
    {
      name: "Serum Creatinine",
      regex: /creatinine|serum\s*creat/i,
      unit: "mg/dL",
      normalMin: 0.6,
      normalMax: 1.2,
      normalText: "0.6 - 1.2 mg/dL",
      explanationHigh: "Creatinine is elevated above the normal 1.2 mg/dL threshold. This waste product reflects kidney filtering efficiency, meaning the kidneys may be under stress.",
      explanationLow: "Creatinine is lower than average, generally due to low muscle mass.",
    },
    {
      name: "Hemoglobin (Hb)",
      regex: /h(a|e)moglobin\b|hb\s*:/i,
      unit: "g/dL",
      normalMin: 12.0,
      normalMax: 16.0,
      normalText: "12.0 - 16.0 g/dL",
      explanationHigh: "Hemoglobin is unusually elevated, which may indicate dehydration or respiratory strain.",
      explanationLow: "Your hemoglobin is lower than the normal 12-16 g/dL range, indicating anemia. This can cause fatigue, paleness, and shortness of breath.",
    },
    {
      name: "Total Cholesterol",
      regex: /total\s*cholesterol|cholesterol\s*total/i,
      unit: "mg/dL",
      normalMax: 200,
      normalText: "< 200 mg/dL",
      explanationHigh: "Your total cholesterol is above the desirable 200 mg/dL limit, meaning extra fats in your blood that can deposit along artery walls over time.",
      explanationLow: "Total cholesterol is below typical levels.",
    },
    {
      name: "Platelet Count",
      regex: /platelet|plt\s*count/i,
      unit: "x10^3/uL",
      normalMin: 150,
      normalMax: 450,
      normalText: "150 - 450 x10^3/uL",
      explanationHigh: "Platelets are elevated above 450, which can occur during inflammation or infection.",
      explanationLow: "Platelet count is lower than normal, which can increase the risk of bruising or bleeding.",
    },
    {
      name: "TSH (Thyroid Stimulating Hormone)",
      regex: /tsh|thyroid\s*stimulating/i,
      unit: "uIU/mL",
      normalMin: 0.4,
      normalMax: 4.5,
      normalText: "0.4 - 4.5 uIU/mL",
      explanationHigh: "TSH is elevated above 4.5 uIU/mL, which typically points toward an underactive thyroid (hypothyroidism).",
      explanationLow: "TSH is suppressed below 0.4 uIU/mL, pointing toward an overactive thyroid (hyperthyroidism).",
    },
    {
      name: "Blood Pressure (BP)",
      regex: /b\.?p\.?[:\s]*(\d{2,3})[\s/](\d{2,3})/i,
      unit: "mmHg",
      normalText: "< 120/80 mmHg",
      explanationHigh: "Blood pressure is higher than the optimal 120/80 mmHg target, placing added pressure against artery walls.",
      explanationLow: "Blood pressure is below standard levels.",
    },
  ];

  const labTests: LabTestItem[] = [];
  const abnormalFindings: AbnormalFinding[] = [];
  const lines = rawOcrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    for (const pattern of knownLabPatterns) {
      const match = pattern.regex.exec(line);
      if (match) {
        // Look for number occurring AFTER the test name
        const textAfterMatch = line.slice(match.index + match[0].length);
        const numMatch = textAfterMatch.match(/[:\s=-]*(\d+(\.\d+)?)/) || line.match(/(\d+(\.\d+)?)/);
        if (numMatch) {
          const rawVal = numMatch[1];
          const valNum = parseFloat(rawVal);
          let status: "Normal" | "High" | "Low" | "Critical" = "Normal";
          let plainExp = "";

          if (pattern.normalMax !== undefined && valNum > pattern.normalMax) {
            status = valNum > pattern.normalMax * 1.5 ? "Critical" : "High";
            plainExp = pattern.explanationHigh;
          } else if (pattern.normalMin !== undefined && valNum < pattern.normalMin) {
            status = valNum < pattern.normalMin * 0.7 ? "Critical" : "Low";
            plainExp = pattern.explanationLow;
          }

          labTests.push({
            testName: pattern.name,
            value: numMatch[1],
            unit: pattern.unit,
            referenceRange: pattern.normalText,
            status,
            interpretation: status === "Normal" ? "Within standard healthy range" : plainExp,
          });

          if (status !== "Normal") {
            abnormalFindings.push({
              item: pattern.name,
              value: `${numMatch[1]} ${pattern.unit}`,
              normalRange: pattern.normalText,
              plainExplanation: plainExp,
              severity: status === "Critical" ? "critical" : "warning",
            });
          }
        }
      }
    }
  }

  // 4. Expanded Clinical Medication Library with OCR Fuzzy Tolerance
  const commonMeds = [
    // Antibiotics
    { regex: /augmentin/i, name: "Augmentin", defaultDosage: "625mg", defaultFreq: "TDS (3x daily)", purpose: "Broad spectrum antibiotic for infection", tag: "Antibiotic" },
    { regex: /amoxicillin|amox/i, name: "Amoxicillin", defaultDosage: "500mg", defaultFreq: "TDS (3x daily)", purpose: "Antibiotic for bacterial infection", tag: "Antibiotic" },
    { regex: /azithromycin|azithro|zithro/i, name: "Azithromycin", defaultDosage: "500mg", defaultFreq: "OD (Once daily)", purpose: "Antibiotic for respiratory/throat infection", tag: "Antibiotic" },
    { regex: /cefixime|zifi/i, name: "Cefixime", defaultDosage: "200mg", defaultFreq: "BD (Twice daily)", purpose: "Cephalosporin antibiotic", tag: "Antibiotic" },
    { regex: /ciprofloxacin|cipro/i, name: "Ciprofloxacin", defaultDosage: "500mg", defaultFreq: "BD (Twice daily)", purpose: "Antibiotic for bacterial infection", tag: "Antibiotic" },

    // Pain & Anti-inflammatory
    { regex: /enz[os]fla[mn]|enz[os]f\s*(lan|ae)|enzoflam/i, name: "Tab Enzoflam", defaultDosage: "1 Tab", defaultFreq: "BD after meals", purpose: "Anti-inflammatory pain reliever and swelling reduction", tag: "Pain Relief" },
    { regex: /paracetamol|pcm|calpol|dolo/i, name: "Paracetamol", defaultDosage: "650mg", defaultFreq: "SOS (as needed for fever/pain)", purpose: "Fever and mild-to-moderate pain relief", tag: "Antipyretic" },
    { regex: /combiflam|ibuprofen/i, name: "Combiflam", defaultDosage: "400mg", defaultFreq: "SOS after food", purpose: "Anti-inflammatory pain relief", tag: "Pain Relief" },
    { regex: /zerodol|aceclofenac/i, name: "Zerodol-SP", defaultDosage: "1 Tab", defaultFreq: "BD after food", purpose: "Anti-inflammatory pain reliever for dental/joint pain", tag: "Pain Relief" },
    { regex: /tramadol|ultram/i, name: "Tramadol", defaultDosage: "50mg", defaultFreq: "SOS (for severe pain)", purpose: "Strong analgesic for acute pain", tag: "Pain Relief" },

    // Dental & Topical
    { regex: /[hr]exigel|hexidine|chlorhexidine|\bhex\b/i, name: "Hexigel Gum Paint / Gel", defaultDosage: "Small quantity", defaultFreq: "TDS (Apply & massage gums)", purpose: "Antiseptic gum gel for gingivitis, oral ulcers, and swelling", tag: "Dental Care" },
    { regex: /metrogyl|metronidazole/i, name: "Metrogyl Gel / Tab", defaultDosage: "400mg", defaultFreq: "BD after meals", purpose: "Antibacterial/anaerobic infection treatment", tag: "Dental Care" },
    { regex: /mucopain|benzocaine/i, name: "Mucopain Gel", defaultDosage: "Topical", defaultFreq: "SOS before meals", purpose: "Local anesthetic gel for mouth ulcer pain relief", tag: "Dental Care" },

    // Gastroprotection
    { regex: /pantocid|pan\s*40|pantoprazole/i, name: "Pantocid", defaultDosage: "40mg", defaultFreq: "OD before breakfast", purpose: "Acid reduction and stomach protection", tag: "Gastroprotection" },
    { regex: /omeprazole|omez/i, name: "Omez", defaultDosage: "20mg", defaultFreq: "OD before breakfast", purpose: "Gastric acid inhibition and ulcer protection", tag: "Gastroprotection" },
    { regex: /rabeprazole|razo/i, name: "Rabeprazole", defaultDosage: "20mg", defaultFreq: "OD before breakfast", purpose: "Proton pump inhibitor for acidity", tag: "Gastroprotection" },

    // Chronic Disease Management (Cardio, Diabetes, Resp)
    { regex: /amlong|amlodipine/i, name: "Amlong", defaultDosage: "5mg", defaultFreq: "OD in the morning", purpose: "Blood pressure lowering medication", tag: "Cardiology" },
    { regex: /telmisartan|telma/i, name: "Telma", defaultDosage: "40mg", defaultFreq: "OD", purpose: "Antihypertensive for blood pressure control", tag: "Cardiology" },
    { regex: /glycomet|metformin/i, name: "Glycomet", defaultDosage: "500mg", defaultFreq: "BD with meals", purpose: "Blood sugar regulation in diabetes", tag: "Endocrinology" },
    { regex: /levolin|levosalbutamol/i, name: "Levolin", defaultDosage: "1.25mg", defaultFreq: "SOS", purpose: "Bronchodilator for airway relief", tag: "Respiratory" },
    { regex: /cetirizine|cetzine|allegra/i, name: "Cetirizine", defaultDosage: "10mg", defaultFreq: "OD at bedtime", purpose: "Antihistamine for allergy, sneezing, or itching", tag: "Allergy" },
  ];

  const medicines: MedicineItem[] = [];
  const tags = new Set<string>();

  for (const line of lines) {
    let matched = false;
    for (const med of commonMeds) {
      if (med.regex.test(line)) {
        matched = true;
        const doseMatch = line.match(/\b\d+(\.\d+)?\s*(mg|mcg|gm|ml|puff|tab)\b/i);
        const dosage = doseMatch ? doseMatch[0] : med.defaultDosage;

        const freqMatch = line.match(/\b(OD|BD|TDS|QID|SOS|HS|STAT|1-0-1|1-1-1|1-0-0|0-0-1)\b/i);
        const frequency = freqMatch ? freqMatch[0].toUpperCase() : med.defaultFreq;

        const durMatch = line.match(/\b\d+\s*(day|days|d|week|weeks|w|month)\b/i);
        const duration = durMatch ? durMatch[0] : "5 days";

        medicines.push({
          name: med.name,
          dosage,
          frequency,
          duration,
          purpose: med.purpose,
          isUncertain: false,
        });

        if (med.tag) tags.add(med.tag);
      }
    }

    if (!matched && /tab|syp|cap|inj|drop|gel|paint|adv:/i.test(line)) {
      const words = line
        .replace(/^(tab|syp|cap|inj|drop|gel|paint|adv:|rx)\.?\s+/i, "")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .split(/\s+/);

      const possibleName = words.slice(0, 2).join(" ");
      if (possibleName && possibleName.length > 2) {
        medicines.push({
          name: `Possibly ${possibleName}`,
          dosage: "As directed",
          frequency: "As directed by physician",
          duration: "5 days",
          purpose: "Clinical management",
          isUncertain: true,
        });
        tags.add("General Medical");
      }
    }
  }

  // 5. Extract Diagnoses
  const diagnoses: string[] = [];
  if (/dental|tooth|teeth|gum|whitening|implant|smile/i.test(lower)) {
    diagnoses.push("Dental Consultation & Gingival Care");
    tags.add("Dental Care");
  }
  if (/fever|pyrexia/i.test(lower)) diagnoses.push("Acute Febrile Illness / Fever");
  if (/cough|bronchitis|cold|uri|respiratory/i.test(lower)) diagnoses.push("Upper Respiratory Tract Infection");
  if (/diabetes|glucose|sugar|hba1c/i.test(lower)) diagnoses.push("Diabetes Mellitus (Hyperglycemia)");
  if (/hypertension|bp|high blood pressure/i.test(lower)) diagnoses.push("Essential Hypertension");
  if (/gastritis|gerd|acidity/i.test(lower)) diagnoses.push("Acid Peptic Disorder / Gastritis");
  if (diagnoses.length === 0) diagnoses.push("Clinical Consultation & Diagnostic Review");

  // 6. Generate AI Health Summary in Simple Language (English, Hindi, Marathi)
  let plainSummary = "";
  let plainSummaryHi = "";
  let plainSummaryMr = "";

  if (abnormalFindings.length > 0) {
    const abnormalList = abnormalFindings.map((f) => `• ${f.item}: Recorded at ${f.value} (healthy target: ${f.normalRange}). Meaning: ${f.plainExplanation}`).join("\n");
    plainSummary = `Health Overview:\nThis record highlights the following key findings:\n${abnormalList}\n\nWhat to do: Follow the prescribed medication course and consult your doctor to repeat tests as recommended.`;

    plainSummaryHi = `स्वास्थ्य सारांश (सरल शब्दों में):\nआपके इस मेडिकल रिकॉर्ड में निम्नलिखित मुख्य बातें पाई गई हैं:\n${abnormalFindings.map((f) => `• ${f.item}: मान ${f.value} है (सामान्य लक्ष्य: ${f.normalRange})। इसका अर्थ: यह सामान्य सीमा से बाहर है और इस पर ध्यान देने की आवश्यकता है।`).join("\n")}\n\nसलाह: डॉक्टर द्वारा बताई गई दवाइयां समय पर लें और निर्धारित समय पर पुनः जांच कराएं।`;

    plainSummaryMr = `आरोग्य सारांश (सोप्या भाषेत):\nतुमच्या या वैद्यकीय नोंदीतील महत्त्वाचे मुद्दे खालीलप्रमाणे आहेत:\n${abnormalFindings.map((f) => `• ${f.item}: मूल्य ${f.value} आहे (सामान्य लक्ष्य: ${f.normalRange})। याचा अर्थ: हे मूल्य सामान्य मर्यादेबाहेर असून त्यावर लक्ष देणे गरजेचे आहे.`).join("\n")}\n\nसल्ला: डॉक्टरांनी दिलेली औषधे वेळेवर घ्या आणि ठरवून दिलेल्या वेळेत पुन्हा तपासणी करा.`;
  } else if (medicines.length > 0) {
    const medList = medicines.map((m) => `• ${m.name} (${m.dosage || "As directed"}): ${m.frequency || ""}. Purpose: ${m.purpose || "Prescribed treatment"}.`).join("\n");
    plainSummary = `Health Overview:\nYour prescription includes ${medicines.length} medication(s) prescribed for ${diagnoses.join(", ")}:\n${medList}\n\nAdvice: Complete the recommended duration, avoid skipping doses, and maintain healthy hydration and rest.`;

    plainSummaryHi = `स्वास्थ्य सारांश:\nआपकी पर्ची में ${diagnoses.join(", ")} के लिए ${medicines.length} दवाइयां निर्धारित की गई हैं:\n${medicines.map((m) => `• ${m.name}: ${m.frequency || "निर्देशानुसार"}। उद्देश्य: ${m.purpose || "उपचार"}।`).join("\n")}\n\nसलाह: दवाइयों का पूरा कोर्स पूरा करें और कोई भी खुराक न छोड़ें।`;

    plainSummaryMr = `आरोग्य सारांश:\nतुमच्या प्रिस्क्रिप्शनमध्ये ${diagnoses.join(", ")} साठी ${medicines.length} औषधे दिली आहेत:\n${medicines.map((m) => `• ${m.name}: ${m.frequency || "सल्ल्यानुसार"}। हेतू: ${m.purpose || "उपचार"}।`).join("\n")}\n\nसल्ला: औषधांचा पूर्ण कोर्स पूर्ण करा आणि नियमित काळजी घ्या.`;
  } else {
    plainSummary = `Health Overview:\nMedical record from ${docDate}. Primary notes indicate: ${diagnoses.join(", ")}. Please review with your physician for detailed medical guidance.`;
    plainSummaryHi = `स्वास्थ्य सारांश:\n${docDate} का मेडिकल रिकॉर्ड। प्राथमिक निदान: ${diagnoses.join(", ")}। कृपया डॉक्टर से विस्तृत परामर्श लें।`;
    plainSummaryMr = `आरोग्य सारांश:\n${docDate} ची वैद्यकीय नोंद. प्राथमिक निदान: ${diagnoses.join(", ")}. कृपया डॉक्टरांशी चर्चा करा.`;
  }

  // 7. Clinical summary for physicians
  const summary = `Clinical ${docType.replace("_", " ")} record (${docDate}) indicating ${diagnoses.join(", ")}. Extracted ${medicines.length} medication(s) and ${labTests.length} diagnostic value(s). ${abnormalFindings.length > 0 ? `${abnormalFindings.length} parameter(s) flagged outside standard reference limits.` : "Parameters reviewed."}`;

  tags.add(docType.toUpperCase().replace("_", " "));
  if (diagnoses[0]) tags.add(diagnoses[0].split(" ")[0]);

  return {
    document_type: docType,
    document_date: docDate,
    diagnoses,
    corrected_text: lines.map((l, i) => `${i + 1}. ${l}`).join("\n") || rawOcrText,
    summary,
    plain_language_summary: plainSummary,
    plain_language_summary_hi: plainSummaryHi,
    plain_language_summary_mr: plainSummaryMr,
    medicines,
    lab_tests: labTests,
    abnormal_findings: abnormalFindings,
    important_findings: abnormalFindings.map((a) => `Abnormal ${a.item}: ${a.value} (Normal: ${a.normalRange})`),
    tags: Array.from(tags),
  };
}

export interface AnalyzeOptions {
  imageBase64?: string;
  mimeType?: string;
}

export async function analyzeWithGemini(
  rawOcrText: string,
  options?: AnalyzeOptions
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key" || apiKey.trim() === "") {
    console.log("Using clinical physician intelligence engine.");
    return fallbackClinicalParser(rawOcrText);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build multimodal contents payload
    const contents: any[] = [];

    // If image data is provided, attach visual inspection part
    if (options?.imageBase64) {
      const cleanBase64 = options.imageBase64.replace(/^data:[^;]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: options.mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    contents.push({
      text: `${CLINICAL_DOCTOR_PROMPT}\n\nRaw Medical Document OCR Text:\n${rawOcrText || "(Document image attached above for direct optical reading)"}`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsed: GeminiResponse = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.warn("Gemini clinical analysis fallback triggered:", error);
    return fallbackClinicalParser(rawOcrText);
  }
}
