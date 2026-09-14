import { o as __toESM } from "../_runtime.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { t as createSsrRpc } from "./createSsrRpc-p5Uzme7Q.mjs";
import { t as E } from "../_libs/jspdf.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheet-pdf-0uGmF5lM.js
var import_lib = /* @__PURE__ */ __toESM(require_lib());
var issueSheetTokens = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!Array.isArray(data?.studentIds) || data.studentIds.length === 0) throw new Error("Selecione ao menos um aluno");
	if (data.studentIds.length > 500) throw new Error("Limite de 500 fichas por lote");
	return data;
}).handler(createSsrRpc("7efb8b38bb24d75d7b4d5ff23cc6866822dd376589a7c5a0d560968d5e45bda9"));
var PAGE_W = 210;
var PAGE_H = 297;
var MARGIN = 12;
function ageFromBirth(birth) {
	const b = new Date(birth);
	const n = /* @__PURE__ */ new Date();
	let a = n.getFullYear() - b.getFullYear();
	const m = n.getMonth() - b.getMonth();
	if (m < 0 || m === 0 && n.getDate() < b.getDate()) a--;
	return a;
}
async function toDataURL(url) {
	try {
		const blob = await (await fetch(url, { mode: "cors" })).blob();
		return await new Promise((resolve) => {
			const fr = new FileReader();
			fr.onload = () => resolve(fr.result);
			fr.onerror = () => resolve(null);
			fr.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}
var FIELDS = [
	{
		label: "Peso",
		unit: "kg"
	},
	{
		label: "Altura",
		unit: "cm"
	},
	{
		label: "Cintura (RCE)",
		unit: "cm"
	},
	{
		label: "Envergadura",
		unit: "cm"
	},
	{
		label: "Flexibilidade (sentar e alcançar)",
		unit: "cm"
	},
	{
		label: "Abdominal 1 min",
		unit: "reps"
	},
	{
		label: "Salto Horizontal",
		unit: "cm"
	},
	{
		label: "Medicine Ball 2kg",
		unit: "m"
	},
	{
		label: "Agilidade (quadrado)",
		unit: "s"
	},
	{
		label: "Velocidade 20 m",
		unit: "s"
	},
	{
		label: "Corrida 6 min",
		unit: "m"
	}
];
async function renderStudentPage(doc, b, st, logoData, photoData) {
	let y = MARGIN;
	doc.setFillColor(245, 247, 250);
	doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 22, "F");
	if (logoData) try {
		doc.addImage(logoData, "PNG", 14, y + 2, 18, 18);
	} catch {}
	doc.setTextColor(40, 40, 40);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.text(b.tenant.name || "ProMetric", 36, y + 8);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.setTextColor(110, 110, 110);
	doc.text("Ficha de Avaliação Física — Modo Prancheta", 36, y + 14);
	doc.setFontSize(8);
	doc.text(`Impressa em ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")} · ProMetric®`, 36, y + 19);
	const qrSize = 32;
	const qrDataUrl = await import_lib.toDataURL(st.token, {
		errorCorrectionLevel: "M",
		margin: 1,
		width: 256
	});
	doc.addImage(qrDataUrl, "PNG", PAGE_W - MARGIN - qrSize, y - 4, qrSize, qrSize);
	doc.setFontSize(6);
	doc.setTextColor(140, 140, 140);
	doc.text("QR de identificação", PAGE_W - MARGIN - qrSize, y + qrSize - 3, { maxWidth: qrSize });
	y += 30;
	const blockH = 26;
	doc.setDrawColor(220, 220, 220);
	doc.setLineWidth(.3);
	doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, blockH);
	const photoSize = blockH - 4;
	const photoX = 14;
	if (photoData) try {
		doc.addImage(photoData, "JPEG", photoX, y + 2, photoSize, photoSize);
	} catch {
		drawPhotoPlaceholder(doc, photoX, y + 2, photoSize);
	}
	else drawPhotoPlaceholder(doc, photoX, y + 2, photoSize);
	const infoX = 40;
	doc.setTextColor(30, 30, 30);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(12);
	doc.text(st.full_name, infoX, y + 7);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.setTextColor(80, 80, 80);
	const age = ageFromBirth(st.birth_date);
	const sexLabel = st.sex === "male" ? "Masculino" : st.sex === "female" ? "Feminino" : st.sex;
	const line1 = [`${age} anos`, sexLabel].filter(Boolean).join(" · ");
	const line2 = [st.class_name, st.school_name].filter(Boolean).join(" · ");
	doc.text(line1, infoX, y + 13);
	if (line2) doc.text(line2, infoX, y + 19);
	doc.setFontSize(8);
	doc.setTextColor(110, 110, 110);
	doc.text("Data da avaliação:", PAGE_W - MARGIN - 60, y + 7);
	doc.setDrawColor(160, 160, 160);
	doc.line(PAGE_W - MARGIN - 30, y + 8, PAGE_W - MARGIN - 2, y + 8);
	doc.text("Professor(a):", PAGE_W - MARGIN - 60, y + 16);
	doc.line(PAGE_W - MARGIN - 38, y + 17, PAGE_W - MARGIN - 2, y + 17);
	y += 32;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(10);
	doc.setTextColor(40, 40, 40);
	doc.text("Antropometria e Testes Físicos", MARGIN, y);
	y += 4;
	const colW = (PAGE_W - MARGIN * 2 - 4) / 2;
	const rowH = 16;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	for (let i = 0; i < FIELDS.length; i++) {
		const col = i % 2;
		const row = Math.floor(i / 2);
		const x = MARGIN + col * 95;
		const cy = y + row * 18;
		doc.setDrawColor(200, 200, 200);
		doc.setLineWidth(.3);
		doc.rect(x, cy, colW, rowH);
		doc.setTextColor(60, 60, 60);
		doc.setFont("helvetica", "bold");
		doc.text(FIELDS[i].label, x + 2, cy + 4.5);
		doc.setFont("helvetica", "normal");
		doc.setTextColor(140, 140, 140);
		doc.setFontSize(8);
		doc.text(`(${FIELDS[i].unit})`, x + 2, cy + 9);
		const valBoxX = x + colW - 38;
		doc.setDrawColor(120, 120, 120);
		doc.setLineWidth(.5);
		doc.rect(valBoxX, cy + 3, 34, rowH - 6);
		doc.setFontSize(9);
	}
	y += Math.ceil(FIELDS.length / 2) * 18 + 4;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(10);
	doc.setTextColor(40, 40, 40);
	doc.text("Observações", MARGIN, y);
	y += 3;
	doc.setDrawColor(200, 200, 200);
	doc.setLineWidth(.3);
	const obsH = 24;
	doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, obsH);
	doc.setDrawColor(230, 230, 230);
	for (let l = 1; l < 4; l++) doc.line(14, y + obsH / 4 * l, PAGE_W - MARGIN - 2, y + obsH / 4 * l);
	y += 32;
	doc.setDrawColor(140, 140, 140);
	doc.line(22, y, 102, y);
	doc.setFontSize(8);
	doc.setTextColor(110, 110, 110);
	doc.text("Assinatura do Professor(a)", 22, y + 4);
	doc.setFontSize(7);
	doc.setTextColor(150, 150, 150);
	doc.text(`ID: ${st.id.slice(0, 8)} · ${st.token.slice(0, 16)}…  ·  Não rasure as caixas de valor — escreva com clareza dentro do quadro.`, MARGIN, PAGE_H - 6);
}
function drawPhotoPlaceholder(doc, x, y, size) {
	doc.setFillColor(235, 235, 235);
	doc.rect(x, y, size, size, "F");
	doc.setTextColor(160, 160, 160);
	doc.setFontSize(7);
	doc.text("FOTO", x + size / 2, y + size / 2 + 1, { align: "center" });
}
async function generateSheetPDF(bundle) {
	const doc = new E({
		unit: "mm",
		format: "a4"
	});
	const logoData = bundle.tenant.logo_url ? await toDataURL(bundle.tenant.logo_url) : null;
	for (let i = 0; i < bundle.students.length; i++) {
		if (i > 0) doc.addPage();
		const st = bundle.students[i];
		await renderStudentPage(doc, bundle, st, logoData, st.photo_url ? await toDataURL(st.photo_url) : null);
	}
	const name = bundle.students.length === 1 ? `ficha-${bundle.students[0].full_name.replace(/\s+/g, "_")}.pdf` : `fichas-lote-${bundle.students.length}.pdf`;
	doc.save(name);
}
//#endregion
export { issueSheetTokens as n, generateSheetPDF as t };
