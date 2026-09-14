import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { at as FileText, ft as Download, kt as ChartColumn, ot as FileSpreadsheet } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as overallScore, l as zoneColor, n as ZONES, t as TEST_META } from "./proesp-DU2T_E5l.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader } from "./page-header-BgOgZloR.mjs";
import { t as downloadStudentEvolutionPDF } from "./pdf-evolution-report-Ds1rMNGQ.mjs";
import { i as writeFileSync, r as utils } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-CRsGc-l5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function buildExportRows(evals) {
	return evals.map((e) => {
		const overall = overallScore(e.classifications ?? {});
		const row = {
			Aluno: e.student.full_name,
			Sexo: e.student.sex === "male" ? "M" : "F",
			Idade: e.age_years ?? "",
			Data: new Date(e.evaluated_at).toLocaleDateString("pt-BR"),
			Peso: e.weight_kg ?? "",
			Altura: e.height_cm ?? ""
		};
		for (const [k, m] of Object.entries(TEST_META)) row[m.label] = e.classifications?.[k] ?? "";
		row["Perfil geral"] = overall.label ?? "";
		row["Score"] = overall.score;
		return row;
	});
}
function downloadCSV(filename, rows) {
	if (!rows.length) return;
	const headers = Object.keys(rows[0]);
	const escape = (v) => {
		const s = String(v ?? "");
		return /[",;\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
	};
	const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join("\n");
	const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function downloadXLSX(filename, rows) {
	if (!rows.length) return;
	const ws = utils.json_to_sheet(rows);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "Avaliações");
	writeFileSync(wb, filename);
}
function ReportsPage() {
	const { tenantId, tenant } = useCurrentTenant();
	const [classId, setClassId] = (0, import_react.useState)("all");
	const classes = useQuery({
		queryKey: ["classes-lite", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("classes").select("id,name").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const evals = useQuery({
		queryKey: [
			"evals-report",
			tenantId,
			classId
		],
		enabled: !!tenantId,
		queryFn: async () => {
			let q = supabase.from("evaluations").select("id,evaluated_at,age_years,weight_kg,height_cm,classifications,student:students!inner(full_name,sex,birth_date,class_id)").eq("tenant_id", tenantId);
			if (classId !== "all") q = q.eq("student.class_id", classId);
			const { data, error } = await q.order("evaluated_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const dist = (0, import_react.useMemo)(() => {
		const counts = {
			"Muito Fraco": 0,
			"Fraco": 0,
			"Razoável": 0,
			"Bom": 0,
			"Muito Bom": 0,
			"Excelente": 0
		};
		let total = 0;
		for (const e of evals.data ?? []) for (const z of Object.values(e.classifications ?? {})) if (z) {
			counts[z]++;
			total++;
		}
		return {
			counts,
			total
		};
	}, [evals.data]);
	const avgByTest = (0, import_react.useMemo)(() => {
		return Object.entries(TEST_META).map(([k, m]) => {
			const scores = (evals.data ?? []).map((e) => e.classifications?.[k]).filter(Boolean);
			const idx = scores.length ? scores.reduce((a, z) => a + ZONES.indexOf(z), 0) / scores.length : -1;
			return {
				key: k,
				label: m.label,
				count: scores.length,
				zone: idx >= 0 ? ZONES[Math.round(idx)] : null
			};
		});
	}, [evals.data]);
	async function downloadOne(id) {
		const { data, error } = await supabase.from("evaluations").select("student_id, tenant_id").eq("id", id).single();
		if (error || !data) return;
		const name = tenant?.name ?? "ProMetric";
		await downloadStudentEvolutionPDF(data.student_id, data.tenant_id, name);
	}
	const exportRows = (0, import_react.useMemo)(() => buildExportRows(evals.data ?? []), [evals.data]);
	const suffix = classId === "all" ? "todas-turmas" : (classes.data?.find((c) => c.id === classId)?.name ?? "turma").replace(/\s+/g, "_");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Relatórios",
				description: "Distribuição da turma, médias por teste e exportação em PDF/CSV/Excel."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: classId,
						onValueChange: setClassId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-56",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Todas as turmas"
						}), classes.data?.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.id,
							children: c.name
						}, c.id))] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [evals.data?.length ?? 0, " avaliação(ões)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: !exportRows.length,
							onClick: () => downloadCSV(`prometric-${suffix}.csv`, exportRows),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1 h-3.5 w-3.5" }), " CSV"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: !exportRows.length,
							onClick: () => downloadXLSX(`prometric-${suffix}.xlsx`, exportRows),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "mr-1 h-3.5 w-3.5" }), " Excel"]
						})]
					})
				]
			}),
			!evals.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed border-border bg-gradient-card p-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "Sem dados para gerar relatório."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Comece cadastrando turmas e alunos, depois registre uma avaliação."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/quick-eval",
									children: "Realizar avaliação"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/students",
									children: "Cadastrar aluno"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/classes",
									children: "Cadastrar turma"
								})
							})
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-sm font-semibold",
						children: "Distribuição por zona"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: ZONES.map((z) => {
							const c = dist.counts[z];
							const pct = dist.total ? c / dist.total * 100 : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("w-28 rounded-full border px-2 py-0.5 text-center", zoneColor(z)),
										children: z
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 flex-1 overflow-hidden rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-gradient-brand transition-all",
											style: { width: `${pct}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "w-16 text-right text-muted-foreground",
										children: [
											c,
											" (",
											pct.toFixed(0),
											"%)"
										]
									})
								]
							}, z);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-sm font-semibold",
						children: "Zona média por teste"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
						children: avgByTest.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-lg border border-border bg-card p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-medium",
								children: r.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-muted-foreground",
								children: [r.count, " amostra(s)"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full border px-2 py-0.5 text-[10px]", zoneColor(r.zone)),
								children: r.zone ?? "—"
							})]
						}, r.key))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-sm font-semibold",
						children: "Avaliações individuais"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border",
						children: evals.data.map((e) => {
							const ov = overallScore(e.classifications ?? {});
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-medium",
											children: e.student.full_name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground",
											children: [
												new Date(e.evaluated_at).toLocaleDateString("pt-BR"),
												" • ",
												e.age_years,
												" anos"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-full border px-2 py-0.5 text-[10px]", zoneColor(ov.label)),
										children: ov.label ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => downloadOne(e.id),
										className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), " Gerar Relatório"]
									})
								]
							}, e.id);
						})
					})]
				})
			] })
		]
	});
}
//#endregion
export { ReportsPage as component };
