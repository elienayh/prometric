import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Nt as Building2, R as Palette, d as TrendingUp, ft as Download, i as UsersRound, nt as GraduationCap, o as UserPlus, r as Users, st as FileDown, t as Zap, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { a as prometricIndex, o as scoreToCategory, r as categoryColor } from "./prometric-method-BGZfQ42Z.mjs";
import { a as RiskMap, c as aggregateCohort, d as topByIndicator, i as RankingTable, l as generateCohortPDF, n as DistributionChart, o as SituationDistribution, r as NoDataState, s as SummaryKPIs, t as AggregateRadar, u as peerDimensions } from "./no-data-state-Nu9z__6h.mjs";
import { t as ActionBar } from "./action-bar-DMY53NvK.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { t as Breadcrumbs } from "./breadcrumbs-0lX5b4_0.mjs";
import { a as resolveLogoUrl, i as resolveBrandingChain, n as fetchImageDataUrl, r as hexToRgb } from "./branding-B47KYsR4.mjs";
import { t as BrandingForm } from "./branding-form-DHLCxdw7.mjs";
import { t as Route } from "./schools._id-CTZv5zVS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schools._id-DEFWJScX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rollupRank(rows) {
	return rows.map((r) => {
		const scores = r.classifications.filter(Boolean).map((c) => prometricIndex(c).score);
		const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
		return {
			id: r.id,
			name: r.name,
			meta: r.meta,
			students: r.students,
			score: avg,
			category: scores.length ? scoreToCategory(avg) : null
		};
	}).sort((a, b) => b.score - a.score);
}
function SchoolDashboard() {
	const { id } = Route.useParams();
	const { tenant, tenantId } = useCurrentTenant();
	const [sortClasses, setSortClasses] = (0, import_react.useState)("score");
	const [sortGroups, setSortGroups] = (0, import_react.useState)("score");
	const [logoDataUrl, setLogoDataUrl] = (0, import_react.useState)(null);
	const q = useQuery({
		queryKey: ["school-stats", id],
		staleTime: 300 * 1e3,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("school_stats", { _school: id });
			if (error) throw error;
			return data;
		}
	});
	const schoolEntity = useQuery({
		queryKey: ["school-entity", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("schools").select("id,tenant_id,name,display_name,primary_color,secondary_color,description,logo_url").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const brand = (0, import_react.useMemo)(() => resolveBrandingChain(null, schoolEntity.data ?? null, tenant ?? null), [schoolEntity.data, tenant]);
	(0, import_react.useEffect)(() => {
		let alive = true;
		(async () => {
			const url = await resolveLogoUrl(brand.logoUrl);
			const data = url ? await fetchImageDataUrl(url) : null;
			if (alive) setLogoDataUrl(data);
		})();
		return () => {
			alive = false;
		};
	}, [brand.logoUrl]);
	const agg = (0, import_react.useMemo)(() => q.data ? aggregateCohort(q.data.students_latest, q.data.students_first) : null, [q.data]);
	const allClassifications = (0, import_react.useMemo)(() => q.data ? q.data.students_latest.map((s) => s.classifications) : [], [q.data]);
	const schoolDims = (0, import_react.useMemo)(() => peerDimensions(allClassifications), [allClassifications]);
	const classRank = (0, import_react.useMemo)(() => {
		if (!q.data) return [];
		const rows = rollupRank(q.data.classes.map((c) => ({
			id: c.class_id,
			name: c.class_name,
			meta: c.grade ?? "—",
			students: c.students_count,
			classifications: c.classifications
		})));
		if (sortClasses === "students") rows.sort((a, b) => b.students - a.students);
		if (sortClasses === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
		return rows;
	}, [q.data, sortClasses]);
	const groupRank = (0, import_react.useMemo)(() => {
		if (!q.data) return [];
		const rows = rollupRank(q.data.groups.map((g) => ({
			id: g.group_id,
			name: g.group_name,
			meta: g.color ?? "—",
			students: g.students_count,
			classifications: g.classifications
		})));
		if (sortGroups === "students") rows.sort((a, b) => b.students - a.students);
		if (sortGroups === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
		return rows;
	}, [q.data, sortGroups]);
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm text-muted-foreground",
		children: "Carregando dashboard…"
	});
	if (!q.data || !agg) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm",
		children: "Escola não encontrada."
	});
	const { header, students_latest } = q.data;
	const last = header.last_evaluation_at ? new Date(header.last_evaluation_at).toLocaleDateString("pt-BR") : "—";
	const distCounts = agg.distribution.reduce((acc, d) => {
		acc[d.category] = d.count;
		return acc;
	}, {});
	const handlePDF = () => {
		generateCohortPDF({
			kind: "Escola",
			tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
			cohortName: brand.displayName === "ProMetric" ? header.name : brand.displayName,
			subtitle: [header.network, [header.city, header.state].filter(Boolean).join("/")].filter(Boolean).join(" • ") || void 0,
			agg,
			branding: {
				primaryColor: hexToRgb(brand.primaryColor),
				logoDataUrl,
				displayName: brand.displayName
			},
			rankings: [
				{
					title: "Ranking de Turmas",
					rows: classRank.slice(0, 15).map((r) => ({
						full_name: r.name,
						value: r.score,
						unit: `/100 (${r.students} alunos)`
					}))
				},
				{
					title: "Ranking de Grupos",
					rows: groupRank.slice(0, 15).map((r) => ({
						full_name: r.name,
						value: r.score,
						unit: `/100 (${r.students} integrantes)`
					}))
				},
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
	const accent = brand.primaryColor;
	const exportData = () => {
		const csv = [[
			"Aluno",
			"Score",
			"Categoria"
		], ...agg.students.map((s) => [
			s.full_name,
			String(s.score),
			s.category ?? ""
		])].map((r) => r.map((v) => `"${(v ?? "").replace(/"/g, "\"\"")}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `escola-${header.name}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
	const actions = [
		{
			label: "Relatório Institucional",
			icon: FileDown,
			primary: true,
			onClick: handlePDF
		},
		{
			label: "Nova Turma",
			icon: GraduationCap,
			to: "/classes"
		},
		{
			label: "Novo Grupo",
			icon: UsersRound,
			to: "/groups"
		},
		{
			label: "Cadastrar Aluno",
			icon: UserPlus,
			to: "/students"
		},
		{
			label: "Nova Avaliação",
			icon: Zap,
			to: "/quick-eval",
			search: { school: id }
		},
		{
			label: "Dashboard Executivo",
			icon: TrendingUp,
			to: "/executive"
		},
		{
			label: "Exportar Dados (CSV)",
			icon: Download,
			onClick: exportData
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { items: [{
				label: "Escolas",
				to: "/schools"
			}, { label: brand.displayName === "ProMetric" ? header.name : brand.displayName }] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							asChild: true,
							className: "shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/schools",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
							})
						}),
						logoDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: logoDataUrl,
							alt: brand.displayName,
							className: "h-10 w-10 shrink-0 rounded-lg object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
							style: {
								background: `${accent}22`,
								color: accent
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate font-display text-xl font-bold sm:text-2xl",
								style: { color: accent },
								children: brand.displayName === "ProMetric" ? header.name : brand.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									header.network,
									[header.city, header.state].filter(Boolean).join("/"),
									last && `Última avaliação: ${last}`
								].filter(Boolean).join(" • ")
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBar, { actions })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryKPIs, { items: [
				{
					label: "Turmas",
					value: header.classes_count
				},
				{
					label: "Grupos",
					value: header.groups_count
				},
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
						label: "Saudáveis",
						value: (distCounts["Excelente"] ?? 0) + (distCounts["Bom"] ?? 0),
						tone: "text-emerald-500"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
						label: "Em Desenvolvimento",
						value: distCounts["Em Desenvolvimento"] ?? 0,
						tone: "text-violet-500"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
						label: "Atenção",
						value: distCounts["Atenção"] ?? 0,
						tone: "text-amber-500"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
						label: "Prioritários",
						value: distCounts["Prioritário"] ?? 0,
						tone: "text-red-500"
					})
				]
			}),
			agg.evaluatedCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoDataState, {
				title: "Esta escola ainda não possui dados para comparação",
				description: "Cadastre turmas, vincule alunos e realize avaliações para gerar o dashboard institucional.",
				ctas: [{
					label: "Realizar avaliação",
					to: "/quick-eval",
					icon: "eval"
				}, {
					label: "Cadastrar turmas",
					to: "/classes",
					icon: "students"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "overview",
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "overview",
							children: "Visão Geral"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "classes",
							children: "Turmas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "groups",
							children: "Grupos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "attention",
							children: "Atenção"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "branding",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "mr-1 h-3.5 w-3.5" }), " Identidade Visual"]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SituationDistribution, {
							classifications: students_latest.map((s) => s.classifications ?? {}),
							title: "Distribuição da escola vs Referência ProMetric®"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mb-3 font-display text-sm font-semibold",
									children: "Radar Institucional"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AggregateRadar, { series: [{
									name: "Escola",
									data: schoolDims,
									color: "hsl(217 91% 60%)"
								}] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mb-3 font-display text-sm font-semibold",
									children: "Distribuição de perfis"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionChart, { rows: agg.distribution })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "classes",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-sm font-semibold",
											children: "Comparação entre turmas"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												"(",
												classRank.length,
												")"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
											active: sortClasses === "score",
											onClick: () => setSortClasses("score"),
											children: "Índice"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
											active: sortClasses === "students",
											onClick: () => setSortClasses("students"),
											children: "Alunos"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
											active: sortClasses === "name",
											onClick: () => setSortClasses("name"),
											children: "Nome"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankList, {
								rows: classRank,
								to: "/classes/$id"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "groups",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-sm font-semibold",
											children: "Comparação entre grupos"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												"(",
												groupRank.length,
												")"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
											active: sortGroups === "score",
											onClick: () => setSortGroups("score"),
											children: "Índice"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
											active: sortGroups === "students",
											onClick: () => setSortGroups("students"),
											children: "Integrantes"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
											active: sortGroups === "name",
											onClick: () => setSortGroups("name"),
											children: "Nome"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankList, {
								rows: groupRank,
								to: "/groups/$id"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "attention",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "mb-3 font-display text-sm font-semibold",
									children: [
										"Mapa de Risco — ",
										agg.atRisk.length,
										" alunos"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskMap, { students: agg.atRisk })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
								title: "Alunos em atenção",
								valueLabel: "Score",
								rows: agg.atRisk.slice(0, 20).map((s) => ({
									student_id: s.student_id,
									full_name: s.full_name,
									value: s.score,
									unit: "/100",
									badge: s.category ?? void 0,
									badgeClass: categoryColor(s.category)
								}))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "branding",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingForm, {
							entity: schoolEntity.data ?? null,
							scope: "school",
							table: "schools",
							storageFolder: `${tenantId ?? "t"}/schools/${id}`,
							invalidateKeys: [["school-entity", id], ["school-stats", id]],
							hint: "Identidade visual desta escola. Caso vazia, herda automaticamente do Tenant. Aplicada em dashboards, portal do aluno e PDFs."
						})
					})
				]
			})
		]
	});
}
function KpiTile({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-1 font-display text-2xl font-bold", tone),
			children: value
		})]
	});
}
function SortBtn({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: cn("rounded-md border px-2 py-1", active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"),
		children
	});
}
function RankList({ rows, to }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs text-muted-foreground",
		children: "Sem dados ainda."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-lg border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-muted/40 text-xs uppercase text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-left",
						children: "#"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-left",
						children: "Nome"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-right",
						children: "Alunos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-right",
						children: "Índice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-right",
						children: "Classificação"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border hover:bg-muted/30",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-muted-foreground",
						children: i + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to,
							params: { id: r.id },
							className: "font-medium hover:text-primary",
							children: r.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground",
							children: r.meta
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-right",
						children: r.students
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-3 py-2 text-right font-semibold",
						children: [r.score, "/100"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", categoryColor(r.category)),
							children: r.category ?? "—"
						})
					})
				]
			}, r.id)) })]
		})
	});
}
//#endregion
export { SchoolDashboard as component };
