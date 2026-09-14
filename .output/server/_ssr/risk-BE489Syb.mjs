import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as Search, et as HeartPulse, ft as Download, u as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { l as zoneColor, t as TEST_META } from "./proesp-DU2T_E5l.mjs";
import { _ as ResponsiveContainer, a as YAxis, c as CartesianGrid, o as XAxis, r as BarChart, u as Bar, v as Tooltip } from "../_libs/recharts+[...].mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { i as writeFileSync, r as utils } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/risk-BE489Syb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RISK_ZONES = ["Muito Fraco", "Fraco"];
var INDICATORS = [
	{
		key: "imc",
		label: "IMC"
	},
	{
		key: "rce",
		label: "RCE"
	},
	{
		key: "run6",
		label: "Cardio (6min)"
	},
	{
		key: "flex",
		label: "Flexibilidade"
	},
	{
		key: "abdo",
		label: "Resistência (abdo)"
	},
	{
		key: "jump",
		label: "Salto"
	},
	{
		key: "mball",
		label: "Medicine Ball"
	},
	{
		key: "square",
		label: "Agilidade"
	},
	{
		key: "sprint",
		label: "Velocidade"
	}
];
function RiskPage() {
	const { tenantId } = useCurrentTenant();
	const [filters, setFilters] = (0, import_react.useState)({});
	const [search, setSearch] = (0, import_react.useState)("");
	const data = useQuery({
		queryKey: ["risk-evals", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("id,evaluated_at,student_id,classifications,student:students(full_name,class:classes(name))").eq("tenant_id", tenantId).order("evaluated_at", { ascending: false });
			if (error) throw error;
			const seen = /* @__PURE__ */ new Set();
			const latest = [];
			for (const e of data) {
				if (seen.has(e.student_id)) continue;
				seen.add(e.student_id);
				latest.push(e);
			}
			return latest;
		},
		staleTime: 6e4
	});
	const activeFilters = (0, import_react.useMemo)(() => Object.keys(filters).filter((k) => filters[k]), [filters]);
	const atRisk = (0, import_react.useMemo)(() => {
		return (data.data ?? []).filter((e) => {
			const c = e.classifications ?? {};
			if (!(activeFilters.length ? activeFilters.some((k) => c[k] && RISK_ZONES.includes(c[k])) : Object.values(c).some((z) => z && RISK_ZONES.includes(z)))) return false;
			if (search && !e.student?.full_name.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		});
	}, [
		data.data,
		activeFilters,
		search
	]);
	const total = data.data?.length ?? 0;
	const riskPct = total ? Math.round(atRisk.length / total * 100) : 0;
	const byClass = (0, import_react.useMemo)(() => {
		const map = {};
		for (const e of data.data ?? []) {
			const cn = e.student?.class?.name ?? "Sem turma";
			map[cn] ??= {
				total: 0,
				risk: 0
			};
			map[cn].total++;
			if (atRisk.find((a) => a.id === e.id)) map[cn].risk++;
		}
		return Object.entries(map).map(([name, v]) => ({
			name,
			"Em atenção": v.risk,
			Total: v.total
		})).sort((a, b) => b["Em atenção"] - a["Em atenção"]).slice(0, 10);
	}, [data.data, atRisk]);
	const exportData = () => {
		const rows = atRisk.map((e) => {
			const c = e.classifications ?? {};
			const issues = INDICATORS.filter((i) => c[i.key] && RISK_ZONES.includes(c[i.key])).map((i) => `${i.label} (${c[i.key]})`).join("; ");
			return {
				Aluno: e.student?.full_name ?? "",
				Turma: e.student?.class?.name ?? "",
				"Indicadores em atenção": issues,
				"Última avaliação": new Date(e.evaluated_at).toLocaleDateString("pt-BR")
			};
		});
		const wb = utils.book_new();
		utils.book_append_sheet(wb, utils.json_to_sheet(rows), "Risco");
		writeFileSync(wb, `alunos-em-risco-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`);
	};
	const exportCSV = () => {
		const csv = "Aluno;Turma;Indicadores;Última\n" + atRisk.map((e) => {
			const c = e.classifications ?? {};
			const issues = INDICATORS.filter((i) => c[i.key] && RISK_ZONES.includes(c[i.key])).map((i) => `${i.label}:${c[i.key]}`).join("|");
			return [
				e.student?.full_name ?? "",
				e.student?.class?.name ?? "",
				issues,
				new Date(e.evaluated_at).toLocaleDateString("pt-BR")
			];
		}).map((r) => r.join(";")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `risco-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		a.click();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Saúde e Risco",
				description: "Alunos com indicadores em zona Fraca ou Muito Fraca, com filtros, comparativos por turma e exportação.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: exportCSV,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), " CSV"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: exportData,
						className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-3.5 w-3.5" }), " Excel"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-4 w-4 text-primary" }),
						label: "Alunos avaliados",
						value: total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-warning" }),
						label: "Em atenção",
						value: atRisk.length,
						accent: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "% em atenção",
						value: `${riskPct}%`,
						accent: riskPct > 30 ? "destructive" : "primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Filtros ativos",
						value: activeFilters.length || "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 text-xs font-medium text-muted-foreground",
					children: "Filtros (combinar indicadores)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: INDICATORS.map((i) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setFilters((p) => ({
								...p,
								[i.key]: !p[i.key]
							})),
							className: cn("rounded-full border px-3 py-1 text-xs transition", !!filters[i.key] ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"),
							children: i.label
						}, i.key);
					})
				})]
			}),
			byClass.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-sm font-semibold",
					children: "Distribuição de risco por turma"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: byClass,
						margin: {
							top: 8,
							right: 16,
							left: -10,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: "hsl(var(--border))"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "name",
								stroke: "hsl(var(--muted-foreground))",
								fontSize: 11
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "hsl(var(--muted-foreground))",
								fontSize: 11
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								background: "hsl(var(--popover))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "Em atenção",
								fill: "hsl(var(--destructive))",
								radius: [
									6,
									6,
									0,
									0
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "Total",
								fill: "hsl(var(--primary))",
								radius: [
									6,
									6,
									0,
									0
								],
								opacity: .3
							})
						]
					}) })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Buscar aluno"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-8",
							placeholder: "Nome do aluno…"
						})]
					})]
				}), data.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground",
					children: "Carregando…"
				}) : !atRisk.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Nenhum aluno em atenção",
					description: "Com os filtros atuais, todos os alunos estão fora da zona Fraco/Muito Fraco."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 md:hidden",
					children: atRisk.map((e) => {
						const c = e.classifications ?? {};
						const issues = INDICATORS.filter((i) => c[i.key] && RISK_ZONES.includes(c[i.key]));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/students/$id",
										params: { id: e.student_id },
										className: "truncate font-medium text-foreground hover:text-primary",
										children: e.student?.full_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: new Date(e.evaluated_at).toLocaleDateString("pt-BR")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: e.student?.class?.name ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1",
									children: issues.map((i) => {
										const z = c[i.key];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(z)),
											children: [
												TEST_META[i.key]?.label?.split(" ")[0] ?? i.label,
												" • ",
												z
											]
										}, i.key);
									})
								})
							]
						}, e.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden overflow-x-auto rounded-2xl border border-border md:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[600px] text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/40 text-xs uppercase text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-medium",
									children: "Aluno"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-medium",
									children: "Turma"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-medium",
									children: "Indicadores em atenção"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-medium",
									children: "Última avaliação"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border bg-card",
							children: atRisk.map((e) => {
								const c = e.classifications ?? {};
								const issues = INDICATORS.filter((i) => c[i.key] && RISK_ZONES.includes(c[i.key]));
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/students/$id",
											params: { id: e.student_id },
											className: "font-medium text-foreground hover:text-primary",
											children: e.student?.full_name
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: e.student?.class?.name ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1",
											children: issues.map((i) => {
												const z = c[i.key];
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: cn("rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(z)),
													children: [
														TEST_META[i.key]?.label?.split(" ")[0] ?? i.label,
														" • ",
														z
													]
												}, i.key);
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-xs text-muted-foreground",
										children: new Date(e.evaluated_at).toLocaleDateString("pt-BR")
									})
								] }, e.id);
							})
						})]
					})
				})] })]
			})
		]
	});
}
function Kpi({ icon, label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground",
			children: [
				icon,
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-1 font-display text-2xl font-bold", accent === "warning" && "text-warning", accent === "destructive" && "text-destructive", accent === "primary" && "text-primary"),
			children: value
		})]
	});
}
//#endregion
export { RiskPage as component };
