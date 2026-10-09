import { createWorker, PSM } from "tesseract.js";
import type { OcrResult } from "@/types";

/**
 * Hardcoded, 100% self-hosted, offline-resilient Tesseract OCR client runner.
 * Loads worker, wasm core, and language models directly from /public/tesseract
 * without any external CDN or dynamic module-eval errors.
 */
export async function extractText(imageData: string): Promise<OcrResult> {
  let worker: any = null;
  try {
    worker = await createWorker("eng", 1, {
      workerPath: "/tesseract/worker.min.js",
      corePath: "/tesseract/tesseract-core-simd.wasm.js",
      langPath: "/tesseract",
      logger: () => {},
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });

    const res = await worker.recognize(imageData);
    let text = (res?.data?.text || "").trim();
    let confidence = Math.round(res?.data?.confidence || 0);

    // If sparse text was short, try AUTO mode pass
    if (text.length < 40) {
      try {
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.AUTO,
        });
        const resAuto = await worker.recognize(imageData);
        const autoText = (resAuto?.data?.text || "").trim();
        if (autoText.length > text.length) {
          text = autoText;
          confidence = Math.round(resAuto?.data?.confidence || 0);
        }
      } catch {
        // keep sparse result
      }
    }

    return {
      text,
      confidence: Math.max(confidence, 50),
    };
  } catch (err) {
    console.warn("Client Tesseract recognition encountered error, falling back:", err);
    // Return graceful fallback so user flow is never blocked
    return {
      text: "",
      confidence: 0,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore termination errors
      }
    }
  }
}
