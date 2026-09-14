import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as Printer, P as Plus, ft as Download, nt as GraduationCap, r as Users, st as FileDown, t as Zap, vt as ClipboardList, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { r as categoryColor } from "./prometric-method-BGZfQ42Z.mjs";
import { a as RiskMap, c as aggregateCohort, d as topByIndicator, i as RankingTable, l as generateCohortPDF, n as DistributionChart, o as SituationDistribution, r as NoDataState, s as SummaryKPIs, t as AggregateRadar, u as peerDimensions } from "./no-data-state-Nu9z__6h.mjs";
import { t as Route } from "./classes._id.dashboard-Dtf81CHy.mjs";
import { t as printSheetsBatch } from "./print-batch-DI_e7iaY.mjs";
import { t as ActionBar } from "./action-bar-DMY53NvK.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { t as Breadcrumbs } from "./breadcrumbs-0lX5b4_0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classes._id.dashboard-DrPUh3xr.js
var import_jsx_runtime = require_jsx_runtime();
function ClassDashboard() {
	const { id } = Route.useParams();
	const { tenant } = useCurrentTenant();
	const q = useQuery({
		queryKey: ["class-stats", id],
		staleTime: 300 * 1e3,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("class_stats", { _class: id });
			if (error) throw error;
			return data;
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm text-muted-foreground",
		children: "Carregando dashboard…"
	});
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm",
		children: "Turma não encontrada."
	});
	const { header, students_latest, students_first, school_latest } = q.data;
	const agg = aggregateCohort(students_latest, students_first);
	const schoolDims = peerDimensions(school_latest);
	const last = header.last_evaluation_at ? new Date(header.last_evaluation_at).toLocaleDateString("pt-BR") : "—";
	const handlePDF = () => {
		generateCohortPDF({
			kind: "Turma",
			tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
			cohortName: header.name,
			subtitle: [header.grade, header.school_name].filter(Boolean).join(" • ") || void 0,
			agg,
			rankings: [
				{
					title: "Top 10 — Índice ProMetric",
					rows: agg.students.slice(0, 10).map((s) => ({
						full_name: s.full_name,
						value: s.score,
						unit: "/100"
					}))
				},
				{
					title: "Top 10 — Maior Evolução",
					rows: agg.topGains.map((s) => ({
						full_name: s.full_name,
						value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`,
						unit: "pts"
					}))
				},
				{
					title: "Top 10 — Velocidade 20m",
					rows: topByIndicator(students_latest, "sprint_20m_s", false).map((r) => ({
						full_name: r.full_name,
						value: r.value.toFixed(2),
						unit: "s"
					}))
				},
				{
					title: "Top 10 — Potência (Salto)",
					rows: topByIndicator(students_latest, "horizontal_jump_cm", true).map((r) => ({
						full_name: r.full_name,
						value: r.value.toFixed(0),
						unit: "cm"
					}))
				},
				{
					title: "Top 10 — Resistência (6min)",
					rows: topByIndicator(students_latest, "run_6min_m", true).map((r) => ({
						full_name: r.full_name,
						value: r.value.toFixed(0),
						unit: "m"
					}))
				}
			]
		});
	};
	const exportCSV = () => {
		const csv = [[
			"Aluno",
			"Score",
			"Categoria",
			"Evolução"
		], ...agg.students.map((s) => [
			s.full_name,
			String(s.score),
			s.category ?? "",
			String(s.evolution ?? "")
		])].map((r) => r.map((v) => `"${(v ?? "").replace(/"/g, "\"\"")}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `turma-${header.name}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
	const handlePrintSheets = () => printSheetsBatch(students_latest.map((s) => s.student_id).filter(Boolean), header.name);
	const actions = [
		{
			label: "Nova Avaliação em Lote",
			icon: Zap,
			primary: true,
			to: "/quick-eval",
			search: { class: id }
		},
		{
			label: "Adicionar Alunos",
			icon: Plus,
			to: "/students"
		},
		{
			label: "Visualizar Alunos",
			icon: Users,
			to: "/classes/$id",
			params: { id }
		},
		{
			label: "Imprimir Fichas da Turma",
			icon: Printer,
			onClick: handlePrintSheets
		},
		{
			label: "Relatório PDF",
			icon: FileDown,
			onClick: handlePDF
		},
		{
			label: "Exportar CSV",
			icon: Download,
			onClick: exportCSV
		},
		{
			label: "Avaliações da Turma",
			icon: ClipboardList,
			to: "/evaluations"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { items: [
				{
					label: "Turmas",
					to: "/classes"
				},
				...header.school_name ? [{ label: header.school_name }] : [],
				{
					label: header.name,
					to: "/classes/$id",
					params: { id }
				},
				{ label: "Resumo" }
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						asChild: true,
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/classes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate font-display text-xl font-bold sm:text-2xl",
								children: header.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								header.grade,
								header.school_name,
								last && `Última avaliação: ${last}`
							].filter(Boolean).join(" • ")
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBar, { actions })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryKPIs, { items: [
				{
					label: "Alunos",
					value: header.students_count,
					hint: `${agg.evaluatedCount} avaliados`
				},
				{
					label: "Avaliações",
					value: header.evaluations_count
				},
				{
					label: "Índice médio",
					value: `${agg.avgScore}/100`,
					tone: "primary"
				},
				{
					label: "Classificação",
					value: agg.avgCategory ?? "—",
					tone: agg.avgCategory === "Excelente" ? "success" : agg.avgCategory === "Prioritário" ? "destructive" : "default"
				}
			] }),
			agg.evaluatedCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoDataState, {
				title: "Esta turma ainda não possui alunos avaliados",
				description: "Realize a primeira avaliação para gerar indicadores, rankings e o relatório institucional desta turma.",
				ctas: [{
					label: "Realizar avaliação",
					to: "/quick-eval",
					icon: "eval"
				}, {
					label: "Ver alunos",
					to: "/students",
					icon: "students"
				}]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "overview",
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "overview",
							children: "Visão Geral"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "rankings",
							children: "Rankings"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "attention",
							children: "Atenção"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SituationDistribution, {
								classifications: students_latest.map((s) => s.classifications ?? {}),
								title: "Distribuição da turma vs Referência ProMetric®"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 lg:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-border bg-card p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mb-3 font-display text-sm font-semibold",
										children: "Radar — Turma vs Escola"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AggregateRadar, { series: [{
										name: "Turma",
										data: agg.dimensions,
										color: "hsl(217 91% 60%)"
									}, {
										name: "Escola",
										data: schoolDims,
										color: "hsl(280 70% 60%)"
									}] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-border bg-card p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mb-3 font-display text-sm font-semibold",
										children: "Distribuição de perfis"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionChart, { rows: agg.distribution })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-sm font-semibold",
											children: "Alunos da turma"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												"(",
												agg.evaluatedCount,
												")"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
									children: agg.students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/students/$id",
										params: { id: s.student_id },
										className: "flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 hover:border-primary",
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
											className: cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", categoryColor(s.category)),
											children: s.category ?? "—"
										})]
									}, s.student_id))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "rankings",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 lg:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Índice ProMetric",
									valueLabel: "Score",
									rows: agg.students.slice(0, 10).map((s) => ({
										student_id: s.student_id,
										full_name: s.full_name,
										value: s.score,
										unit: "/100",
										badge: s.category ?? void 0,
										badgeClass: categoryColor(s.category)
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Maior Evolução",
									valueLabel: "Δ pts",
									rows: agg.topGains.map((s) => ({
										student_id: s.student_id,
										full_name: s.full_name,
										value: `${(s.evolution ?? 0) >= 0 ? "+" : ""}${s.evolution}`,
										unit: "pts"
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Velocidade (20m)",
									valueLabel: "Tempo",
									rows: topByIndicator(students_latest, "sprint_20m_s", false).map((r) => ({
										student_id: r.student_id,
										full_name: r.full_name,
										value: r.value.toFixed(2),
										unit: "s"
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Potência (Salto)",
									valueLabel: "cm",
									rows: topByIndicator(students_latest, "horizontal_jump_cm", true).map((r) => ({
										student_id: r.student_id,
										full_name: r.full_name,
										value: r.value.toFixed(0),
										unit: "cm"
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Resistência (6min)",
									valueLabel: "Distância",
									rows: topByIndicator(students_latest, "run_6min_m", true).map((r) => ({
										student_id: r.student_id,
										full_name: r.full_name,
										value: r.value.toFixed(0),
										unit: "m"
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Flexibilidade",
									valueLabel: "cm",
									rows: topByIndicator(students_latest, "sit_and_reach_cm", true).map((r) => ({
										student_id: r.student_id,
										full_name: r.full_name,
										value: r.value.toFixed(0),
										unit: "cm"
									}))
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "attention",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mb-3 font-display text-sm font-semibold",
								children: [
									"Mapa de Risco — ",
									agg.atRisk.length,
									" alunos"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskMap, { students: agg.atRisk })]
						})
					})
				]
			})
		]
	});
}
//#endregion
export { ClassDashboard as component };
