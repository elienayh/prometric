import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bt as Activity, Nt as Building2, Z as Info, d as TrendingUp, l as Trophy, r as Users, vt as ClipboardList } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as ZONES } from "./proesp-DU2T_E5l.mjs";
import { _ as ResponsiveContainer, a as YAxis, c as CartesianGrid, f as Pie, g as Cell, i as LineChart, n as PieChart, o as XAxis, r as BarChart, s as Line, u as Bar, v as Tooltip, y as Legend } from "../_libs/recharts+[...].mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader } from "./page-header-BgOgZloR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/executive-CqFVCzw8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ZONE_COLORS = {
	"Muito Fraco": "#ef4444",
	"Fraco": "#f97316",
	"Razoável": "#f59e0b",
	"Bom": "#6366f1",
	"Muito Bom": "#10b981",
	"Excelente": "#22c55e"
};
function ExecutivePage() {
	const { tenantId } = useCurrentTenant();
	const [schoolFilter, setSchoolFilter] = (0, import_react.useState)("");
	const [classFilter, setClassFilter] = (0, import_react.useState)("");
	const schools = useQuery({
		queryKey: ["exec-schools", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data } = await supabase.from("schools").select("id,name").eq("tenant_id", tenantId).order("name");
			return data ?? [];
		}
	});
	const classes = useQuery({
		queryKey: ["exec-classes", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data } = await supabase.from("classes").select("id,name,school_id").eq("tenant_id", tenantId).order("name");
			return data ?? [];
		}
	});
	const evals = useQuery({
		queryKey: ["exec-evals", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("id,evaluated_at,student_id,classifications,student:students(sex,birth_date,class:classes(name,school_id))").eq("tenant_id", tenantId).order("evaluated_at", { ascending: false }).limit(2e3);
			if (error) throw error;
			return data;
		},
		staleTime: 6e4
	});
	const filtered = (0, import_react.useMemo)(() => {
		return (evals.data ?? []).filter((e) => {
			if (schoolFilter && e.student?.class?.school_id !== schoolFilter) return false;
			if (classFilter && e.student?.class?.name !== classFilter) return false;
			return true;
		});
	}, [
		evals.data,
		schoolFilter,
		classFilter
	]);
	const latestByStudent = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		for (const e of filtered) {
			if (seen.has(e.student_id)) continue;
			seen.add(e.student_id);
			out.push(e);
		}
		return out;
	}, [filtered]);
	const zoneCounts = {
		"Muito Fraco": 0,
		"Fraco": 0,
		"Razoável": 0,
		"Bom": 0,
		"Muito Bom": 0,
		"Excelente": 0
	};
	for (const e of latestByStudent) for (const z of Object.values(e.classifications ?? {})) if (z) zoneCounts[z]++;
	const total = Object.values(zoneCounts).reduce((a, b) => a + b, 0);
	const healthy = zoneCounts["Bom"] + zoneCounts["Muito Bom"] + zoneCounts["Excelente"];
	const atRisk = zoneCounts["Muito Fraco"] + zoneCounts["Fraco"];
	const yearly = (0, import_react.useMemo)(() => {
		const map = {};
		for (const e of filtered) {
			const y = new Date(e.evaluated_at).getFullYear().toString();
			map[y] = (map[y] ?? 0) + 1;
		}
		return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([year, total]) => ({
			year,
			total
		}));
	}, [filtered]);
	const byAge = (0, import_react.useMemo)(() => {
		const map = {};
		for (const e of latestByStudent) {
			if (!e.student?.birth_date) continue;
			const age = Math.floor((Date.now() - new Date(e.student.birth_date).getTime()) / (365.25 * 864e5));
			map[age] = (map[age] ?? 0) + 1;
		}
		return Object.entries(map).sort(([a], [b]) => +a - +b).map(([age, total]) => ({
			age: `${age}a`,
			total
		}));
	}, [latestByStudent]);
	const ranking = (0, import_react.useMemo)(() => {
		const map = {};
		for (const e of latestByStudent) {
			const c = e.student?.class?.name ?? "Sem turma";
			map[c] ??= {
				healthy: 0,
				total: 0
			};
			const vals = Object.values(e.classifications ?? {}).filter(Boolean);
			if (!vals.length) continue;
			map[c].total++;
			if (vals.filter((z) => z === "Bom" || z === "Muito Bom" || z === "Excelente").length / vals.length >= .6) map[c].healthy++;
		}
		return Object.entries(map).map(([name, v]) => ({
			name,
			pct: v.total ? Math.round(v.healthy / v.total * 100) : 0,
			total: v.total
		})).sort((a, b) => b.pct - a.pct).slice(0, 8);
	}, [latestByStudent]);
	const zoneData = ZONES.map((z) => ({
		zone: z,
		total: zoneCounts[z],
		color: ZONE_COLORS[z]
	}));
	const sexAgg = {
		male: 0,
		female: 0
	};
	for (const e of latestByStudent) if (e.student?.sex === "male") sexAgg.male++;
	else if (e.student?.sex === "female") sexAgg.female++;
	const filteredClasses = (classes.data ?? []).filter((c) => !schoolFilter || c.school_id === schoolFilter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Dashboard Executivo",
				description: "Visão estratégica consolidada por escola, turma e período."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-2xl border border-border bg-gradient-card p-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Escola"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm",
						value: schoolFilter,
						onChange: (e) => {
							setSchoolFilter(e.target.value);
							setClassFilter("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as escolas"
						}), (schools.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Turma"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm",
						value: classFilter,
						onChange: (e) => setClassFilter(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as turmas"
						}), filteredClasses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.name ?? "",
							children: c.name
						}, c.id))]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }),
						label: "Alunos avaliados",
						value: latestByStudent.length,
						helpHash: "metodo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4 text-primary" }),
						label: "Avaliações",
						value: filtered.length,
						helpHash: "metodo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-success" }),
						label: "% perfil saudável",
						value: total ? `${Math.round(healthy / total * 100)}%` : "—",
						accent: "success",
						helpHash: "interpretacao"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4 text-destructive" }),
						label: "% em atenção",
						value: total ? `${Math.round(atRisk / total * 100)}%` : "—",
						accent: "destructive",
						helpHash: "interpretacao"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-primary" }),
						label: "Escolas ativas",
						value: schools.data?.length ?? 0,
						helpHash: "metodo"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Evolução anual de avaliações",
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: yearly,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "year",
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "total",
									stroke: "#6366f1",
									strokeWidth: 2,
									dot: { r: 4 }
								})
							]
						}) })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Distribuição por sexo",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pie, {
								data: [{
									name: "Masc.",
									value: sexAgg.male,
									c: "#6366f1"
								}, {
									name: "Fem.",
									value: sexAgg.female,
									c: "#ec4899"
								}],
								dataKey: "value",
								nameKey: "name",
								innerRadius: 45,
								outerRadius: 75,
								paddingAngle: 2,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: "#6366f1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: "#ec4899" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								background: "hsl(var(--popover))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12
							} })
						] }) })
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Distribuição por idade",
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: byAge,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "age",
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
									fill: "#10b981",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						}) })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Classificações agregadas",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: zoneData,
							layout: "vertical",
							margin: { left: 8 },
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
									width: 80,
									stroke: "hsl(var(--muted-foreground))",
									fontSize: 10
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
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				title: "Ranking de turmas — % alunos em perfil saudável",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-4 w-4 text-warning" }),
				children: ranking.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Sem dados para o filtro atual."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: ranking.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary",
							children: i + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: r.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: [
										r.pct,
										"% • ",
										r.total,
										" alunos"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 h-2 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-gradient-brand",
									style: { width: `${r.pct}%` }
								})
							})]
						})]
					}, r.name))
				})
			})
		]
	});
}
function Kpi({ icon, label, value, accent, helpHash }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [
					icon,
					" ",
					label
				]
			}), helpHash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/knowledge",
				hash: helpHash,
				className: "text-muted-foreground/70 hover:text-primary",
				title: "Saiba mais na Central de Conhecimento",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-1 font-display text-2xl font-bold", accent === "success" && "text-success", accent === "destructive" && "text-destructive"),
			children: value
		})]
	});
}
function Card({ title, icon, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border border-border bg-gradient-card p-5 shadow-soft", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 font-display text-sm font-semibold",
			children: [icon, title]
		}), children]
	});
}
//#endregion
export { ExecutivePage as component };
