// Pré-processamento de imagem (somente no navegador) para o pipeline de OCR
// tradicional da ficha ProMetric. Sem dependência de IA.

import type { ROI } from "./sheet-layout";

/** Carrega um data URL JPEG (output de qr-decode) em um HTMLCanvasElement. */
export async function dataUrlToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  return canvas;
}

/** Recorta uma região normalizada (0..1) do canvas. */
export function cropROI(src: HTMLCanvasElement, roi: ROI, upscale = 2): HTMLCanvasElement {
  const sx = Math.max(0, Math.floor(roi.x * src.width));
  const sy = Math.max(0, Math.floor(roi.y * src.height));
  const sw = Math.max(1, Math.floor(roi.w * src.width));
  const sh = Math.max(1, Math.floor(roi.h * src.height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, sw * upscale);
  out.height = Math.max(1, sh * upscale);
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out;
}

/**
 * Converte para tons de cinza + aplica threshold de Otsu para binarizar.
 * Melhora muito a leitura do Tesseract em manuscritos com sombra leve.
 */
export function enhance(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = img.data;

  // Grayscale
  const gray = new Uint8ClampedArray(data.length / 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
  }

  // Histogram + Otsu
  const hist = new Array<number>(256).fill(0);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0,
    wB = 0,
    varMax = 0,
    threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const v = wB * wF * (mB - mF) * (mB - mF);
    if (v > varMax) {
      varMax = v;
      threshold = t;
    }
  }

  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const v = gray[j] > threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
