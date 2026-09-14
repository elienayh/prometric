// OCR tradicional (sem IA) usando Tesseract.js. Worker singleton para evitar
// recarregar modelo a cada leitura.

import type { Worker } from "tesseract.js";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const w = await createWorker("eng", 1, {
        // sem logger por padrão
      });
      return w;
    })();
  }
  return workerPromise;
}

export type FieldOCR = { value: number | null; confidence: number; raw: string };

function parseNumber(raw: string): number | null {
  const cleaned = raw
    .replace(/[^0-9.,-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // separador de milhar
    .replace(",", ".");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function ocrField(
  canvas: HTMLCanvasElement,
  opts: { allowSlash?: boolean } = {},
): Promise<FieldOCR> {
  const worker = await getWorker();
  await worker.setParameters({
    tessedit_char_whitelist: opts.allowSlash ? "0123456789,./-" : "0123456789,.-",
    tessedit_pageseg_mode: "7" as never, // PSM 7: single line
  });
  const { data } = await worker.recognize(canvas);
  const raw = (data.text ?? "").trim();
  const conf = Math.max(0, Math.min(1, (data.confidence ?? 0) / 100));
  return { value: parseNumber(raw), confidence: conf, raw };
}

export type DateOCR = { value: string | null; confidence: number; raw: string };

export async function ocrDate(canvas: HTMLCanvasElement): Promise<DateOCR> {
  const worker = await getWorker();
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789/-.",
    tessedit_pageseg_mode: "7" as never,
  });
  const { data } = await worker.recognize(canvas);
  const raw = (data.text ?? "").trim();
  const conf = Math.max(0, Math.min(1, (data.confidence ?? 0) / 100));
  // Aceita dd/mm/aaaa, dd-mm-aaaa, dd.mm.aaaa
  const m = raw.match(/(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (!m) return { value: null, confidence: conf, raw };
  let [, d, mo, y] = m;
  if (y.length === 2) y = (Number(y) > 70 ? "19" : "20") + y;
  const dd = d.padStart(2, "0");
  const mm = mo.padStart(2, "0");
  const iso = `${y}-${mm}-${dd}`;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return { value: null, confidence: conf, raw };
  return { value: iso, confidence: conf, raw };
}

export async function terminateOcrWorker(): Promise<void> {
  if (!workerPromise) return;
  const w = await workerPromise;
  workerPromise = null;
  await w.terminate();
}
