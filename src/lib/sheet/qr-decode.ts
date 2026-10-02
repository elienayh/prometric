// Client-side QR decoder for uploaded sheet photos.
// - decodeSheetImage: single-sheet image → 1 decoded payload (legacy)
// - decodeSheetsInImage: photo with one OR many sheets → N decoded payloads.
//   Strategy: find all QR codes by repeatedly running jsQR and masking the
//   region already found; for each QR, estimate the parent A4 page bounding
//   box (QR is at top-right, ~32mm wide on a 210x297mm page) and crop a
//   separate JPEG that contains only that sheet. Each crop is sent to OCR
//   independently, so the AI never sees more than one ficha per request.
import jsQR from "jsqr";

const MAX_DIM = 2000; // a bit higher than single-sheet to keep small QRs readable
const MAX_SHEETS = 12;
const PREVIEW_DATAURL_MAX = 320; // px for the visual preview in the review UI

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = url;
    });
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}

function drawToCanvas(img: HTMLImageElement, maxDim: number): HTMLCanvasElement {
  const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível neste navegador");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

export type DecodedSheet = {
  token: string;
  imageBase64: string; // JPEG base64 (no data: prefix) — what the OCR sees
  mime: "image/jpeg";
  width: number;
  height: number;
  previewDataUrl: string; // small JPEG data URL for the review thumbnail
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy single-sheet entry — kept for callers that still expect one decode.
// ─────────────────────────────────────────────────────────────────────────────
export async function decodeSheetImage(file: File): Promise<DecodedSheet> {
  const sheets = await decodeSheetsInImage(file);
  if (sheets.length === 0) throw new Error("QR Code não encontrado na imagem");
  return sheets[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-sheet decoder
// ─────────────────────────────────────────────────────────────────────────────
type QRHit = {
  token: string;
  cx: number; cy: number; // QR center in pixels
  qrSize: number;         // average QR side in pixels
  bbox: { x: number; y: number; w: number; h: number };
};

export async function decodeSheetsInImage(file: File): Promise<DecodedSheet[]> {
  const img = await loadImageFromFile(file);
  const canvas = drawToCanvas(img, MAX_DIM);
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const hits = findAllQRs(imageData);
  if (hits.length === 0) throw new Error("Nenhum QR Code encontrado na imagem");

  // Deduplicate by token (same sheet read twice).
  const seen = new Set<string>();
  const unique = hits.filter((h) => {
    if (seen.has(h.token)) return false;
    seen.add(h.token);
    return true;
  });

  return unique.map((hit) => cropSheetAroundQR(canvas, hit));
}

function findAllQRs(imageData: ImageData): QRHit[] {
  const hits: QRHit[] = [];
  // jsQR mutates by reading — we mask found regions in a working buffer copy.
  const work = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  for (let i = 0; i < MAX_SHEETS; i++) {
    const code = jsQR(work.data, work.width, work.height, {
      inversionAttempts: "attemptBoth",
    });
    if (!code?.data) break;
    const token = code.data.trim();
    const loc = code.location;
    const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
    const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(work.width, Math.max(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxY = Math.min(work.height, Math.max(...ys));
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);

    if (token.startsWith("PM1.")) {
      hits.push({
        token,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        qrSize: (w + h) / 2,
        bbox: { x: minX, y: minY, w, h },
      });
    }

    // Mask the found QR (plus a small halo) so the next iteration finds others.
    maskRect(work, minX - w * 0.3, minY - h * 0.3, w * 1.6, h * 1.6);
  }
  return hits;
}

function maskRect(img: ImageData, x: number, y: number, w: number, h: number) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(img.width, Math.ceil(x + w));
  const y1 = Math.min(img.height, Math.ceil(y + h));
  for (let py = y0; py < y1; py++) {
    let idx = (py * img.width + x0) * 4;
    for (let px = x0; px < x1; px++) {
      img.data[idx] = 255;
      img.data[idx + 1] = 255;
      img.data[idx + 2] = 255;
      img.data[idx + 3] = 255;
      idx += 4;
    }
  }
}

// Page geometry: on the printed PDF the QR sits in the top-right of an A4
// (210x297mm) with the QR ≈ 32mm wide and margin ≈ 12mm. We estimate the
// page bounds from the QR pixel size and crop, clamped to the canvas.
function cropSheetAroundQR(srcCanvas: HTMLCanvasElement, hit: QRHit): DecodedSheet {
  const qr = hit.qrSize;
  const pageW = qr * (210 / 32);
  const pageH = qr * (297 / 32);
  // QR center is roughly at: x = pageW - margin(12) - qr/2, y = margin(12) + qr/2 - 4 (header offset)
  const qrRightInset = (12 + 32 / 2) / 210; // ≈ 0.133
  const qrTopOffset = (12 + 32 / 2 - 4) / 297; // ≈ 0.054
  const pageRight = hit.cx + pageW * qrRightInset;
  const pageTop = hit.cy - pageH * qrTopOffset;
  const pageLeft = pageRight - pageW;
  const pageBottom = pageTop + pageH;

  // Clamp + add 2% safety padding.
  const pad = 0.02;
  const sx = Math.max(0, Math.floor(pageLeft - pageW * pad));
  const sy = Math.max(0, Math.floor(pageTop - pageH * pad));
  const ex = Math.min(srcCanvas.width, Math.ceil(pageRight + pageW * pad));
  const ey = Math.min(srcCanvas.height, Math.ceil(pageBottom + pageH * pad));
  const sw = Math.max(1, ex - sx);
  const sh = Math.max(1, ey - sy);

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const octx = out.getContext("2d")!;
  octx.drawImage(srcCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

  const dataUrl = out.toDataURL("image/jpeg", 0.85);
  const imageBase64 = dataUrl.split(",")[1] ?? "";

  // small preview thumb
  const pratio = Math.min(1, PREVIEW_DATAURL_MAX / Math.max(sw, sh));
  const pw = Math.max(1, Math.round(sw * pratio));
  const ph = Math.max(1, Math.round(sh * pratio));
  const pcv = document.createElement("canvas");
  pcv.width = pw; pcv.height = ph;
  pcv.getContext("2d")!.drawImage(out, 0, 0, pw, ph);
  const previewDataUrl = pcv.toDataURL("image/jpeg", 0.7);

  return {
    token: hit.token,
    imageBase64,
    mime: "image/jpeg",
    width: sw,
    height: sh,
    previewDataUrl,
  };
}
