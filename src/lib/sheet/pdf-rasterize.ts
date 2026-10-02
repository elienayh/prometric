// Client-side helper that turns a PDF file into one PNG File per page,
// suitable for the existing decodeSheetsInImage() pipeline.
//
// Uses pdfjs-dist (legacy ESM build) and ships the worker from the same
// package via Vite's `?url` import — no CDN, no extra config.
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";

(pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerUrl;

const RENDER_SCALE = 2; // ~150 DPI on A4 — keeps the QR sharp without huge files
const MAX_PAGES = 20;

export async function rasterizePdfToImages(file: File): Promise<File[]> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjs as unknown as {
    getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<unknown> }> };
  })
    .getDocument({ data: buf })
    .promise;

  const total = Math.min(pdf.numPages, MAX_PAGES);
  const out: File[] = [];
  for (let i = 1; i <= total; i++) {
    const page = (await pdf.getPage(i)) as {
      getViewport: (o: { scale: number }) => { width: number; height: number };
      render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
    };
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível para renderizar PDF");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem da página"))), "image/png"),
    );
    out.push(new File([blob], `${file.name.replace(/\.pdf$/i, "")}-p${i}.png`, { type: "image/png" }));
  }
  return out;
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}
