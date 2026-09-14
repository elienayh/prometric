import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Share2, N as Printer, P as Plus, R as Palette, i as UsersRound, r as Users, st as FileDown, t as Zap, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { r as categoryColor } from "./prometric-method-BGZfQ42Z.mjs";
import { a as RiskMap, c as aggregateCohort, d as topByIndicator, i as RankingTable, l as generateCohortPDF, n as DistributionChart, o as SituationDistribution, r as NoDataState, s as SummaryKPIs, t as AggregateRadar, u as peerDimensions } from "./no-data-state-Nu9z__6h.mjs";
import { t as printSheetsBatch } from "./print-batch-DI_e7iaY.mjs";
import { t as ActionBar } from "./action-bar-DMY53NvK.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { t as Breadcrumbs } from "./breadcrumbs-0lX5b4_0.mjs";
import { a as resolveLogoUrl, i as resolveBrandingChain, n as fetchImageDataUrl, r as hexToRgb } from "./branding-B47KYsR4.mjs";
import { t as Route } from "./groups._id.dashboard-3eJLOhsz.mjs";
import { t as BrandingForm } from "./branding-form-DHLCxdw7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/groups._id.dashboard-CjgJuGfr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GroupDashboard() {
	const { id } = Route.useParams();
	const { tenant, tenantId } = useCurrentTenant();
	const [logoDataUrl, setLogoDataUrl] = (0, import_react.useState)(null);
	const q = useQuery({
		queryKey: ["group-stats", id],
		staleTime: 300 * 1e3,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("group_stats", { _group: id });
			if (error) throw error;
			return data;
		}
	});
	const groupEntity = useQuery({
		queryKey: ["group-entity", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("id,tenant_id,name,display_name,primary_color,secondary_color,description,logo_url").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const brand = (0, import_react.useMemo)(() => resolveBrandingChain(groupEntity.data ?? null, null, tenant ?? null), [groupEntity.data, tenant]);
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
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm text-muted-foreground",
		children: "Carregando dashboard…"
	});
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm",
		children: "Grupo não encontrado."
	});
	const { header, students_latest, students_first, origin_classes_latest, school_latest } = q.data;
	const agg = aggregateCohort(students_latest, students_first);
	const originDims = peerDimensions(origin_classes_latest);
	const schoolDims = peerDimensions(school_latest);
	const last = header.last_evaluation_at ? new Date(header.last_evaluation_at).toLocaleDateString("pt-BR") : "—";
	const handlePDF = () => {
		generateCohortPDF({
			kind: "Grupo",
			tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
			cohortName: brand.displayName === "ProMetric" ? header.name : brand.displayName,
			subtitle: header.description ?? void 0,
			agg,
			branding: {
				primaryColor: hexToRgb(brand.primaryColor),
				logoDataUrl,
				displayName: brand.displayName
			},
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
	const accent = brand.primaryColor;
	const shareDashboard = async () => {
		const url = typeof window !== "undefined" ? window.location.href : "";
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Link do dashboard copiado");
		} catch {
			toast.error("Não foi possível copiar o link");
		}
	};
	const handlePrintSheets = () => printSheetsBatch(students_latest.map((s) => s.student_id).filter(Boolean), header.name);
	const actions = [
		{
			label: "Nova Avaliação",
			icon: Zap,
			primary: true,
			to: "/quick-eval"
		},
		{
			label: "Adicionar Integrantes",
			icon: Plus,
			to: "/groups/$id",
			params: { id }
		},
		{
			label: "Visualizar Integrantes",
			icon: Users,
			to: "/groups/$id",
			params: { id }
		},
		{
			label: "Imprimir Fichas do Grupo",
			icon: Printer,
			onClick: handlePrintSheets
		},
		{
			label: "Relatório da Equipe (PDF)",
			icon: FileDown,
			onClick: handlePDF
		},
		{
			label: "Compartilhar Dashboard",
			icon: Share2,
			onClick: shareDashboard
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { items: [
				{
					label: "Grupos",
					to: "/groups"
				},
				{
					label: brand.displayName === "ProMetric" ? header.name : brand.displayName,
					to: "/groups/$id",
					params: { id }
				},
				{ label: "Resumo" }
			] }),
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
								to: "/groups",
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate font-display text-xl font-bold sm:text-2xl",
								style: { color: accent },
								children: brand.displayName === "ProMetric" ? header.name : brand.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [header.description, `Última avaliação: ${last}`].filter(Boolean).join(" • ")
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBar, { actions })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryKPIs, { items: [
				{
					label: "Integrantes",
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
			agg.evaluatedCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoDataState, {
				title: "Este grupo ainda não possui avaliações suficientes",
				description: "Vincule alunos ao grupo e realize avaliações para gerar indicadores, comparativos e relatórios.",
				ctas: [{
					label: "Realizar avaliação",
					to: "/quick-eval",
					icon: "eval"
				}, {
					label: "Gerenciar alunos",
					to: "/students",
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
							value: "rankings",
							children: "Rankings Esportivos"
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
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SituationDistribution, {
								classifications: students_latest.map((s) => s.classifications ?? {}),
								title: "Distribuição do grupo vs Referência ProMetric®"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 lg:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-border bg-card p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mb-3 font-display text-sm font-semibold",
										children: "Radar — Grupo vs Turmas vs Escola"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AggregateRadar, { series: [
										{
											name: "Grupo",
											data: agg.dimensions,
											color: "hsl(160 70% 45%)"
										},
										{
											name: "Turmas",
											data: originDims,
											color: "hsl(217 91% 60%)"
										},
										{
											name: "Escola",
											data: schoolDims,
											color: "hsl(280 70% 60%)"
										}
									] })]
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mb-3 font-display text-sm font-semibold",
									children: "Atletas em destaque"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
									children: agg.students.slice(0, 9).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
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
									title: "Top 10 — Agilidade (Quadrado)",
									valueLabel: "Tempo",
									rows: topByIndicator(students_latest, "square_test_s", false).map((r) => ({
										student_id: r.student_id,
										full_name: r.full_name,
										value: r.value.toFixed(2),
										unit: "s"
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingTable, {
									title: "Top 10 — Med. Ball",
									valueLabel: "m",
									rows: topByIndicator(students_latest, "medicine_ball_m", true).map((r) => ({
										student_id: r.student_id,
										full_name: r.full_name,
										value: r.value.toFixed(2),
										unit: "m"
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
								children: ["Atletas em atenção — ", agg.atRisk.length]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskMap, { students: agg.atRisk })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "branding",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingForm, {
							entity: groupEntity.data ?? null,
							scope: "group",
							table: "groups",
							storageFolder: `${tenantId ?? "t"}/groups/${id}`,
							invalidateKeys: [["group-entity", id], ["group-stats", id]],
							hint: "Identidade visual deste grupo (equipe esportiva, projeto, treinamento). Herda da Escola/Tenant quando vazia."
						})
					})
				]
			})
		]
	});
}
//#endregion
export { GroupDashboard as component };
