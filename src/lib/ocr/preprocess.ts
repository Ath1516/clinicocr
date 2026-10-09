"use client";

export interface QualityCheck {
  isBlurry: boolean;
  isDark: boolean;
  isOverexposed: boolean;
  warnings: string[];
}

export function checkImageQuality(canvas: HTMLCanvasElement): QualityCheck {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { isBlurry: false, isDark: false, isOverexposed: false, warnings: [] };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    totalBrightness += brightness;
  }

  const avgBrightness = totalBrightness / pixelCount;
  const warnings: string[] = [];
  const isDark = avgBrightness < 55;
  const isOverexposed = avgBrightness > 225;

  if (isDark) warnings.push("Image appears too dark. Consider recapturing with better lighting.");
  if (isOverexposed) warnings.push("Image appears overexposed. Consider reducing flash or lighting.");

  // Blur detection using Laplacian variance
  const grayData = new Float32Array(pixelCount);
  for (let i = 0; i < data.length; i += 4) {
    grayData[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  let laplacianVariance = 0;
  const width = canvas.width;
  const height = canvas.height;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplacian =
        -4 * grayData[idx] +
        grayData[idx - 1] +
        grayData[idx + 1] +
        grayData[idx - width] +
        grayData[idx + width];
      laplacianVariance += laplacian * laplacian;
    }
  }
  laplacianVariance /= (width - 2) * (height - 2);

  const isBlurry = laplacianVariance < 80;
  if (isBlurry) warnings.push("Image may be slightly blurry. Sharper photos yield higher accuracy.");

  return { isBlurry, isDark, isOverexposed, warnings };
}

/**
 * Enhanced adaptive preprocessing without hard binarization clipping.
 * Preserves faint ballpoint ink, colored doctor stamps, and pencil notes.
 */
export function preprocessImage(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. Calculate min and max luminance for dynamic contrast stretching
  let minLum = 255;
  let maxLum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const range = maxLum - minLum || 1;

  // 2. Grayscale + gentle contrast normalization (preserving gradients, no hard 0/255 cut)
  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    // Normalized contrast stretch
    let stretched = ((lum - minLum) / range) * 255;

    // Gentle gamma curve to darken faint handwriting strokes while keeping paper white
    stretched = Math.pow(stretched / 255, 1.25) * 255;
    const finalVal = Math.max(0, Math.min(255, Math.round(stretched)));

    data[i] = finalVal;
    data[i + 1] = finalVal;
    data[i + 2] = finalVal;
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (tempCtx) {
    tempCtx.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL("image/png");
  }

  return canvas.toDataURL("image/png");
}

export function loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Resize to optimal OCR resolution (max 2200px)
        const maxDim = 2200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height / width) * maxDim);
            width = maxDim;
          } else {
            width = Math.round((width / height) * maxDim);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas);
        } else {
          reject(new Error("Unable to create canvas context"));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
