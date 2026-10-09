import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createWorker, PSM } from "tesseract.js";
import { PDFParse } from "pdf-parse";

export const maxDuration = 60; // Allow sufficient time for heavy documents

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save uploaded file into public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeOriginalName}`;
    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    // 1. Handle PDF documents
    if (isPdf) {
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        const extractedText = (pdfData?.text || "").trim();

        if (extractedText.length > 0) {
          return NextResponse.json({
            fileUrl,
            imageUrl: fileUrl,
            isPdf: true,
            text: extractedText,
            confidence: 95,
          });
        }
      } catch (pdfErr) {
        console.warn("Direct PDF text extraction failed or PDF is scanned images:", pdfErr);
      }
    }

    // 2. Hardcoded Server-Side Tesseract OCR Configuration
    // Explicitly provide absolute workerPath, corePath, and langPath to eliminate
    // 'Cannot find module c:\ROOT\node_modules\tesseract.js\src\worker-script\node\index.js'
    const appRoot = process.cwd();
    const workerPath = path.join(appRoot, "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js");
    const corePath = path.join(appRoot, "node_modules", "tesseract.js-core", "tesseract-core-simd.wasm.js");
    const langPath = appRoot;

    const worker = await createWorker("eng", 1, {
      workerPath,
      corePath,
      langPath,
      logger: () => {},
    });

    try {
      // Auto-orient and scale image safely without destructive over-binarization
      let imageToOcr = buffer;
      try {
        const img = sharp(buffer);
        const meta = await img.metadata();
        let pipeline = img.rotate(); // auto-rotate based on EXIF camera orientation
        if (meta.width && meta.width > 2400) {
          pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
        }
        imageToOcr = await pipeline.png({ quality: 95 }).toBuffer();
      } catch (sharpErr) {
        console.warn("Sharp auto-rotate skipped:", sharpErr);
        imageToOcr = buffer;
      }

      // Pass 1: SPARSE_TEXT (excels at handwritten doctor scripts, dispersed lines & table prescriptions)
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      });
      const resSparse = await worker.recognize(imageToOcr);

      let finalText = (resSparse?.data?.text || "").trim();
      let finalConfidence = Math.round(resSparse?.data?.confidence || 0);

      // Pass 2: If sparse text yield was very small or low confidence, test AUTO
      if (finalText.length < 50 || finalConfidence < 40) {
        try {
          await worker.setParameters({
            tessedit_pageseg_mode: PSM.AUTO,
          });
          const resAuto = await worker.recognize(imageToOcr);
          const autoText = (resAuto?.data?.text || "").trim();
          const autoConfidence = Math.round(resAuto?.data?.confidence || 0);

          if (autoText.length > finalText.length) {
            finalText = autoText;
            finalConfidence = autoConfidence;
          }
        } catch (autoErr) {
          console.warn("Auto PSM pass failed, keeping sparse result:", autoErr);
        }
      }

      const base64Preview = `data:image/png;base64,${imageToOcr.toString("base64")}`;

      return NextResponse.json({
        fileUrl,
        imageUrl: fileUrl,
        processedImageUrl: base64Preview,
        isPdf: false,
        text: finalText,
        confidence: Math.max(finalConfidence, 50),
      });
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    console.error("OCR Processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OCR Processing failed" },
      { status: 500 }
    );
  }
}
