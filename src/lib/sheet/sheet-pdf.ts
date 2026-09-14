// Client-side PDF generator for printed evaluation sheets (Modo Prancheta).
// Uses jsPDF + qrcode. Layout: 1 student per A4 page.
// Large boxed fields optimized for handwriting + later OCR.

import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { SheetBundle, SheetStudent } from "./sheet.functions";

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 12;

function ageFromBirth(birth: string): number {
  const b = new Date(birth);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}

async function toDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const FIELDS: { label: string; unit: string }[] = [
  { label: "Peso", unit: "kg" },
  { label: "Altura", unit: "cm" },
  { label: "Cintura (RCE)", unit: "cm" },
  { label: "Envergadura", unit: "cm" },
  { label: "Flexibilidade (sentar e alcançar)", unit: "cm" },
  { label: "Abdominal 1 min", unit: "reps" },
  { label: "Salto Horizontal", unit: "cm" },
  { label: "Medicine Ball 2kg", unit: "m" },
  { label: "Agilidade (quadrado)", unit: "s" },
  { label: "Velocidade 20 m", unit: "s" },
  { label: "Corrida 6 min", unit: "m" },
];

async function renderStudentPage(doc: jsPDF, b: SheetBundle, st: SheetStudent, logoData: string | null, photoData: string | null) {
  let y = MARGIN;

  // Header bar
  doc.setFillColor(245, 247, 250);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 22, "F");

  if (logoData) {
    try { doc.addImage(logoData, "PNG", MARGIN + 2, y + 2, 18, 18); } catch { /* ignore */ }
  }
  doc.setTextColor(40,40,40);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text(b.tenant.name || "ProMetric", MARGIN + 24, y + 8);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(110,110,110);
  doc.text("Ficha de Avaliação Física — Modo Prancheta", MARGIN + 24, y + 14);
  doc.setFontSize(8);
  doc.text(`Impressa em ${new Date().toLocaleDateString("pt-BR")} · ProMetric®`, MARGIN + 24, y + 19);

  // QR code (top right)
  const qrSize = 32;
  const qrDataUrl = await QRCode.toDataURL(st.token, { errorCorrectionLevel: "M", margin: 1, width: 256 });
  doc.addImage(qrDataUrl, "PNG", PAGE_W - MARGIN - qrSize, y - 4, qrSize, qrSize);
  doc.setFontSize(6); doc.setTextColor(140,140,140);
  doc.text("QR de identificação", PAGE_W - MARGIN - qrSize, y + qrSize - 3, { maxWidth: qrSize });

  y += 30;

  // Student block
  const blockH = 26;
  doc.setDrawColor(220,220,220); doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, blockH);

  // Photo (left) — optional
  const photoSize = blockH - 4;
  const photoX = MARGIN + 2;
  if (photoData) {
    try { doc.addImage(photoData, "JPEG", photoX, y + 2, photoSize, photoSize); }
    catch { drawPhotoPlaceholder(doc, photoX, y + 2, photoSize); }
  } else {
    drawPhotoPlaceholder(doc, photoX, y + 2, photoSize);
  }

  const infoX = photoX + photoSize + 4;
  doc.setTextColor(30,30,30); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text(st.full_name, infoX, y + 7);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80,80,80);
  const age = ageFromBirth(st.birth_date);
  const sexLabel = st.sex === "male" ? "Masculino" : st.sex === "female" ? "Feminino" : st.sex;
  const line1 = [`${age} anos`, sexLabel].filter(Boolean).join(" · ");
  const line2 = [st.class_name, st.school_name].filter(Boolean).join(" · ");
  doc.text(line1, infoX, y + 13);
  if (line2) doc.text(line2, infoX, y + 19);

  // Date of evaluation (right side of info block)
  doc.setFontSize(8); doc.setTextColor(110,110,110);
  doc.text("Data da avaliação:", PAGE_W - MARGIN - 60, y + 7);
  doc.setDrawColor(160,160,160); doc.line(PAGE_W - MARGIN - 30, y + 8, PAGE_W - MARGIN - 2, y + 8);
  doc.text("Professor(a):", PAGE_W - MARGIN - 60, y + 16);
  doc.line(PAGE_W - MARGIN - 38, y + 17, PAGE_W - MARGIN - 2, y + 17);

  y += blockH + 6;

  // Section title
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(40,40,40);
  doc.text("Antropometria e Testes Físicos", MARGIN, y);
  y += 4;

  // Field grid — 2 columns
  const colW = (PAGE_W - MARGIN * 2 - 4) / 2;
  const rowH = 16;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  for (let i = 0; i < FIELDS.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (colW + 4);
    const cy = y + row * (rowH + 2);

    doc.setDrawColor(200,200,200); doc.setLineWidth(0.3);
    doc.rect(x, cy, colW, rowH);

    doc.setTextColor(60,60,60); doc.setFont("helvetica", "bold");
    doc.text(FIELDS[i].label, x + 2, cy + 4.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(140,140,140); doc.setFontSize(8);
    doc.text(`(${FIELDS[i].unit})`, x + 2, cy + 9);

    // Value box (large, for handwriting + OCR)
    const valBoxX = x + colW - 38;
    doc.setDrawColor(120,120,120); doc.setLineWidth(0.5);
    doc.rect(valBoxX, cy + 3, 34, rowH - 6);
    doc.setFontSize(9);
  }
  y += Math.ceil(FIELDS.length / 2) * (rowH + 2) + 4;

  // Observações
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(40,40,40);
  doc.text("Observações", MARGIN, y);
  y += 3;
  doc.setDrawColor(200,200,200); doc.setLineWidth(0.3);
  const obsH = 24;
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, obsH);
  // ruled lines
  doc.setDrawColor(230,230,230);
  for (let l = 1; l < 4; l++) doc.line(MARGIN + 2, y + (obsH / 4) * l, PAGE_W - MARGIN - 2, y + (obsH / 4) * l);
  y += obsH + 8;

  // Signature
  doc.setDrawColor(140,140,140);
  doc.line(MARGIN + 10, y, MARGIN + 90, y);
  doc.setFontSize(8); doc.setTextColor(110,110,110);
  doc.text("Assinatura do Professor(a)", MARGIN + 10, y + 4);

  // Footer
  doc.setFontSize(7); doc.setTextColor(150,150,150);
  doc.text(
    `ID: ${st.id.slice(0, 8)} · ${st.token.slice(0, 16)}…  ·  Não rasure as caixas de valor — escreva com clareza dentro do quadro.`,
    MARGIN, PAGE_H - 6
  );
}

function drawPhotoPlaceholder(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFillColor(235,235,235); doc.rect(x, y, size, size, "F");
  doc.setTextColor(160,160,160); doc.setFontSize(7);
  doc.text("FOTO", x + size / 2, y + size / 2 + 1, { align: "center" });
}

export async function generateSheetPDF(bundle: SheetBundle): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const logoData = bundle.tenant.logo_url ? await toDataURL(bundle.tenant.logo_url) : null;

  for (let i = 0; i < bundle.students.length; i++) {
    if (i > 0) doc.addPage();
    const st = bundle.students[i];
    const photoData = st.photo_url ? await toDataURL(st.photo_url) : null;
    await renderStudentPage(doc, bundle, st, logoData, photoData);
  }

  const name = bundle.students.length === 1
    ? `ficha-${bundle.students[0].full_name.replace(/\s+/g, "_")}.pdf`
    : `fichas-lote-${bundle.students.length}.pdf`;
  doc.save(name);
}
