import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { at as FileText, r as Users, vt as ClipboardList } from "../_libs/lucide-react.mjs";
import { a as prometricIndex, n as PM_DIMENSIONS, o as scoreToCategory, r as categoryColor, t as PM_CATEGORIES } from "./prometric-method-BGZfQ42Z.mjs";
import { a as PR_SITUATIONS, l as situationStyle, o as REFERENCE_LABEL, s as scoreToSituation } from "./prometric-reference-G7AL_tS3.mjs";
import { _ as ResponsiveContainer, d as Radar, h as PolarGrid, m as PolarRadiusAxis, p as PolarAngleAxis, t as RadarChart, v as Tooltip, y as Legend } from "../_libs/recharts+[...].mjs";
import { t as E } from "../_libs/jspdf.mjs";
import { t as autoTable } from "../_libs/jspdf-autotable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/no-data-state-Nu9z__6h.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Distribuição de alunos por situação Referência ProMetric®.
* Reutilizável em dashboards de Turma, Grupo e Escola.
*/
function SituationDistribution({ classifications, title = `Distribuição vs ${REFERENCE_LABEL}`, className, compact = false }) {
	const counts = {
		"Muito abaixo": 0,
		"Abaixo": 0,
		"Dentro do esperado": 0,
		"Acima do esperado": 0,
		"Muito acima do esperado": 0
	};
	let total = 0;
	for (const c of classifications) {
		const pm = prometricIndex(c);
		const s = scoreToSituation(pm.score, pm.partial);
		if (!s) continue;
		counts[s] += 1;
		total += 1;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border border-border bg-gradient-card p-5 shadow-soft", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[10px] text-muted-foreground",
				children: [
					total,
					" aluno",
					total === 1 ? "" : "s",
					" classificado",
					total === 1 ? "" : "s"
				]
			})]
		}), total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Sem dados suficientes para classificação."
		}) : compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-5 gap-2",
			children: PR_SITUATIONS.map((s) => {
				const c = counts[s];
				const style = situationStyle(s);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("rounded-lg border p-2 text-center", style.className),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-lg font-bold tabular-nums",
						children: c
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] leading-tight",
						children: style.short
					})]
				}, s);
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: PR_SITUATIONS.map((s) => {
				const c = counts[s];
				const pct = total ? c / total * 100 : 0;
				const style = situationStyle(s);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("w-44 rounded-full border px-2 py-0.5 text-center text-[10px] font-medium", style.className),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "mr-1",
								children: style.icon
							}), s]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 flex-1 overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full",
								style: {
									width: `${pct}%`,
									backgroundColor: "currentColor"
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "w-20 text-right tabular-nums text-muted-foreground",
							children: [
								c,
								" (",
								pct.toFixed(0),
								"%)"
							]
						})
					]
				}, s);
			})
		})]
	});
}
var CATEGORY_COLOR = {
	"Prioritário": "#ef4444",
	"Atenção": "#f59e0b",
	"Em Desenvolvimento": "#a855f7",
	"Bom": "#6366f1",
	"Excelente": "#22c55e"
};
function aggregateCohort(studentsLatest, studentsFirst) {
	const firstMap = new Map(studentsFirst.map((f) => [f.student_id, f]));
	const students = studentsLatest.map((s) => {
		const idx = prometricIndex(s.classifications ?? {});
		const first = firstMap.get(s.student_id);
		let evolution = null;
		if (first && first.classifications && first.evaluated_at !== s.evaluated_at) {
			const baseIdx = prometricIndex(first.classifications);
			evolution = idx.score - baseIdx.score;
		}
		return {
			student_id: s.student_id,
			full_name: s.full_name,
			score: idx.score,
			category: idx.category,
			evolution
		};
	});
	const evaluatedCount = students.length;
	const avgScore = evaluatedCount ? Math.round(students.reduce((a, s) => a + s.score, 0) / evaluatedCount) : 0;
	const avgCategory = evaluatedCount ? scoreToCategory(avgScore) : null;
	const distCounts = {
		"Prioritário": 0,
		"Atenção": 0,
		"Em Desenvolvimento": 0,
		"Bom": 0,
		"Excelente": 0
	};
	for (const s of students) if (s.category) distCounts[s.category]++;
	const distribution = PM_CATEGORIES.map((cat) => ({
		category: cat,
		count: distCounts[cat],
		pct: evaluatedCount ? Math.round(distCounts[cat] / evaluatedCount * 100) : 0,
		color: CATEGORY_COLOR[cat]
	}));
	const dimSums = {};
	PM_DIMENSIONS.forEach((d) => dimSums[d] = {
		sum: 0,
		n: 0
	});
	for (const s of studentsLatest) {
		const idx = prometricIndex(s.classifications ?? {});
		for (const d of idx.dimensions) if (d.category) {
			dimSums[d.dimension].sum += d.score;
			dimSums[d.dimension].n++;
		}
	}
	const dimensions = PM_DIMENSIONS.map((d) => ({
		dimension: d,
		score: dimSums[d].n ? Math.round(dimSums[d].sum / dimSums[d].n) : 0
	}));
	const atRisk = students.filter((s) => s.category === "Prioritário" || s.category === "Atenção").sort((a, b) => a.score - b.score);
	const topGains = students.filter((s) => s.evolution != null).sort((a, b) => (b.evolution ?? 0) - (a.evolution ?? 0)).slice(0, 10);
	return {
		studentCount: studentsLatest.length,
		evaluatedCount,
		avgScore,
		avgCategory,
		distribution,
		dimensions,
		students: students.sort((a, b) => b.score - a.score),
		atRisk,
		topGains
	};
}
function peerDimensions(classificationsArr) {
	const dimSums = {};
	PM_DIMENSIONS.forEach((d) => dimSums[d] = {
		sum: 0,
		n: 0
	});
	for (const c of classificationsArr) {
		if (!c) continue;
		const idx = prometricIndex(c);
		for (const d of idx.dimensions) if (d.category) {
			dimSums[d.dimension].sum += d.score;
			dimSums[d.dimension].n++;
		}
	}
	return PM_DIMENSIONS.map((d) => ({
		dimension: d,
		score: dimSums[d].n ? Math.round(dimSums[d].sum / dimSums[d].n) : 0
	}));
}
function topByIndicator(students, field, higherBetter, limit = 10) {
	const rows = students.map((s) => ({
		student_id: s.student_id,
		full_name: s.full_name,
		value: Number(s[field])
	})).filter((r) => Number.isFinite(r.value));
	rows.sort((a, b) => higherBetter ? b.value - a.value : a.value - b.value);
	return rows.slice(0, limit);
}
var toneClass = {
	default: "text-foreground",
	success: "text-success",
	warning: "text-warning",
	destructive: "text-destructive",
	primary: "text-primary"
};
function SummaryKPIs({ items, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className),
		children: items.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-wider text-muted-foreground",
					children: k.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("mt-1 font-display text-2xl font-bold tabular-nums", toneClass[k.tone ?? "default"]),
					children: k.value
				}),
				k.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 text-[11px] text-muted-foreground",
					children: k.hint
				})
			]
		}, k.label))
	});
}
function DistributionChart({ rows, className }) {
	const total = rows.reduce((a, r) => a + r.count, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-3 overflow-hidden rounded-full bg-muted",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				title: `${r.category}: ${r.count} (${r.pct}%)`,
				style: {
					width: `${r.pct}%`,
					background: r.color
				}
			}, r.category))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-2.5 w-2.5 rounded-full",
							style: { background: r.color }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium",
							children: r.category
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-lg font-bold tabular-nums",
						children: r.count
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] text-muted-foreground",
						children: [
							r.pct,
							"% de ",
							total
						]
					})
				]
			}, r.category))
		})]
	});
}
function AggregateRadar({ series, height = 300 }) {
	if (!series.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
			data: series[0].data.map((d) => d.dimension).map((dim) => {
				const row = { dimension: dim };
				for (const s of series) {
					const found = s.data.find((d) => d.dimension === dim);
					row[s.name] = found?.score ?? 0;
				}
				return row;
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "hsl(var(--border))" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
					dataKey: "dimension",
					tick: {
						fill: "hsl(var(--muted-foreground))",
						fontSize: 11
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
					domain: [0, 100],
					tick: { fontSize: 10 },
					stroke: "hsl(var(--muted-foreground))"
				}),
				series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
					name: s.name,
					dataKey: s.name,
					stroke: s.color,
					fill: s.color,
					fillOpacity: .25
				}, s.name)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "hsl(var(--popover))",
					border: "1px solid hsl(var(--border))"
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {})
			]
		})
	});
}
function RankingTable({ title, rows, valueLabel, emptyText = "Sem dados suficientes", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border border-border bg-card p-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-sm font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] uppercase tracking-wider text-muted-foreground",
				children: valueLabel
			})]
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-6 text-center text-xs text-muted-foreground",
			children: emptyText
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "space-y-1.5",
			children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold", i === 0 ? "bg-warning/20 text-warning" : i === 1 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-accent/20 text-accent-foreground" : "bg-muted/50 text-muted-foreground"),
						children: i + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/students/$id",
						params: { id: r.student_id },
						className: "min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline",
						children: r.full_name
					}),
					r.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", r.badgeClass),
						children: r.badge
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-sm font-semibold tabular-nums",
						children: [typeof r.value === "number" ? r.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : r.value, r.unit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-0.5 text-[10px] text-muted-foreground",
							children: r.unit
						})]
					})
				]
			}, r.student_id))
		})]
	});
}
function RiskMap({ students, className }) {
	if (!students.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Nenhum aluno em atenção."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("space-y-1.5", className),
		children: students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/students/$id",
			params: { id: s.student_id },
			className: "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 hover:border-primary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate text-sm font-medium",
					children: s.full_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-muted-foreground",
					children: [
						"Índice ",
						s.score,
						"/100"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("rounded border px-2 py-0.5 text-[10px] font-semibold", categoryColor(s.category)),
				children: s.category ?? "—"
			})]
		}, s.student_id))
	});
}
var DEFAULT_PRIMARY = [
	37,
	99,
	235
];
function generateCohortPDF(input) {
	const doc = new E({
		unit: "mm",
		format: "a4"
	});
	const W = doc.internal.pageSize.getWidth();
	const PH = doc.internal.pageSize.getHeight();
	const PRIMARY = input.branding?.primaryColor ?? DEFAULT_PRIMARY;
	const logo = input.branding?.logoDataUrl ?? null;
	const brandName = input.branding?.displayName ?? input.tenantName;
	doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
	doc.rect(0, 0, W, PH, "F");
	if (logo) try {
		doc.addImage(logo, "PNG", 16, 18, 28, 28);
	} catch {}
	doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(28);
	doc.text(`Relatório de ${input.kind}`, 16, 60);
	doc.setFontSize(20);
	doc.text(input.cohortName, 16, 75);
	if (input.subtitle) {
		doc.setFont("helvetica", "normal").setFontSize(12);
		doc.text(input.subtitle, 16, 86);
	}
	doc.setFont("helvetica", "normal").setFontSize(11);
	doc.text(`Índice médio ProMetric: ${input.agg.avgScore}/100`, 16, 110);
	doc.text(`Classificação média: ${input.agg.avgCategory ?? "—"}`, 16, 118);
	doc.text(`Alunos avaliados: ${input.agg.evaluatedCount}`, 16, 126);
	doc.setFontSize(9);
	doc.text(`Gerado por ProMetric — ${brandName}`, 16, PH - 24);
	doc.text((/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR"), 16, PH - 16);
	doc.addPage();
	doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 18, "F");
	doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
	doc.text("Distribuição dos Perfis", 12, 12);
	doc.setTextColor(20);
	autoTable(doc, {
		startY: 28,
		head: [[
			"Categoria",
			"Alunos",
			"%"
		]],
		body: input.agg.distribution.map((d) => [
			d.category,
			String(d.count),
			`${d.pct}%`
		]),
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
		head: [["Dimensão", "Score médio (0-100)"]],
		body: input.agg.dimensions.map((d) => [d.dimension, String(d.score)]),
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
	for (const r of input.rankings) {
		doc.addPage();
		doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 18, "F");
		doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
		doc.text(r.title, 12, 12);
		doc.setTextColor(20);
		autoTable(doc, {
			startY: 28,
			head: [[
				"#",
				"Aluno",
				"Valor"
			]],
			body: r.rows.length ? r.rows.map((row, i) => [
				String(i + 1),
				row.full_name,
				`${row.value}${row.unit ? " " + row.unit : ""}`
			]) : [[
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
	}
	if (input.agg.atRisk.length) {
		doc.addPage();
		doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 18, "F");
		doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
		doc.text("Alunos em Atenção", 12, 12);
		doc.setTextColor(20);
		autoTable(doc, {
			startY: 28,
			head: [[
				"Aluno",
				"Índice",
				"Categoria"
			]],
			body: input.agg.atRisk.map((s) => [
				s.full_name,
				String(s.score),
				s.category ?? "—"
			]),
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
	}
	const total = doc.getNumberOfPages();
	for (let i = 2; i <= total; i++) {
		doc.setPage(i);
		doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(140);
		doc.text(`ProMetric • ${input.tenantName} • ${input.cohortName} • Página ${i}/${total}`, 12, PH - 10);
	}
	const safe = input.cohortName.replace(/\s+/g, "_");
	doc.save(`relatorio-${input.kind.toLowerCase()}-${safe}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`);
}
var iconMap = {
	eval: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "mr-1.5 h-4 w-4" }),
	students: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-1.5 h-4 w-4" }),
	report: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1.5 h-4 w-4" })
};
/**
* Empty-state block for dashboards when there is no data to analyze.
* Shows a clear message + actionable CTAs (eval / add students).
*/
function NoDataState({ title, description, ctas = [] }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-1.5 max-w-md text-sm text-muted-foreground",
				children: description
			}),
			ctas.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap justify-center gap-2",
				children: ctas.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: i === 0 ? "default" : "outline",
					size: "sm",
					className: i === 0 ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" : "",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: c.to,
						params: c.params,
						children: [c.icon && iconMap[c.icon], c.label]
					})
				}, i))
			})
		]
	});
}
//#endregion
export { RiskMap as a, aggregateCohort as c, topByIndicator as d, RankingTable as i, generateCohortPDF as l, DistributionChart as n, SituationDistribution as o, NoDataState as r, SummaryKPIs as s, AggregateRadar as t, peerDimensions as u };
