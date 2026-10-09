"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "mr";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

export const translations = {
  en: {
    // Brand & Navigation
    brandTitle: "ClinicOCR",
    brandSubtitle: "AI Prescription Intelligence",
    aiPowered: "AI Powered",
    ocrGeminiBadge: "Tesseract OCR + Gemini Flash",
    navDashboard: "Dashboard",
    navPatients: "Patients",
    navUpload: "Upload",
    navSearch: "Search",
    selectLanguage: "Language",
    selectTheme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    toggleTheme: "Toggle Theme",

    // Common Actions & Badges
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    clear: "Clear",
    search: "Search",
    upload: "Upload",
    exportPdf: "Export PDF",
    important: "Important",
    priority: "Priority",
    saving: "Saving...",
    processing: "Processing...",
    back: "Back",
    actions: "Actions",
    close: "Close",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Overview of your clinic records",
    addPatient: "Add Patient",
    newPrescription: "New Prescription",
    totalPatients: "Total Patients",
    totalPrescriptions: "Total Prescriptions",
    recentActivity: "Recent Activity",
    recentUploadsCount: "recent uploads",
    recentPrescriptionsTitle: "Recent Prescriptions",
    noPrescriptionsYet: "No prescriptions yet",
    uploadFirstPrescriptionDesc: "Upload your first prescription to get started",
    uploadPrescriptionBtn: "Upload Prescription",

    // Patients Directory
    patientsTitle: "Patients",
    patientsSubtitle: "Manage your patient records",
    searchPatientsPlaceholder: "Search by name or phone...",
    noPatientsFound: "No patients found",
    tryDifferentSearch: "Try a different search term",
    noPatientsYet: "No patients yet",
    addFirstPatientDesc: "Add your first patient to get started",
    prescriptionsCountSuffix: "prescription(s)",
    yrsOld: "yrs",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    registeredOn: "Registered",

    // Patient Dialog Form
    addNewPatientModalTitle: "Add New Patient",
    editPatientModalTitle: "Edit Patient",
    fullNameLabel: "Full Name *",
    fullNamePlaceholder: "Enter patient name",
    ageLabel: "Age *",
    genderLabel: "Gender",
    phoneLabel: "Phone Number *",
    phonePlaceholder: "Enter phone number",
    updatePatientBtn: "Update Patient",
    savePatientBtn: "Add Patient",
    fillAllFieldsError: "Please fill all required fields",
    patientAddedSuccess: "Patient added successfully",
    patientUpdatedSuccess: "Patient updated successfully",
    deletePatientConfirm: "Are you sure you want to delete this patient? All prescriptions will also be deleted.",
    deletePrescriptionConfirm: "Are you sure you want to delete this prescription?",
    patientDeletedSuccess: "Patient deleted",

    // Patient Profile & Timeline
    patientHistoryTitle: "Prescription History",
    prescriptionTimelineHeading: "Prescription Timeline",
    sortedByPriorityNote: "Sorted by priority (⭐ Important records pinned to top)",
    noHistoryYet: "No prescriptions recorded yet",
    uploadForThisPatient: "Upload and digitize this patient's handwritten prescription",
    uploadFirstForPatientBtn: "Upload First Prescription",

    // Upload & Digitization Page
    uploadPageTitle: "Upload & Digitize Prescription",
    uploadPageSubtitle: "Optical character recognition with Google Gemini clinical intelligence",
    step1SelectPatient: "1. Select Patient",
    step1SelectPatientDesc: "Choose the patient for this prescription",
    newPatientBtn: "New Patient",
    noPatientsAlert: "No patients in system yet. Please add a patient first.",
    selectPatientPlaceholder: "Select patient...",
    step2CaptureUpload: "2. Capture or Upload Prescription",
    step2CaptureUploadDesc: "Supported formats: JPG, JPEG, PNG",
    clickToUploadOrDrop: "Click to upload or drag and drop prescription scan",
    highContrastTip: "High-contrast, well-lit photos give the highest recognition accuracy",
    browseFilesBtn: "Browse Files",
    changePhotoBtn: "Change Photo",
    originalImageLabel: "Original Image",
    qualityCheckHeading: "Image Quality Pre-Check",
    qualityCheckPassed: "Image clarity check passed: Good lighting and sharpness.",
    qualityWarningTitle: "Quality Warning Detected",
    qualityWarningAdvice: "You may still proceed, or upload a clearer photo for better recognition.",
    adaptiveThresholdLabel: "Adaptive Threshold & Binarization",
    viewEnhancedBtn: "View Enhanced",
    viewOriginalBtn: "View Original",
    analyzeWithAiBtn: "Analyze Prescription with AI",
    uploadingToServerStep: "Uploading image to server...",
    extractingOcrStep: "Extracting text via Tesseract OCR engine...",
    refiningGeminiStep: "Refining prescription with Google Gemini AI...",
    runningAiMsg: "Running OCR character segmentation and Google Gemini Flash reasoning...",

    // Review & Verification Screen
    reviewBannerTitle: "Physician Review & Verification",
    reviewBannerSubtitle: "Review and adjust AI-extracted data. The doctor has complete authority over every field.",
    startOverBtn: "Start Over",
    approveAndSaveBtn: "Approve & Save",
    assignPatientLabel: "Assign to Patient *",
    markImportantLabel: "Mark as ⭐ Important",
    originalPrescriptionCard: "Original Prescription",
    uploadedDocumentDesc: "Uploaded prescription document",
    rawOcrTitle: "Raw Tesseract OCR Output",
    rawOcrSubtitle: "Unmodified text detected before AI processing",
    collapseBtn: "Collapse",
    expandBtn: "Expand",
    noRawOcrDetected: "No text detected by OCR engine.",
    clinicalSummaryTitle: "Clinical Summary",
    clinicalSummarySubtitle: "AI-generated consultation & diagnosis overview",
    prescribedMedsTitle: "Prescribed Medications",
    prescribedMedsSubtitle: "Verify dosage, frequency, and medicine names",
    addMedicineBtn: "Add Medicine",
    noMedsExtractedNotice: "No medicines extracted. Click 'Add Medicine' to add manually.",
    medNameLabel: "Medicine Name",
    dosageLabel: "Dosage",
    frequencyLabel: "Frequency / Timing",
    durationLabel: "Duration",
    uncertainLabel: "Uncertain",
    possiblyBadge: "Uncertain / Possibly",
    correctedTranscriptionTitle: "Corrected Transcription",
    correctedTranscriptionSubtitle: "Formatted, spelling-corrected prescription text",
    tagsTitle: "Tags & Medical Categories",
    tagsSubtitle: "Helps in searching and filtering past records",
    addTagPlaceholder: "Add a tag (e.g. Fever, Antibiotic)...",
    addTagBtn: "Add",
    doctorRemarksTitle: "Physician Private Notes (Optional)",
    doctorRemarksSubtitle: "Follow-up instructions, investigations, or special remarks",
    doctorRemarksPlaceholder: "e.g. Advised complete blood count (CBC). Review in 5 days if fever persists.",
    discardBtn: "Discard & Upload Another",
    approveSaveFullBtn: "Approve & Save Prescription",
    selectPatientToast: "Please select a patient before saving.",
    saveSuccessToast: "Prescription digitized and saved successfully!",

    // Clinical Document Types & Diagnoses
    docTypePrescription: "Prescription",
    docTypeLabReport: "Lab Report",
    docTypeDischargeSummary: "Discharge Summary",
    docTypeDiagnosticRecord: "Diagnostic Record",
    docTypeOther: "Medical Record",
    documentTypeLabel: "Document Type",
    documentDateLabel: "Record Date",
    diagnosesHeading: "Clinical Diagnoses",
    diagnosesSubtitle: "Identified medical conditions and clinical impressions",
    addDiagnosisPlaceholder: "Add diagnosis (e.g. Type 2 Diabetes, Hypertension)...",
    addDiagnosisBtn: "Add",

    // Lab Tests & Diagnostic Values
    labTestsHeading: "Lab Reports & Diagnostic Test Values",
    labTestsSubtitle: "Observed test metrics, units, reference intervals, and clinical status",
    addLabTestBtn: "Add Lab Test",
    testNameCol: "Test / Parameter",
    valueCol: "Observed Value",
    referenceRangeCol: "Healthy Target / Range",
    statusCol: "Status",
    interpretationCol: "Clinical Meaning",
    statusNormal: "Normal",
    statusHigh: "High",
    statusLow: "Low",
    statusCritical: "Critical",
    noLabTestsExtracted: "No lab tests detected in this record.",

    // AI Health Summary in Simple Language
    simpleHealthSummaryHeading: "AI Health Summary in Simple Language",
    simpleHealthSummarySubtitle: "Plain language explanation for patients, detailing what abnormal values mean",
    abnormalFindingsAlertHeading: "Abnormal Values & What They Mean to You",
    abnormalItemLabel: "Parameter",
    abnormalMeaningLabel: "What this means",
    normalRangeLabel: "Healthy Target",
    viewSummaryInEn: "English",
    viewSummaryInHi: "हिन्दी",
    viewSummaryInMr: "मराठी",

    // Search Page
    searchTitle: "Search & Archive",
    searchSubtitle: "Search prescriptions across patient name, phone, medications, or diagnosis tags",
    searchPlaceholder: "Search by patient name, phone, medicine (e.g. Augmentin, Paracetamol), or tag...",
    quickFiltersLabel: "Quick filters:",
    searchResultsHeading: "Search Results",
    allPrescriptionsHeading: "All Prescriptions",
    clearSearchBtn: "Clear Search",
    noSearchResultsTitle: "No prescriptions match your search",
    noSearchResultsDesc: "Try searching by a different patient name, phone number, or medication name.",
    patientProfileBtn: "Patient Profile",

    // Prescription Card & Details
    physicianRemarksTitle: "Physician Remarks",
    noPhysicianRemarks: "No physician remarks recorded for this visit.",
    editNotesBtn: "Edit",
    addNotesBtn: "+ Add Notes",
    saveNotesBtn: "Save",
    compareOcrBtn: "Compare OCR",
    lessOcrBtn: "Less",
    rawTextHeading: "Raw Tesseract OCR Text",
    correctedTextHeading: "Corrected Clinical Transcription",
    markedImportantToast: "Marked as ⭐ Important",
    removedImportantToast: "Removed from Important",
    doctorNotesUpdatedToast: "Doctor notes updated",
    prescriptionDeletedToast: "Prescription deleted",
  },

  hi: {
    // Brand & Navigation
    brandTitle: "क्लिनिक ओसीआर",
    brandSubtitle: "एआई पर्ची डिजिटलीकरण",
    aiPowered: "एआई संचालित",
    ocrGeminiBadge: "टेसेरैक्ट ओसीआर + जेमिनी फ्लैश",
    navDashboard: "डैशबोर्ड",
    navPatients: "मरीज़",
    navUpload: "अपलोड",
    navSearch: "खोजें",
    selectLanguage: "भाषा",
    selectTheme: "थीम",
    themeLight: "लाइट",
    themeDark: "डार्क",
    themeSystem: "सिस्टम",
    toggleTheme: "थीम बदलें",

    // Common Actions & Badges
    save: "सुरक्षित करें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    view: "देखें",
    clear: "साफ़ करें",
    search: "खोजें",
    upload: "अपलोड करें",
    exportPdf: "पीडीएफ डाउनलोड",
    important: "महत्वपूर्ण",
    priority: "प्राथमिकता",
    saving: "सुरक्षित हो रहा है...",
    processing: "प्रक्रिया जारी है...",
    back: "वापस",
    actions: "कार्रवाई",
    close: "बंद करें",

    // Dashboard
    dashboardTitle: "डैशबोर्ड",
    dashboardSubtitle: "आपके क्लिनिक रिकॉर्ड का संक्षिप्त विवरण",
    addPatient: "नया मरीज़ जोड़ें",
    newPrescription: "नई पर्ची जोड़ें",
    totalPatients: "कुल मरीज़",
    totalPrescriptions: "कुल पर्चियां",
    recentActivity: "हाल की गतिविधि",
    recentUploadsCount: "हाल के अपलोड",
    recentPrescriptionsTitle: "हाल की पर्चियां",
    noPrescriptionsYet: "अभी तक कोई पर्ची नहीं है",
    uploadFirstPrescriptionDesc: "शुरू करने के लिए अपनी पहली पर्ची अपलोड करें",
    uploadPrescriptionBtn: "पर्ची अपलोड करें",

    // Patients Directory
    patientsTitle: "मरीज़ सूची",
    patientsSubtitle: "अपने सभी मरीज़ों के रिकॉर्ड प्रबंधित करें",
    searchPatientsPlaceholder: "नाम या फोन नंबर से खोजें...",
    noPatientsFound: "कोई मरीज़ नहीं मिला",
    tryDifferentSearch: "कोई अन्य शब्द खोज कर देखें",
    noPatientsYet: "अभी तक कोई मरीज़ नहीं है",
    addFirstPatientDesc: "शुरू करने के लिए पहला मरीज़ जोड़ें",
    prescriptionsCountSuffix: "पर्चियां",
    yrsOld: "वर्ष",
    genderMale: "पुरुष",
    genderFemale: "महिला",
    genderOther: "अन्य",
    registeredOn: "पंजीकृत दिनांक",

    // Patient Dialog Form
    addNewPatientModalTitle: "नया मरीज़ जोड़ें",
    editPatientModalTitle: "मरीज़ की जानकारी बदलें",
    fullNameLabel: "पूरा नाम *",
    fullNamePlaceholder: "मरीज़ का नाम दर्ज करें",
    ageLabel: "उम्र *",
    genderLabel: "लिंग",
    phoneLabel: "फ़ोन नंबर *",
    phonePlaceholder: "फ़ोन नंबर दर्ज करें",
    updatePatientBtn: "जानकारी अपडेट करें",
    savePatientBtn: "मरीज़ जोड़ें",
    fillAllFieldsError: "कृपया सभी आवश्यक विवरण भरें",
    patientAddedSuccess: "मरीज़ सफलतापूर्वक जोड़ा गया",
    patientUpdatedSuccess: "मरीज़ का विवरण अपडेट किया गया",
    deletePatientConfirm: "क्या आप वाकई इस मरीज़ को हटाना चाहते हैं? सभी पर्चियां भी हटा दी जाएंगी।",
    deletePrescriptionConfirm: "क्या आप वाकई इस पर्ची को हटाना चाहते हैं?",
    patientDeletedSuccess: "मरीज़ हटा दिया गया",

    // Patient Profile & Timeline
    patientHistoryTitle: "पर्ची का इतिहास",
    prescriptionTimelineHeading: "पर्ची समय-रेखा",
    sortedByPriorityNote: "प्राथमिकता अनुसार क्रमबद्ध (⭐ महत्वपूर्ण रिकॉर्ड सबसे ऊपर)",
    noHistoryYet: "अभी तक कोई पर्ची दर्ज नहीं है",
    uploadForThisPatient: "इस मरीज़ की हस्तलिखित पर्ची अपलोड और डिजिटाइज़ करें",
    uploadFirstForPatientBtn: "पहली पर्ची अपलोड करें",

    // Upload & Digitization Page
    uploadPageTitle: "पर्ची अपलोड और डिजिटाइज़ करें",
    uploadPageSubtitle: "टेसेरैक्ट ओसीआर और गूगल जेमिनी क्लिनिकल बुद्धिमत्ता",
    step1SelectPatient: "१. मरीज़ चुनें",
    step1SelectPatientDesc: "इस पर्ची के लिए मरीज़ चुनें",
    newPatientBtn: "नया मरीज़",
    noPatientsAlert: "सिस्टम में अभी कोई मरीज़ नहीं है। कृपया पहले मरीज़ जोड़ें।",
    selectPatientPlaceholder: "मरीज़ चुनें...",
    step2CaptureUpload: "२. पर्ची की फोटो लें या अपलोड करें",
    step2CaptureUploadDesc: "समर्थित प्रारूप: JPG, JPEG, PNG",
    clickToUploadOrDrop: "पर्ची की फोटो अपलोड करने के लिए क्लिक करें या यहाँ खींचें",
    highContrastTip: "अच्छी रोशनी और स्पष्ट फोटो से सटीकता सबसे अधिक मिलती है",
    browseFilesBtn: "फ़ाइल चुनें",
    changePhotoBtn: "फोटो बदलें",
    originalImageLabel: "मूल फोटो",
    qualityCheckHeading: "फोटो गुणवत्ता की पूर्व-जाँच",
    qualityCheckPassed: "गुणवत्ता जाँच सफल: अच्छी रोशनी और स्पष्टता।",
    qualityWarningTitle: "गुणवत्ता चेतावनी पाई गई",
    qualityWarningAdvice: "आप आगे बढ़ सकते हैं, या बेहतर परिणाम के लिए स्पष्ट फोटो अपलोड कर सकते हैं।",
    adaptiveThresholdLabel: "अनुकूली थ्रेशोल्ड और स्पष्टीकरण",
    viewEnhancedBtn: "सुधारी हुई फोटो देखें",
    viewOriginalBtn: "मूल फोटो देखें",
    analyzeWithAiBtn: "एआई के साथ पर्ची का विश्लेषण करें",
    uploadingToServerStep: "सर्वर पर फोटो अपलोड हो रही है...",
    extractingOcrStep: "टेसेरैक्ट ओसीआर द्वारा टेक्स्ट निकाला जा रहा है...",
    refiningGeminiStep: "गूगल जेमिनी एआई द्वारा दवाइयों का विश्लेषण हो रहा है...",
    runningAiMsg: "ओसीआर टेक्स्ट निष्कर्षण और क्लिनिकल समझ का विश्लेषण जारी है...",

    // Review & Verification Screen
    reviewBannerTitle: "चिकित्सक समीक्षा और सत्यापन",
    reviewBannerSubtitle: "एआई द्वारा निकाले गए डेटा की समीक्षा करें। डॉक्टर के पास प्रत्येक फ़ील्ड का अंतिम नियंत्रण होता है।",
    startOverBtn: "पुनः प्रारंभ करें",
    approveAndSaveBtn: "सत्यापित करें और सुरक्षित करें",
    assignPatientLabel: "मरीज़ को सौंपें *",
    markImportantLabel: "⭐ महत्वपूर्ण के रूप में चिह्नित करें",
    originalPrescriptionCard: "मूल पर्ची",
    uploadedDocumentDesc: "अपलोड की गई पर्ची का दस्तावेज़",
    rawOcrTitle: "मूल टेसेरैक्ट ओसीआर टेक्स्ट",
    rawOcrSubtitle: "एआई विश्लेषण से पूर्व पहचाना गया टेक्स्ट",
    collapseBtn: "समेटें",
    expandBtn: "विस्तार करें",
    noRawOcrDetected: "ओसीआर द्वारा कोई टेक्स्ट नहीं पहचाना गया।",
    clinicalSummaryTitle: "क्लिनिकल सारांश",
    clinicalSummarySubtitle: "एआई द्वारा तैयार निदान और परामर्श विवरण",
    prescribedMedsTitle: "निर्धारित दवाइयां",
    prescribedMedsSubtitle: "खुराक, समय और दवा का नाम जांचें",
    addMedicineBtn: "दवा जोड़ें",
    noMedsExtractedNotice: "कोई दवा नहीं मिली। मैन्युअल रूप से जोड़ने के लिए 'दवा जोड़ें' पर क्लिक करें।",
    medNameLabel: "दवा का नाम",
    dosageLabel: "खुराक",
    frequencyLabel: "लेने का समय / आवृत्ति",
    durationLabel: "अवधि",
    uncertainLabel: "अनिश्चित",
    possiblyBadge: "अनिश्चित / संभवतः",
    correctedTranscriptionTitle: "सुधारा गया विवरण",
    correctedTranscriptionSubtitle: "सटीक और वर्तनी-सुधार सहित पर्ची टेक्स्ट",
    tagsTitle: "टैग और श्रेणियां",
    tagsSubtitle: "पुराने रिकॉर्ड खोजने में मदद करता है",
    addTagPlaceholder: "टैग जोड़ें (उदा. बुखार, एंटीबायोटिक)...",
    addTagBtn: "जोड़ें",
    doctorRemarksTitle: "चिकित्सक की निजी टिप्पणियाँ (वैकल्पिक)",
    doctorRemarksSubtitle: "फॉलो-अप निर्देश, जांच या विशेष टिप्पणी",
    doctorRemarksPlaceholder: "उदा. सीबीसी रक्त जांच की सलाह दी। ५ दिन बाद समीक्षा करें।",
    discardBtn: "रद्द करें और नई अपलोड करें",
    approveSaveFullBtn: "सत्यापित करें और पर्ची सुरक्षित करें",
    selectPatientToast: "कृपया सुरक्षित करने से पहले एक मरीज़ चुनें।",
    saveSuccessToast: "पर्ची सफलतापूर्वक डिजिटाइज़ और सुरक्षित की गई!",

    // Clinical Document Types & Diagnoses
    docTypePrescription: "डॉक्टर की पर्ची",
    docTypeLabReport: "लैब टेस्ट रिपोर्ट",
    docTypeDischargeSummary: "डिस्चार्ज समरी (अस्पताल छुट्टी)",
    docTypeDiagnosticRecord: "निदान रिकॉर्ड (जांच)",
    docTypeOther: "चिकित्सा रिकॉर्ड",
    documentTypeLabel: "दस्तावेज़ का प्रकार",
    documentDateLabel: "रिकॉर्ड / जांच की तारीख",
    diagnosesHeading: "चिकित्सकीय निदान और रोग",
    diagnosesSubtitle: "पहचाने गए रोग और चिकित्सीय निष्कर्ष",
    addDiagnosisPlaceholder: "निदान जोड़ें (उदा. टाइप २ मधुमेह, उच्च रक्तचाप)...",
    addDiagnosisBtn: "जोड़ें",

    // Lab Tests & Diagnostic Values
    labTestsHeading: "लैब रिपोर्ट्स और नैदानिक टेस्ट परिणाम",
    labTestsSubtitle: "जांचे गए मान, इकाइयां, सामान्य सीमा और स्थिति",
    addLabTestBtn: "लैब टेस्ट जोड़ें",
    testNameCol: "टेस्ट / जांच का नाम",
    valueCol: "दर्ज मान",
    referenceRangeCol: "सामान्य सीमा (टारगेट)",
    statusCol: "स्थिति",
    interpretationCol: "चिकित्सीय अर्थ",
    statusNormal: "सामान्य",
    statusHigh: "अधिक (हाई)",
    statusLow: "कम (लो)",
    statusCritical: "अति गंभीर",
    noLabTestsExtracted: "इस रिकॉर्ड में कोई लैब टेस्ट नहीं मिले।",

    // AI Health Summary in Simple Language
    simpleHealthSummaryHeading: "सरल भाषा में एआई स्वास्थ्य सारांश",
    simpleHealthSummarySubtitle: "मरीज़ों के लिए आसान शब्दों में व्याख्या, जिसमें असामान्य मानों का अर्थ शामिल है",
    abnormalFindingsAlertHeading: "असामान्य जांच परिणाम और उनका आपके लिए अर्थ",
    abnormalItemLabel: "पैरामीटर",
    abnormalMeaningLabel: "इसका क्या अर्थ है",
    normalRangeLabel: "सामान्य लक्ष्य",
    viewSummaryInEn: "English",
    viewSummaryInHi: "हिन्दी",
    viewSummaryInMr: "मराठी",

    // Search Page
    searchTitle: "खोजें और पुरालेख",
    searchSubtitle: "मरीज़ के नाम, फोन नंबर, दवा या निदान टैग द्वारा पर्चियां खोजें",
    searchPlaceholder: "मरीज़ का नाम, फोन, दवा (उदा. ऑगमेंटीन, पैरासिटामोल) या टैग से खोजें...",
    quickFiltersLabel: "त्वरित फ़िल्टर:",
    searchResultsHeading: "खोज परिणाम",
    allPrescriptionsHeading: "सभी पर्चियां",
    clearSearchBtn: "खोज साफ़ करें",
    noSearchResultsTitle: "आपकी खोज से मेल खाती कोई पर्ची नहीं मिली",
    noSearchResultsDesc: "किसी अन्य मरीज़ का नाम, फ़ोन नंबर या दवा का नाम खोज कर देखें।",
    patientProfileBtn: "मरीज़ का प्रोफ़ाइल",

    // Prescription Card & Details
    physicianRemarksTitle: "चिकित्सक टिप्पणी",
    noPhysicianRemarks: "इस विज़िट के लिए कोई डॉक्टर टिप्पणी दर्ज नहीं है।",
    editNotesBtn: "संपादित करें",
    addNotesBtn: "+ टिप्पणी जोड़ें",
    saveNotesBtn: "सुरक्षित करें",
    compareOcrBtn: "ओसीआर टेक्स्ट देखें",
    lessOcrBtn: "कम करें",
    rawTextHeading: "मूल टेसेरैक्ट ओसीआर टेक्स्ट",
    correctedTextHeading: "सुधारित क्लिनिकल विवरण",
    markedImportantToast: "⭐ महत्वपूर्ण के रूप में चिह्नित किया गया",
    removedImportantToast: "महत्वपूर्ण सूची से हटाया गया",
    doctorNotesUpdatedToast: "डॉक्टर की टिप्पणी अपडेट की गई",
    prescriptionDeletedToast: "पर्ची हटा दी गई",
  },

  mr: {
    // Brand & Navigation
    brandTitle: "क्लिनिक ओसीआर",
    brandSubtitle: "एआय प्रिस्क्रिप्शन डिजिटायझेशन",
    aiPowered: "एआय समर्थित",
    ocrGeminiBadge: "टेसेरॅक्ट ओसीआर + जेमिनी फ्लॅश",
    navDashboard: "डॅशबोर्ड",
    navPatients: "रुग्ण",
    navUpload: "अपलोड",
    navSearch: "शोधा",
    selectLanguage: "भाषा",
    selectTheme: "थीम",
    themeLight: "लाइट",
    themeDark: "डार्क",
    themeSystem: "सिस्टम",
    toggleTheme: "थीम बदला",

    // Common Actions & Badges
    save: "जतन करा",
    cancel: "रद्द करा",
    edit: "संपादित करा",
    delete: "हटवा",
    view: "पहा",
    clear: "साफ करा",
    search: "शोधा",
    upload: "अपलोड करा",
    exportPdf: "पीडीएफ डाउनलोड",
    important: "महत्त्वाचे",
    priority: "प्राधान्य",
    saving: "जतन होत आहे...",
    processing: "प्रक्रिया सुरू आहे...",
    back: "मागे",
    actions: "कृती",
    close: "बंद करा",

    // Dashboard
    dashboardTitle: "डॅशबोर्ड",
    dashboardSubtitle: "तुमच्या क्लिनिकच्या नोंदींचा आढावा",
    addPatient: "नवीन रुग्ण जोडा",
    newPrescription: "नवीन प्रिस्क्रिप्शन",
    totalPatients: "एकूण रुग्ण",
    totalPrescriptions: "एकूण प्रिस्क्रिप्शन्स",
    recentActivity: "अलीकडील घडामोडी",
    recentUploadsCount: "अलीकडील अपलोड",
    recentPrescriptionsTitle: "अलीकडील प्रिस्क्रिप्शन्स",
    noPrescriptionsYet: "अद्याप कोणतीही प्रिस्क्रिप्शन नाही",
    uploadFirstPrescriptionDesc: "सुरुवात करण्यासाठी तुमची पहिली प्रिस्क्रिप्शन अपलोड करा",
    uploadPrescriptionBtn: "प्रिस्क्रिप्शन अपलोड करा",

    // Patients Directory
    patientsTitle: "रुग्ण यादी",
    patientsSubtitle: "रुग्णांच्या नोंदी व्यवस्थापित करा",
    searchPatientsPlaceholder: "नाव किंवा फोन नंबरने शोधा...",
    noPatientsFound: "कोणताही रुग्ण सापडला नाही",
    tryDifferentSearch: "वेगळा शब्द शोधून पहा",
    noPatientsYet: "अद्याप कोणतेही रुग्ण नाहीत",
    addFirstPatientDesc: "सुरुवात करण्यासाठी पहिला रुग्ण जोडा",
    prescriptionsCountSuffix: "प्रिस्क्रिप्शन(न्स)",
    yrsOld: "वर्षे",
    genderMale: "पुरुष",
    genderFemale: "स्त्री",
    genderOther: "इतर",
    registeredOn: "नोंदणी दिनांक",

    // Patient Dialog Form
    addNewPatientModalTitle: "नवीन रुग्ण जोडा",
    editPatientModalTitle: "रुग्ण माहिती बदला",
    fullNameLabel: "पूर्ण नाव *",
    fullNamePlaceholder: "रुग्णाचे नाव टाका",
    ageLabel: "वय *",
    genderLabel: "लिंग",
    phoneLabel: "फोन नंबर *",
    phonePlaceholder: "फोन नंबर टाका",
    updatePatientBtn: "माहिती अद्ययावत करा",
    savePatientBtn: "रुग्ण जोडा",
    fillAllFieldsError: "कृपया सर्व आवश्यक माहिती भरा",
    patientAddedSuccess: "रुग्ण यशस्वीरित्या जोडला गेला",
    patientUpdatedSuccess: "रुग्ण माहिती अद्ययावत झाली",
    deletePatientConfirm: "तुम्हाला खात्री आहे का की हा रुग्ण हटवायचा आहे? सर्व प्रिस्क्रिप्शन्स देखील हटवले जातील.",
    deletePrescriptionConfirm: "तुम्हाला खात्री आहे का की हे प्रिस्क्रिप्शन हटवायचे आहे?",
    patientDeletedSuccess: "रुग्ण हटवला गेला",

    // Patient Profile & Timeline
    patientHistoryTitle: "प्रिस्क्रिप्शन इतिहास",
    prescriptionTimelineHeading: "प्रिस्क्रिप्शन कालरेखा",
    sortedByPriorityNote: "प्राधान्यानुसार क्रमवारी (⭐ महत्त्वाच्या नोंदी वर पिन केल्या आहेत)",
    noHistoryYet: "अद्याप कोणतीही प्रिस्क्रिप्शन नोंदवली नाही",
    uploadForThisPatient: "या रुग्णाची हस्तलिखित प्रिस्क्रिप्शन अपलोड आणि डिजिटाईज करा",
    uploadFirstForPatientBtn: "पहिली प्रिस्क्रिप्शन अपलोड करा",

    // Upload & Digitization Page
    uploadPageTitle: "प्रिस्क्रिप्शन अपलोड आणि डिजिटाईज करा",
    uploadPageSubtitle: "टेसेरॅक्ट ओसीआर आणि गुगल जेमिनी क्लिनिकल बुद्धिमत्ता",
    step1SelectPatient: "१. रुग्ण निवडा",
    step1SelectPatientDesc: "या प्रिस्क्रिप्शनसाठी रुग्ण निवडा",
    newPatientBtn: "नवीन रुग्ण",
    noPatientsAlert: "सिस्टीममध्ये अद्याप रुग्ण नाहीत. कृपया प्रथम रुग्ण जोडा.",
    selectPatientPlaceholder: "रुग्ण निवडा...",
    step2CaptureUpload: "२. प्रिस्क्रिप्शनचा फोटो घ्या किंवा अपलोड करा",
    step2CaptureUploadDesc: "समर्थित फॉरमॅट: JPG, JPEG, PNG",
    clickToUploadOrDrop: "फोटो अपलोड करण्यासाठी क्लिक करा किंवा येथे ड्रॅग करा",
    highContrastTip: "चांगला प्रकाश आणि स्पष्ट फोटोमुळे अचूकता अधिक मिळते",
    browseFilesBtn: "फाइल निवडा",
    changePhotoBtn: "फोटो बदला",
    originalImageLabel: "मूळ फोटो",
    qualityCheckHeading: "फोटो गुणवत्ता तपासणी",
    qualityCheckPassed: "गुणवत्ता तपासणी यशस्वी: चांगला प्रकाश आणि स्पष्टता.",
    qualityWarningTitle: "गुणवत्ता इशारा आढळला",
    qualityWarningAdvice: "तुम्ही पुढे जाऊ शकता, किंवा चांगल्या अचूकतेसाठी अधिक स्पष्ट फोटो अपलोड करा.",
    adaptiveThresholdLabel: "अ‍ॅडॉप्टिव्ह थ्रेशोल्ड व स्पष्टीकरण",
    viewEnhancedBtn: "सुधारित फोटो पहा",
    viewOriginalBtn: "मूळ फोटो पहा",
    analyzeWithAiBtn: "एआय द्वारे प्रिस्क्रिप्शनचे विश्लेषण करा",
    uploadingToServerStep: "सर्व्हरवर फोटो अपलोड होत आहे...",
    extractingOcrStep: "टेसेरॅक्ट ओसीआर द्वारे मजकूर काढला जात आहे...",
    refiningGeminiStep: "गुगल जेमिनी एआय द्वारे औषधांचे विश्लेषण सुरू आहे...",
    runningAiMsg: "ओसीआर मजकूर आणि क्लिनिकल समजुतीचे विश्लेषण सुरू आहे...",

    // Review & Verification Screen
    reviewBannerTitle: "डॉक्टर पुनरावलोकन आणि पडताळणी",
    reviewBannerSubtitle: "एआय द्वारे काढलेल्या डेटाचे पुनरावलोकन करा. डॉक्टरांकडे प्रत्येक नोंदीचे अंतिम नियंत्रण असते.",
    startOverBtn: "पुन्हा सुरू करा",
    approveAndSaveBtn: "मंजूर करा आणि जतन करा",
    assignPatientLabel: "रुग्ण निवडा *",
    markImportantLabel: "⭐ महत्त्वाचे म्हणून चिन्हांकित करा",
    originalPrescriptionCard: "मूळ प्रिस्क्रिप्शन",
    uploadedDocumentDesc: "अपलोड केलेले प्रिस्क्रिप्शन दस्तऐवज",
    rawOcrTitle: "मूळ टेसेरॅक्ट ओसीआर मजकूर",
    rawOcrSubtitle: "एआय विश्लेषणापूर्वी ओळखलेला मजकूर",
    collapseBtn: "संक्षिप्त करा",
    expandBtn: "विस्तार करा",
    noRawOcrDetected: "ओसीआर द्वारे कोणताही मजकूर आढळला नाही.",
    clinicalSummaryTitle: "क्लिनिकल सारांश",
    clinicalSummarySubtitle: "एआय द्वारे तयार केलेला तपासणी व सल्ला सारांश",
    prescribedMedsTitle: "दिलेली औषधे",
    prescribedMedsSubtitle: "डोस, वेळ आणि औषधाचे नाव तपासा",
    addMedicineBtn: "औषध जोडा",
    noMedsExtractedNotice: "कोणतीही औषधे आढळली नाहीत. स्वतः जोडण्यासाठी 'औषध जोडा' वर क्लिक करा.",
    medNameLabel: "औषधाचे नाव",
    dosageLabel: "डोस",
    frequencyLabel: "घेण्याची वेळ / वारंवारता",
    durationLabel: "कालावधी",
    uncertainLabel: "अस्पष्ट",
    possiblyBadge: "अस्पष्ट / कदाचित",
    correctedTranscriptionTitle: "सुधारित मजकूर",
    correctedTranscriptionSubtitle: "अचूक व शुद्धलेखन सुधारित प्रिस्क्रिप्शन मजकूर",
    tagsTitle: "टॅग्ज आणि वर्गवारी",
    tagsSubtitle: "मागील नोंदी शोधण्यात मदत होते",
    addTagPlaceholder: "टॅग जोडा (उदा. ताप, अँटीबायोटिक)...",
    addTagBtn: "जोडा",
    doctorRemarksTitle: "डॉक्टरांच्या वैयक्तिक नोंदी (पर्यायी)",
    doctorRemarksSubtitle: "फॉलो-अप सूचना, चाचण्या किंवा विशेष शेरा",
    doctorRemarksPlaceholder: "उदा. सीबीसी रक्त तपासणीचा सल्ला दिला. ५ दिवसांनी पुन्हा या.",
    discardBtn: "रद्द करा व नवीन अपलोड करा",
    approveSaveFullBtn: "मंजूर करा व प्रिस्क्रिप्शन जतन करा",
    selectPatientToast: "कृपया जतन करण्यापूर्वी रुग्ण निवडा.",
    saveSuccessToast: "प्रिस्क्रिप्शन यशस्वीरित्या डिजिटाईज आणि जतन केले गेले!",

    // Clinical Document Types & Diagnoses
    docTypePrescription: "डॉक्टरांचे प्रिस्क्रिप्शन",
    docTypeLabReport: "लॅब चाचणी अहवाल",
    docTypeDischargeSummary: "डिस्चार्ज सारांश (रुग्णालय सोडताना)",
    docTypeDiagnosticRecord: "निदान नोंद (तपासणी)",
    docTypeOther: "वैद्यकीय नोंद",
    documentTypeLabel: "दस्तऐवजाचा प्रकार",
    documentDateLabel: "नोंद / तपासणी तारीख",
    diagnosesHeading: "वैद्यकीय निदान आणि आजार",
    diagnosesSubtitle: "ओळखलेले आजार आणि वैद्यकीय निष्कर्ष",
    addDiagnosisPlaceholder: "निदान जोडा (उदा. टाईप २ मधुमेह, उच्च रक्तदाब)...",
    addDiagnosisBtn: "जोडा",

    // Lab Tests & Diagnostic Values
    labTestsHeading: "लॅब रिपोर्ट्स आणि चाचणी निकाल",
    labTestsSubtitle: "नोंदवलेली मूल्ये, एकके, सामान्य मर्यादा आणि स्थिती",
    addLabTestBtn: "लॅब टेस्ट जोडा",
    testNameCol: "चाचणीचे नाव",
    valueCol: "नोंदवलेले मूल्य",
    referenceRangeCol: "सामान्य मर्यादा (टार्गेट)",
    statusCol: "स्थिती",
    interpretationCol: "वैद्यकीय अर्थ",
    statusNormal: "सामान्य",
    statusHigh: "जास्त (हाय)",
    statusLow: "कमी (लो)",
    statusCritical: "अतिगंभीर",
    noLabTestsExtracted: "या नोंदीमध्ये कोणत्याही लॅब चाचण्या आढळल्या नाहीत.",

    // AI Health Summary in Simple Language
    simpleHealthSummaryHeading: "सोप्या भाषेत एआय आरोग्य सारांश",
    simpleHealthSummarySubtitle: "रुग्णांसाठी सोप्या भाषेत स्पष्टीकरण, ज्यामध्ये असामान्य मूल्यांचा अर्थ समाविष्ट आहे",
    abnormalFindingsAlertHeading: "असामान्य चाचणी निकाल आणि त्यांचा तुमच्यासाठी अर्थ",
    abnormalItemLabel: "घटक / पॅरामीटर",
    abnormalMeaningLabel: "याचा नेमका काय अर्थ",
    normalRangeLabel: "सामान्य मर्यादा",
    viewSummaryInEn: "English",
    viewSummaryInHi: "हिन्दी",
    viewSummaryInMr: "मराठी",

    // Search Page
    searchTitle: "शोधा आणि पुराभिलेख",
    searchSubtitle: "रुग्णाचे नाव, फोन नंबर, औषध किंवा निदान टॅगद्वारे प्रिस्क्रिप्शन्स शोधा",
    searchPlaceholder: "रुग्णाचे नाव, फोन, औषध (उदा. ऑगमेंटीन, पॅरासिटामॉल) किंवा टॅगने शोधा...",
    quickFiltersLabel: "जलद फिल्टर्स:",
    searchResultsHeading: "शोध निकाल",
    allPrescriptionsHeading: "सर्व प्रिस्क्रिप्शन्स",
    clearSearchBtn: "शोध साफ करा",
    noSearchResultsTitle: "तुमच्या शोधाशी जुळणारी कोणतीही प्रिस्क्रिप्शन आढळली नाही",
    noSearchResultsDesc: "इतर रुग्णाचे नाव, फोन नंबर किंवा औषधाचे नाव शोधून पहा.",
    patientProfileBtn: "रुग्ण प्रोफाइल",

    // Prescription Card & Details
    physicianRemarksTitle: "डॉक्टरांचा शेरा",
    noPhysicianRemarks: "या भेटीसाठी डॉक्टरांचा कोणताही शेरा नोंदवलेला नाही.",
    editNotesBtn: "संपादित करा",
    addNotesBtn: "+ शेरा जोडा",
    saveNotesBtn: "जतन करा",
    compareOcrBtn: "ओसीआर मजकूर पहा",
    lessOcrBtn: "कमी करा",
    rawTextHeading: "मूळ टेसेरॅक्ट ओसीआर मजकूर",
    correctedTextHeading: "सुधारित क्लिनिकल मजकूर",
    markedImportantToast: "⭐ महत्त्वाचे म्हणून चिन्हांकित केले",
    removedImportantToast: "महत्त्वाच्या यादीतून काढले",
    doctorNotesUpdatedToast: "डॉक्टरांचा शेरा जतन केला",
    prescriptionDeletedToast: "प्रिस्क्रिप्शन हटवले गेले",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: TranslationKey) => translations.en[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Hydrate preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clinicocr_language") as Language;
      if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("clinicocr_language", lang);
      }
    } catch {
      // Ignore localStorage issues
    }
  };

  const t = (key: TranslationKey): string => {
    const langDict = translations[language];
    if (langDict && key in langDict) {
      return (langDict as Record<string, string>)[key];
    }
    return (translations.en as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
