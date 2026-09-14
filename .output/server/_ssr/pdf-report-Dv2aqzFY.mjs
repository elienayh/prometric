import { c as overallScore, n as ZONES, t as TEST_META } from "./proesp-DU2T_E5l.mjs";
import { t as E } from "../_libs/jspdf.mjs";
import { t as autoTable } from "../_libs/jspdf-autotable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pdf-report-Dv2aqzFY.js
var PRIMARY = [
	99,
	102,
	241
];
function generateEvaluationPDF(tenantName, ev) {
	const doc = new E({
		unit: "mm",
		format: "a4"
	});
	const W = doc.internal.pageSize.getWidth();
	doc.setFillColor(...PRIMARY);
	doc.rect(0, 0, W, 24, "F");
	doc.setTextColor(255);
	doc.setFont("helvetica", "bold").setFontSize(16);
	doc.text("ProMetric — Relatório de Avaliação Física", 12, 12);
	doc.setFont("helvetica", "normal").setFontSize(10);
	doc.text(tenantName, 12, 19);
	doc.setTextColor(20);
	doc.setFont("helvetica", "bold").setFontSize(13);
	doc.text(ev.student.full_name, 12, 36);
	doc.setFont("helvetica", "normal").setFontSize(10);
	doc.setTextColor(80);
	const sexLabel = ev.student.sex === "male" ? "Masculino" : "Feminino";
	doc.text(`Sexo: ${sexLabel}  •  Idade: ${ev.age_years ?? "—"} anos  •  Data: ${new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}`, 12, 42);
	autoTable(doc, {
		startY: 50,
		head: [["Antropometria", "Valor"]],
		body: [
			["Peso (kg)", ev.weight_kg ?? "—"],
			["Estatura (cm)", ev.height_cm ?? "—"],
			["Envergadura (cm)", ev.wingspan_cm ?? "—"],
			["Cintura (cm)", ev.waist_cm ?? "—"],
			["Quadril (cm)", ev.hip_cm ?? "—"],
			["IMC", ev.imc ?? "—"],
			["RCE", ev.rce ?? "—"]
		],
		theme: "striped",
		headStyles: {
			fillColor: PRIMARY,
			textColor: 255,
			fontStyle: "bold"
		},
		styles: { fontSize: 9 },
		margin: {
			left: 12,
			right: 12
		}
	});
	autoTable(doc, {
		head: [[
			"Teste ProMetric",
			"Resultado",
			"Classificação"
		]],
		body: Object.entries(TEST_META).filter(([k]) => !["imc", "rce"].includes(k)).map(([k, meta]) => {
			const value = ev[meta.field] ?? "—";
			const z = ev.classifications?.[k] ?? "—";
			return [
				meta.label,
				`${value} ${meta.unit}`,
				z
			];
		}),
		theme: "striped",
		headStyles: {
			fillColor: PRIMARY,
			textColor: 255,
			fontStyle: "bold"
		},
		styles: { fontSize: 9 },
		margin: {
			left: 12,
			right: 12
		}
	});
	const score = overallScore(ev.classifications ?? {});
	const yEnd = doc.lastAutoTable.finalY + 6;
	doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
	if (score.partial) {
		doc.setTextColor(180, 90, 0);
		doc.text(`Avaliação parcial — ${score.filled}/9 testes. Classificação geral indisponível.`, 12, yEnd);
		doc.setTextColor(20);
	} else doc.text(`Perfil geral: ${score.label ?? "—"} (score ${score.score}/6)`, 12, yEnd);
	if (ev.ai_diagnosis) {
		doc.setFont("helvetica", "bold").setFontSize(11);
		doc.text("Diagnóstico (IA)", 12, yEnd + 10);
		doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
		const lines = doc.splitTextToSize(ev.ai_diagnosis, W - 24);
		doc.text(lines, 12, yEnd + 16);
	}
	if (ev.notes) {
		const y2 = doc.lastAutoTable.finalY + 60;
		doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
		doc.text("Observações", 12, y2);
		doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
		doc.text(doc.splitTextToSize(ev.notes, W - 24), 12, y2 + 6);
	}
	const PH = doc.internal.pageSize.getHeight();
	doc.setFontSize(8).setTextColor(140);
	doc.text(`Gerado por ProMetric em ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")} • Classificações com base em Método ProMetric® (referenciais).`, 12, PH - 12);
	doc.text("Consulte a Central de Conhecimento em ProMetric → Central de Conhecimento para entender cálculos e classificações.", 12, PH - 7);
	doc.save(`avaliacao-${ev.student.full_name.replace(/\s+/g, "_")}-${ev.evaluated_at}.pdf`);
}
function generateInstitutionalPDF(data) {
	const doc = new E({
		unit: "mm",
		format: "a4"
	});
	const W = doc.internal.pageSize.getWidth();
	const PH = doc.internal.pageSize.getHeight();
	doc.setFillColor(...PRIMARY);
	doc.rect(0, 0, W, PH, "F");
	doc.setTextColor(255);
	doc.setFont("helvetica", "bold").setFontSize(28);
	doc.text("Relatório Institucional", 16, 60);
	doc.setFontSize(20);
	doc.text(data.school.name, 16, 75);
	doc.setFont("helvetica", "normal").setFontSize(12);
	if (data.school.network) doc.text(`Rede: ${data.school.network}`, 16, 88);
	const loc = [data.school.city, data.school.state].filter(Boolean).join(" / ");
	if (loc) doc.text(loc, 16, 96);
	doc.setFontSize(10);
	doc.text(`Gerado por ProMetric — ${data.tenantName}`, 16, PH - 24);
	doc.text((/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR"), 16, PH - 16);
	doc.addPage();
	doc.setFillColor(...PRIMARY);
	doc.rect(0, 0, W, 18, "F");
	doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
	doc.text("Indicadores Agregados", 12, 12);
	doc.setTextColor(20);
	autoTable(doc, {
		startY: 28,
		head: [["Indicador", "Valor"]],
		body: [
			["Total de alunos ativos", String(data.totalStudents)],
			["Total de avaliações", String(data.totalEvaluations)],
			["Turmas", String(data.totalClasses)],
			["Alunos masculinos", String(data.sex.male)],
			["Alunos femininos", String(data.sex.female)]
		],
		theme: "striped",
		headStyles: {
			fillColor: PRIMARY,
			textColor: 255,
			fontStyle: "bold"
		},
		styles: { fontSize: 10 },
		margin: {
			left: 12,
			right: 12
		}
	});
	autoTable(doc, {
		head: [["Classificação ProMetric", "Total"]],
		body: ZONES.map((z) => [z, String(data.zoneCounts[z] ?? 0)]),
		theme: "striped",
		headStyles: {
			fillColor: PRIMARY,
			textColor: 255,
			fontStyle: "bold"
		},
		styles: { fontSize: 10 },
		margin: {
			left: 12,
			right: 12
		}
	});
	doc.addPage();
	doc.setFillColor(...PRIMARY);
	doc.rect(0, 0, W, 18, "F");
	doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
	doc.text("Comparativo entre Turmas", 12, 12);
	autoTable(doc, {
		startY: 28,
		head: [[
			"Turma",
			"Alunos avaliados",
			"% Saudável",
			"% Em atenção"
		]],
		body: data.classBreakdown.length ? data.classBreakdown.map((c) => [
			c.name,
			String(c.total),
			`${c.healthyPct}%`,
			`${c.riskPct}%`
		]) : [[
			"—",
			"—",
			"—",
			"—"
		]],
		theme: "striped",
		headStyles: {
			fillColor: PRIMARY,
			textColor: 255,
			fontStyle: "bold"
		},
		styles: { fontSize: 9 },
		margin: {
			left: 12,
			right: 12
		}
	});
	if (data.atRisk.length) {
		doc.addPage();
		doc.setFillColor(...PRIMARY);
		doc.rect(0, 0, W, 18, "F");
		doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
		doc.text("Alunos em Atenção", 12, 12);
		autoTable(doc, {
			startY: 28,
			head: [[
				"Aluno",
				"Turma",
				"Indicadores em atenção"
			]],
			body: data.atRisk.map((r) => [
				r.name,
				r.class,
				r.issues
			]),
			theme: "striped",
			headStyles: {
				fillColor: PRIMARY,
				textColor: 255,
				fontStyle: "bold"
			},
			styles: {
				fontSize: 8,
				cellPadding: 2
			},
			margin: {
				left: 12,
				right: 12
			}
		});
	}
	const total = doc.getNumberOfPages();
	for (let i = 2; i <= total; i++) {
		doc.setPage(i);
		doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(140);
		doc.text(`ProMetric • ${data.tenantName} • Página ${i}/${total}`, 12, PH - 12);
		doc.text("Consulte a Central de Conhecimento para entender cálculos e classificações.", 12, PH - 7);
	}
	doc.save(`relatorio-institucional-${data.school.name.replace(/\s+/g, "_")}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`);
}
//#endregion
export { generateInstitutionalPDF as n, generateEvaluationPDF as t };
