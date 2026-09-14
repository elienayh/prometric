import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bt as Activity, Nt as Building2, Rt as ArrowRight, d as TrendingUp, i as UsersRound, nt as GraduationCap, r as Users, t as Zap, vt as ClipboardList } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { n as ZONES } from "./proesp-DU2T_E5l.mjs";
import { i as dimensionScores, n as PM_DIMENSIONS } from "./prometric-method-BGZfQ42Z.mjs";
import { _ as ResponsiveContainer, a as YAxis, c as CartesianGrid, d as Radar, f as Pie, g as Cell, h as PolarGrid, m as PolarRadiusAxis, n as PieChart, o as XAxis, p as PolarAngleAxis, r as BarChart, t as RadarChart, u as Bar, v as Tooltip, y as Legend } from "../_libs/recharts+[...].mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-5C_y_zdL.js
var import_jsx_runtime = require_jsx_runtime();
var ZONE_COLORS = {
	"Muito Fraco": "#ef4444",
	"Fraco": "#f97316",
	"Razoável": "#f59e0b",
	"Bom": "#6366f1",
	"Muito Bom": "#10b981",
	"Excelente": "#22c55e"
};
function Dashboard() {
	const { tenantId, tenant, isLoading: tLoading } = useCurrentTenant();
	const stats = useQuery({
		queryKey: ["dash-stats", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const [students, classes, schools, groups, evalsCount] = await Promise.all([
				supabase.from("students").select("id, sex", { count: "exact" }).eq("tenant_id", tenantId).eq("is_active", true),
				supabase.from("classes").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", tenantId),
				supabase.from("schools").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", tenantId),
				supabase.from("groups").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", tenantId),
				supabase.from("evaluations").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", tenantId)
			]);
			const male = (students.data ?? []).filter((s) => s.sex === "male").length;
			const female = (students.data ?? []).filter((s) => s.sex === "female").length;
			return {
				students: students.count ?? 0,
				classes: classes.count ?? 0,
				schools: schools.count ?? 0,
				groups: groups.count ?? 0,
				evaluations: evalsCount.count ?? 0,
				male,
				female
			};
		}
	});
	const evals = useQuery({
		queryKey: ["dash-evals", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("id,evaluated_at,classifications,student:students(id,full_name)").eq("tenant_id", tenantId).order("evaluated_at", { ascending: false }).limit(500);
			if (error) throw error;
			return data;
		}
	});
	if (tLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Carregando…"
	});
	const cards = [
		{
			label: "Alunos ativos",
			value: stats.data?.students ?? 0,
			icon: Users,
			to: "/students"
		},
		{
			label: "Avaliações",
			value: stats.data?.evaluations ?? 0,
			icon: ClipboardList,
			to: "/evaluations"
		},
		{
			label: "Turmas",
			value: stats.data?.classes ?? 0,
			icon: GraduationCap,
			to: "/classes"
		},
		{
			label: "Escolas",
			value: stats.data?.schools ?? 0,
			icon: Building2,
			to: "/schools"
		},
		{
			label: "Grupos",
			value: stats.data?.groups ?? 0,
			icon: UsersRound,
			to: "/groups"
		}
	];
	const zoneCounts = {
		"Muito Fraco": 0,
		"Fraco": 0,
		"Razoável": 0,
		"Bom": 0,
		"Muito Bom": 0,
		"Excelente": 0
	};
	for (const e of evals.data ?? []) for (const z of Object.values(e.classifications ?? {})) if (z) zoneCounts[z]++;
	const zoneData = ZONES.map((z) => ({
		zone: z,
		total: zoneCounts[z],
		color: ZONE_COLORS[z]
	}));
	const months = {};
	const today = /* @__PURE__ */ new Date();
	for (let i = 5; i >= 0; i--) {
		const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
		months[d.toLocaleDateString("pt-BR", {
			month: "short",
			year: "2-digit"
		})] = 0;
	}
	for (const e of evals.data ?? []) {
		const k = new Date(e.evaluated_at).toLocaleDateString("pt-BR", {
			month: "short",
			year: "2-digit"
		});
		if (k in months) months[k]++;
	}
	const timeline = Object.entries(months).map(([month, total]) => ({
		month,
		total
	}));
	const sexData = [{
		name: "Masculino",
		value: stats.data?.male ?? 0,
		color: "#6366f1"
	}, {
		name: "Feminino",
		value: stats.data?.female ?? 0,
		color: "#ec4899"
	}];
	const atRisk = [];
	const seen = /* @__PURE__ */ new Set();
	for (const e of evals.data ?? []) {
		const sid = e.student?.id;
		if (!sid || seen.has(sid)) continue;
		seen.add(sid);
		if (Object.values(e.classifications ?? {}).some((z) => z === "Muito Fraco" || z === "Fraco")) atRisk.push({
			id: sid,
			name: e.student?.full_name ?? "—",
			date: new Date(e.evaluated_at).toLocaleDateString("pt-BR")
		});
		if (atRisk.length >= 6) break;
	}
	const dimAgg = {};
	for (const d of PM_DIMENSIONS) dimAgg[d] = {
		sum: 0,
		count: 0
	};
	for (const e of evals.data ?? []) {
		const ds = dimensionScores(e.classifications ?? {});
		for (const r of ds) if (r.category !== null) {
			dimAgg[r.dimension].sum += r.score;
			dimAgg[r.dimension].count += 1;
		}
	}
	const radarData = PM_DIMENSIONS.map((d) => ({
		dimension: d,
		score: dimAgg[d].count ? Math.round(dimAgg[d].sum / dimAgg[d].count) : 0
	}));
	const radarHasData = radarData.some((r) => r.score > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Olá 👋"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-3xl font-bold tracking-tight",
					children: ["Bem-vindo ao ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gradient-brand",
						children: tenant?.name ?? "ProMetric"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Indicadores agregados do seu espaço."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/quick-eval",
				className: "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-hero p-5 shadow-glow transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
							className: "h-6 w-6 text-white",
							strokeWidth: 2.5
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-base font-bold",
							children: "Modo Quadra"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-white/85",
							children: "Avaliação rápida de alunos em campo. Otimizado para celular."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur sm:inline-flex",
						children: ["Iniciar Avaliação ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-5 w-5 text-white sm:hidden" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5",
				children: cards.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .3,
						delay: i * .05
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: c.to,
						className: "relative block overflow-hidden rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 inline-grid h-9 w-9 place-items-center rounded-lg bg-primary/15",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-4 w-4 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-2xl font-bold",
								children: c.value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: c.label
							})
						]
					})
				}, c.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold",
							children: "Avaliações por mês (últimos 6)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: timeline,
							margin: {
								top: 4,
								right: 8,
								bottom: 0,
								left: -16
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
									stroke: "hsl(var(--muted-foreground))",
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									allowDecimals: false,
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
									dataKey: "total",
									radius: [
										6,
										6,
										0,
										0
									],
									fill: "#6366f1"
								})
							]
						}) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-sm font-semibold",
						children: "Distribuição por sexo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: sexData,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 45,
								outerRadius: 75,
								paddingAngle: 2,
								children: sexData.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: s.color }, s.name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								background: "hsl(var(--popover))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12
							} })
						] }) })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-sm font-semibold",
						children: "Distribuição agregada de classificações"
					}), (evals.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-48 place-items-center text-xs text-muted-foreground",
						children: "Sem avaliações"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: zoneData,
							layout: "vertical",
							margin: {
								top: 4,
								right: 8,
								bottom: 0,
								left: 8
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									allowDecimals: false,
									stroke: "hsl(var(--muted-foreground))",
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "category",
									dataKey: "zone",
									width: 90,
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
									dataKey: "total",
									radius: [
										0,
										6,
										6,
										0
									],
									children: zoneData.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: d.color }, i))
								})
							]
						}) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold",
							children: "Alunos em atenção"
						})]
					}), atRisk.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Nenhum aluno em perfil de atenção."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5",
						children: atRisk.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/students/$id",
							params: { id: r.id },
							className: cn("flex items-center justify-between rounded-lg border border-border bg-card p-2 text-xs transition-colors hover:border-primary hover:bg-primary/5"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate font-medium",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: r.date
							})]
						}) }, r.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold",
							children: "Radar ProMetric®"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs text-muted-foreground",
						children: "Média do Índice ProMetric® (0–100) por dimensão entre todas as avaliações."
					}),
					!radarHasData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-48 place-items-center text-xs text-muted-foreground",
						children: "Sem avaliações"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
							data: radarData,
							outerRadius: "75%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "hsl(var(--border))" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
									dataKey: "dimension",
									tick: {
										fontSize: 11,
										fill: "hsl(var(--muted-foreground))"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
									domain: [0, 100],
									tick: { fontSize: 9 },
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
									name: "Índice",
									dataKey: "score",
									stroke: "#6366f1",
									fill: "#6366f1",
									fillOpacity: .35
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "hsl(var(--popover))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12
								} })
							]
						}) })
					})
				]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
