import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as MessageSquarePlus, C as Share2, I as Pencil, N as Printer, O as Save, a as User, ct as Eye, d as TrendingUp, f as TrendingDown, ft as Download, jt as Calendar, k as Ruler, lt as ExternalLink, p as Trash2, t as Zap, y as Sparkles, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { c as overallScore, l as zoneColor, r as ageFromBirth, s as expectedRangeFor } from "./proesp-DU2T_E5l.mjs";
import { a as prometricIndex, i as dimensionScores, r as categoryColor } from "./prometric-method-BGZfQ42Z.mjs";
import { n as EXPECTED_DIMENSION_RANGE, o as REFERENCE_LABEL, r as EXPECTED_INDEX_RANGE } from "./prometric-reference-G7AL_tS3.mjs";
import { _ as ResponsiveContainer, a as YAxis, c as CartesianGrid, d as Radar, h as PolarGrid, i as LineChart, l as ReferenceArea, m as PolarRadiusAxis, o as XAxis, p as PolarAngleAxis, s as Line, t as RadarChart, v as Tooltip, y as Legend } from "../_libs/recharts+[...].mjs";
import { n as issueSheetTokens, t as generateSheetPDF } from "./sheet-pdf-0uGmF5lM.mjs";
import { t as ActionBar } from "./action-bar-DMY53NvK.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader } from "./page-header-BgOgZloR.mjs";
import { n as currentEvaluation, r as withConsolidatedView, t as consolidatedClassifications } from "./student-metrics-BReO5ZgL.mjs";
import { t as downloadStudentEvolutionPDF } from "./pdf-evolution-report-Ds1rMNGQ.mjs";
import { t as DevelopmentSummary } from "./development-summary-BT4-UMam.mjs";
import { t as Route } from "./students._id-DSLdfpat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/students._id-BOk3ECN3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Radar com sobreposição: Referência ProMetric® + Aluno (atual) e
* opcionalmente a primeira avaliação. Permite ver imediatamente déficits
* e pontos fortes em relação ao esperado para idade/sexo.
*/
function ReferenceRadar({ classifications, firstClassifications, title = `Radar — Aluno × ${REFERENCE_LABEL}`, height = 320 }) {
	const dims = dimensionScores(classifications);
	const firstDims = firstClassifications ? dimensionScores(firstClassifications) : null;
	const refValue = EXPECTED_DIMENSION_RANGE.max;
	const data = dims.map((d, i) => ({
		dim: d.dimension.split(" ")[0],
		Referência: refValue,
		Aluno: d.score,
		...firstDims ? { Inicial: firstDims[i]?.score ?? 0 } : {}
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-sm font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full",
				style: { height },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
					data,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "hsl(var(--border))" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
							dataKey: "dim",
							stroke: "hsl(var(--muted-foreground))",
							fontSize: 11
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
							angle: 90,
							domain: [0, 100],
							stroke: "hsl(var(--muted-foreground))",
							fontSize: 10
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: REFERENCE_LABEL,
							dataKey: "Referência",
							stroke: "#22c55e",
							strokeDasharray: "4 4",
							fill: "#22c55e",
							fillOpacity: .12
						}),
						firstDims && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: "1ª avaliação",
							dataKey: "Inicial",
							stroke: "#94a3b8",
							fill: "#94a3b8",
							fillOpacity: .15
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: "Aluno (atual)",
							dataKey: "Aluno",
							stroke: "hsl(var(--primary))",
							fill: "hsl(var(--primary))",
							fillOpacity: .45
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
							background: "hsl(var(--popover))",
							border: "1px solid hsl(var(--border))",
							borderRadius: 8,
							fontSize: 12
						} })
					]
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-center text-[10px] text-muted-foreground",
				children: "A linha tracejada verde representa o nível mínimo esperado para idade e sexo (Referência ProMetric®)."
			})
		]
	});
}
var INDICATORS = [
	{
		key: "imc",
		field: "imc",
		label: "IMC",
		unit: "kg/m²",
		higherBetter: false
	},
	{
		key: "rce",
		field: "rce",
		label: "RCE",
		unit: "",
		higherBetter: false
	},
	{
		key: "flex",
		field: "sit_and_reach_cm",
		label: "Flexibilidade",
		unit: "cm",
		higherBetter: true
	},
	{
		key: "abdo",
		field: "abdominal_reps",
		label: "Resistência",
		unit: "reps",
		higherBetter: true
	},
	{
		key: "run6",
		field: "run_6min_m",
		label: "Corrida 6min",
		unit: "m",
		higherBetter: true
	},
	{
		key: "jump",
		field: "horizontal_jump_cm",
		label: "Salto",
		unit: "cm",
		higherBetter: true
	},
	{
		key: "mball",
		field: "medicine_ball_m",
		label: "Potência",
		unit: "m",
		higherBetter: true
	},
	{
		key: "square",
		field: "square_test_s",
		label: "Agilidade",
		unit: "s",
		higherBetter: false
	},
	{
		key: "sprint",
		field: "sprint_20m_s",
		label: "Velocidade",
		unit: "s",
		higherBetter: false
	}
];
function num(ev, f) {
	if (!ev) return null;
	const v = ev[f];
	return typeof v === "number" ? v : null;
}
function pct(curr, base, higherBetter) {
	if (curr == null || base == null || base === 0) return {
		diff: null,
		positive: null
	};
	const diff = (curr - base) / Math.abs(base) * 100;
	return {
		diff,
		positive: higherBetter ? diff >= 0 : diff <= 0
	};
}
function StudentDetail() {
	const { id } = Route.useParams();
	const student = useQuery({
		queryKey: ["student", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,phone,email,class_id,class:classes(name,school_id,school:schools(name))").eq("id", id).single();
			if (error) throw error;
			return data;
		}
	});
	const evals = useQuery({
		queryKey: ["student-evals", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications").eq("student_id", id).order("evaluated_at", { ascending: true });
			if (error) throw error;
			return data;
		}
	});
	const classId = student.data?.class_id ?? null;
	const schoolId = student.data?.class?.school_id ?? null;
	const classmates = useQuery({
		queryKey: ["class-evals", classId],
		enabled: !!classId,
		queryFn: async () => fetchLatestEvalsByClass(classId)
	});
	const schoolmates = useQuery({
		queryKey: ["school-evals", schoolId],
		enabled: !!schoolId,
		queryFn: async () => fetchLatestEvalsBySchool(schoolId)
	});
	const raw = evals.data ?? [];
	const data = (0, import_react.useMemo)(() => withConsolidatedView(raw), [raw]);
	const first = data.find((e) => Object.values(e.classifications ?? {}).some(Boolean)) ?? null;
	const last = data[data.length - 1] ?? null;
	const current = currentEvaluation(data);
	const clinicalEvals = data.filter((e) => Object.values(e.classifications ?? {}).some(Boolean));
	const prev = clinicalEvals.length >= 2 ? clinicalEvals[clinicalEvals.length - 2] : null;
	const effective = consolidatedClassifications(raw);
	const overall = current ? overallScore(effective) : null;
	const pmIndex = current ? prometricIndex(effective) : null;
	const { tenant } = useCurrentTenant();
	const portalQ = useQuery({
		queryKey: ["student-portal-min", id],
		queryFn: async () => {
			const { data } = await supabase.from("students").select("portal_enabled,portal_token,portal_slug").eq("id", id).maybeSingle();
			return data;
		}
	});
	const portalKey = portalQ.data?.portal_slug ?? portalQ.data?.portal_token ?? null;
	const portalUrl = !!portalQ.data?.portal_enabled && !!portalKey && typeof window !== "undefined" ? `${window.location.origin}${portalQ.data?.portal_slug ? "/p/" : "/portal/aluno/"}${portalKey}` : "";
	const [tab, setTab] = (0, import_react.useState)("painel");
	const [quickMeasureOpen, setQuickMeasureOpen] = (0, import_react.useState)(false);
	const [viewEval, setViewEval] = (0, import_react.useState)(null);
	const [testKey, setTestKey] = (0, import_react.useState)(null);
	const s = student.data;
	const handlePDF = async () => {
		if (!last || !s) {
			toast.error("Sem avaliação para gerar PDF");
			return;
		}
		if (!tenant?.id) {
			toast.error("Tenant não identificado");
			return;
		}
		try {
			await downloadStudentEvolutionPDF(id, tenant.id, tenant?.display_name ?? tenant?.name ?? "ProMetric");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erro ao gerar Relatório Evolutivo");
		}
	};
	const handlePrintSheet = async () => {
		try {
			toast.loading("Gerando ficha…", { id: "sheet-pdf" });
			await generateSheetPDF(await issueSheetTokens({ data: { studentIds: [id] } }));
			toast.success("Ficha gerada", { id: "sheet-pdf" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Falha ao gerar ficha", { id: "sheet-pdf" });
		}
	};
	const actions = [
		{
			label: "Nova Avaliação",
			icon: Zap,
			primary: true,
			accent: "brand",
			to: "/quick-eval",
			search: { student: id }
		},
		portalUrl ? {
			label: "Portal do Aluno",
			icon: Share2,
			primary: true,
			accent: "success",
			href: portalUrl,
			external: true
		} : {
			label: "Portal do Aluno",
			icon: Share2,
			primary: true,
			accent: "success",
			onClick: () => {
				toast.error("Ative o Portal do Aluno primeiro");
				setTab("portal");
			}
		},
		{
			label: "Imprimir Ficha",
			icon: Printer,
			onClick: handlePrintSheet
		},
		{
			label: "Atualizar Peso e Altura",
			icon: Ruler,
			onClick: () => setQuickMeasureOpen(true)
		},
		{
			label: "PDF",
			icon: Download,
			primary: true,
			accent: "amber",
			pinnedEnd: true,
			onClick: handlePDF
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/students",
				className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Voltar para alunos"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: s?.full_name ?? "Aluno",
				description: s ? [
					s.sex === "male" ? "Masculino" : "Feminino",
					`${ageFromBirth(s.birth_date)} anos`,
					s.class?.name,
					s.class?.school?.name,
					last ? `Última avaliação: ${new Date(last.evaluated_at).toLocaleDateString("pt-BR")}` : null
				].filter(Boolean).join(" • ") : "—",
				action: pmIndex && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary",
						children: ["Índice ProMetric: ", pmIndex.score]
					}), overall?.label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("rounded-full border px-3 py-1 text-xs", zoneColor(overall.label)),
						children: overall.label
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBar, { actions }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: setTab,
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "painel",
								children: "Painel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "dados",
								children: "Dados pessoais"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "observacoes",
								children: "Observações"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "portal",
								children: "Portal"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "dados",
						className: "mt-4 space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonalDataTab, {
							studentId: id,
							onSaved: () => student.refetch()
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "observacoes",
						className: "mt-4 space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesTab, { studentId: id })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "portal",
						className: "mt-4 space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalTab, {
							studentId: id,
							studentName: s?.full_name ?? ""
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "painel",
						className: "mt-4 space-y-6",
						children: current && data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevelopmentSummary, {
								classifications: effective,
								studentFirstName: s?.full_name?.split(" ")[0]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProMetricHero, {
								last: current,
								effective
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndicatorsGrid, {
								last: current,
								first,
								data,
								sex: s.sex,
								onSelectTest: (k) => setTestKey(k)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvolutionChart, { data: clinicalEvals }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceRadar, {
								classifications: effective,
								firstClassifications: first && first.id !== current.id ? first.classifications ?? null : null
							}),
							first && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarEvolutivo, {
								first,
								last: current
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparativeTab, {
								last: current,
								classEvals: classmates.data ?? [],
								schoolEvals: schoolmates.data ?? []
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingPanel, {
								last: current,
								classEvals: classmates.data ?? []
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineTab, {
								data,
								studentId: id,
								student: s,
								tenantName: tenant?.display_name ?? tenant?.name ?? "ProMetric",
								onOpenPortal: () => setTab("portal"),
								onView: (ev) => setViewEval(ev)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanel, {
								data: clinicalEvals,
								last: current,
								prev,
								classEvals: classmates.data ?? []
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIReportSection, { studentId: id })
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-dashed border-border bg-gradient-card p-10 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm font-medium",
									children: "Este aluno ainda não possui avaliações cadastradas."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Realize a primeira avaliação para gerar o painel, evolução e comparativos."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "mt-5 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/quick-eval",
										search: { student: id },
										children: "Realizar primeira avaliação"
									})
								})
							]
						})
					})
				]
			}),
			s && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickMeasureDialog, {
				open: quickMeasureOpen,
				onOpenChange: setQuickMeasureOpen,
				studentId: id,
				tenantId: tenant?.id ?? null,
				student: {
					full_name: s.full_name,
					sex: s.sex,
					birth_date: s.birth_date
				},
				onSaved: () => {
					evals.refetch();
				}
			}),
			s && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvaluationDetailDialog, {
				ev: viewEval,
				sex: s.sex,
				open: !!viewEval,
				onOpenChange: (v) => {
					if (!v) setViewEval(null);
				},
				onOpenTest: (k) => {
					setViewEval(null);
					setTestKey(k);
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TestEvolutionDialog, {
				testKey,
				data,
				sex: s.sex,
				open: !!testKey,
				onOpenChange: (v) => {
					if (!v) setTestKey(null);
				}
			})] })
		]
	});
}
async function fetchLatestEvalsByClass(classId) {
	const { data: studs } = await supabase.from("students").select("id").eq("class_id", classId).eq("is_active", true);
	return fetchLatestForStudents((studs ?? []).map((x) => x.id));
}
async function fetchLatestEvalsBySchool(schoolId) {
	const { data: cls } = await supabase.from("classes").select("id").eq("school_id", schoolId);
	const classIds = (cls ?? []).map((c) => c.id);
	if (!classIds.length) return [];
	const { data: studs } = await supabase.from("students").select("id").in("class_id", classIds).eq("is_active", true);
	return fetchLatestForStudents((studs ?? []).map((x) => x.id));
}
async function fetchLatestForStudents(sids) {
	if (!sids.length) return [];
	const { data } = await supabase.from("evaluations").select("id,student_id,evaluated_at,age_years,weight_kg,height_cm,imc,rce,sit_and_reach_cm,abdominal_reps,horizontal_jump_cm,medicine_ball_m,square_test_s,sprint_20m_s,run_6min_m,classifications").in("student_id", sids).order("evaluated_at", { ascending: false });
	const rows = data ?? [];
	const byStudent = /* @__PURE__ */ new Map();
	for (const e of rows) {
		const sid = e.student_id;
		const arr = byStudent.get(sid) ?? [];
		arr.push(e);
		byStudent.set(sid, arr);
	}
	const latest = [];
	for (const arr of byStudent.values()) {
		const current = currentEvaluation(arr);
		if (current) latest.push(current);
	}
	return latest;
}
function zoneToClinical(z) {
	if (!z) return "unknown";
	if (z === "Muito Fraco") return "critical";
	if (z === "Fraco") return "attention";
	return "adequate";
}
var STATUS_STYLE = {
	adequate: {
		dot: "bg-emerald-500",
		text: "text-emerald-700 dark:text-emerald-400",
		label: "Adequado",
		bar: "bg-emerald-500"
	},
	attention: {
		dot: "bg-amber-500",
		text: "text-amber-700  dark:text-amber-400",
		label: "Atenção",
		bar: "bg-amber-500"
	},
	critical: {
		dot: "bg-rose-500",
		text: "text-rose-700   dark:text-rose-400",
		label: "Crítico",
		bar: "bg-rose-500"
	},
	unknown: {
		dot: "bg-muted-foreground/40",
		text: "text-muted-foreground",
		label: "Sem dado",
		bar: "bg-muted-foreground/40"
	}
};
var CLINICAL_GROUPS = [
	{
		title: "Saúde Corporal",
		keys: ["imc", "rce"]
	},
	{
		title: "Mobilidade",
		keys: ["flex"]
	},
	{
		title: "Resistência",
		keys: ["abdo", "run6"]
	},
	{
		title: "Potência",
		keys: ["jump", "mball"]
	},
	{
		title: "Velocidade & Agilidade",
		keys: ["square", "sprint"]
	}
];
function formatNumber(v, unit) {
	if (unit === "kg/m²" || unit === "" || unit === "s" || unit === "m") return v.toFixed(unit === "" ? 2 : 1);
	return String(Math.round(v));
}
function IndicatorsGrid({ last, first, data, sex, onSelectTest }) {
	const age = last.age_years ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between border-b border-border px-5 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-1 w-6 rounded-full bg-primary" }), "Painel Clínico"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-0.5 font-display text-base font-semibold",
				children: "Indicadores por Capacidade"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClinicalLegend, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border",
			children: CLINICAL_GROUPS.map((g) => {
				const inds = g.keys.map((k) => INDICATORS.find((i) => i.key === k)).filter(Boolean);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-baseline gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
								children: g.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] text-muted-foreground/70",
								children: [
									inds.length,
									" indicador",
									inds.length > 1 ? "es" : ""
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
						children: inds.map((ind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClinicalCard, {
							ind,
							last,
							first,
							data,
							age,
							sex,
							onClick: () => onSelectTest(ind.key)
						}, ind.key))
					})]
				}, g.title);
			})
		})]
	});
}
function ClinicalLegend() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden items-center gap-3 text-[10px] text-muted-foreground sm:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendDot, {
				cls: "bg-emerald-500",
				label: "Adequado"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendDot, {
				cls: "bg-amber-500",
				label: "Atenção"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendDot, {
				cls: "bg-rose-500",
				label: "Crítico"
			})
		]
	});
}
function LegendDot({ cls, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", cls) }), label]
	});
}
function ClinicalCard({ ind, last, first, data, age, sex, onClick }) {
	const withValue = data.filter((ev) => num(ev, ind.field) != null);
	const source = withValue[withValue.length - 1] ?? last;
	const baseline = withValue.length > 1 ? withValue[0] : first && first.id !== source.id ? first : null;
	const value = num(source, ind.field);
	const { diff, positive } = pct(value, baseline && baseline.id !== source.id ? num(baseline, ind.field) : null, ind.higherBetter);
	const zone = source.classifications?.[ind.key];
	const status = zoneToClinical(zone);
	const styles = STATUS_STYLE[status];
	const range = expectedRangeFor(ind.key, source.age_years ?? age, sex);
	const rangeLabel = range ? `${formatNumber(range.min, ind.unit)}–${formatNumber(range.max, ind.unit)}${ind.unit ? ` ${ind.unit}` : ""}` : "—";
	const interpretation = status === "adequate" ? "Dentro do esperado para idade e sexo." : status === "attention" ? "Abaixo do esperado — recomenda-se estímulo direcionado." : status === "critical" ? "Muito abaixo do esperado — atenção prioritária." : "Sem dado registrado nesta avaliação.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		title: `Ver evolução de ${ind.label}`,
		className: "group w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
						children: ind.label
					})
				}), diff != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] tabular-nums", positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400", "bg-muted/50"),
					title: "Variação desde a avaliação anterior",
					children: [
						diff > 0 ? "+" : "",
						diff.toFixed(1),
						"%"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-baseline gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-3xl font-bold tabular-nums text-foreground",
					children: value != null ? formatNumber(value, ind.unit) : "—"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: ind.unit
				})]
			}),
			value != null && source.id !== last.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-0.5 text-[10px] text-muted-foreground/80",
				children: ["Registrado em ", new Date(source.evaluated_at).toLocaleDateString("pt-BR")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClinicalBar, {
					value,
					range,
					status
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex items-center justify-between text-[10px] tabular-nums text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Referência" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground/80",
						children: rangeLabel
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-start gap-2 border-t border-border pt-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", styles.dot) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("text-[11px] font-semibold", styles.text),
						children: styles.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[11px] leading-snug text-muted-foreground",
						children: interpretation
					})]
				})]
			})
		]
	});
}
function ClinicalBar({ value, range, status }) {
	if (!range) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-full rounded-full bg-muted" });
	const { min, max, domainMin, domainMax } = range;
	const span = domainMax - domainMin;
	const bandStart = (min - domainMin) / span * 100;
	const bandWidth = (max - min) / span * 100;
	const markerPct = value != null ? Math.max(0, Math.min(100, (value - domainMin) / span * 100)) : null;
	const markerBar = STATUS_STYLE[status].bar;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-2 w-full rounded-full bg-muted/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: "absolute inset-y-0 rounded-full bg-foreground/15 dark:bg-foreground/20",
			style: {
				left: `${bandStart}%`,
				width: `${bandWidth}%`
			}
		}), markerPct != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
			style: { left: `${markerPct}%` },
			"aria-label": "Posição do aluno na faixa de referência",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-3 w-[3px] rounded-sm shadow-sm", markerBar) })
		})]
	});
}
function EvaluationDetailDialog({ ev, sex, open, onOpenChange, onOpenTest }) {
	if (!ev) return null;
	const idx = prometricIndex(ev.classifications ?? {});
	const ov = overallScore(ev.classifications ?? {});
	const age = ev.age_years ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[85vh] max-w-3xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "font-display",
					children: ["Avaliação de ", new Date(ev.evaluated_at).toLocaleDateString("pt-BR")]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 text-[11px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary",
							children: ["Índice ProMetric ", idx.score]
						}),
						ov.label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("rounded-full border px-2.5 py-1", zoneColor(ov.label)),
							children: ["Perfil: ", ov.label]
						}),
						ev.weight_kg != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								"Peso ",
								ev.weight_kg,
								" kg"
							]
						}),
						ev.height_cm != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								"Altura ",
								ev.height_cm,
								" cm"
							]
						}),
						age ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [age, " anos"]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-2 sm:grid-cols-2",
					children: INDICATORS.map((ind) => {
						const value = num(ev, ind.field);
						const zone = (ev.recorded_classifications ?? ev.classifications)?.[ind.key];
						const status = zoneToClinical(zone);
						const styles = STATUS_STYLE[status];
						const range = expectedRangeFor(ind.key, age, sex);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onOpenTest(ind.key),
							className: "rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
										children: ind.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("text-[10px] font-semibold", styles.text),
										children: styles.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-baseline gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-2xl font-bold tabular-nums",
										children: value != null ? formatNumber(value, ind.unit) : "—"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground",
										children: ind.unit
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClinicalBar, {
										value,
										range,
										status
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1.5 text-[10px] text-muted-foreground",
									children: [
										"Referência: ",
										range ? `${formatNumber(range.min, ind.unit)}–${formatNumber(range.max, ind.unit)}` : "—",
										" • ver evolução"
									]
								})
							]
						}, ind.key);
					})
				})
			]
		})
	});
}
function TestEvolutionDialog({ testKey, data, sex, open, onOpenChange }) {
	const ind = testKey ? INDICATORS.find((i) => i.key === testKey) ?? null : null;
	const rows = (0, import_react.useMemo)(() => {
		if (!ind) return [];
		return data.filter((ev) => num(ev, ind.field) != null).map((ev) => ({
			id: ev.id,
			date: ev.evaluated_at,
			label: new Date(ev.evaluated_at).toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit"
			}),
			value: num(ev, ind.field),
			zone: ev.classifications?.[ind.key]
		}));
	}, [data, ind]);
	if (!ind) return null;
	const lastEv = data[data.length - 1];
	const range = expectedRangeFor(ind.key, lastEv?.age_years ?? 0, sex);
	const first = rows[0]?.value ?? null;
	const { diff, positive } = pct(rows[rows.length - 1]?.value ?? null, rows.length > 1 ? first : null, ind.higherBetter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[85vh] max-w-2xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "font-display",
					children: ["Evolução — ", ind.label]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							rows.length,
							" registro",
							rows.length === 1 ? "" : "s"
						] }),
						range && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Referência: ",
							formatNumber(range.min, ind.unit),
							"–",
							formatNumber(range.max, ind.unit),
							" ",
							ind.unit
						] }),
						diff != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("font-mono", positive ? "text-emerald-600" : "text-rose-600"),
							children: [
								diff > 0 ? "+" : "",
								diff.toFixed(1),
								"% desde a primeira"
							]
						})
					]
				}),
				rows.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 rounded-xl border border-border bg-background p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 220,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: rows,
							margin: {
								top: 8,
								right: 16,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tick: {
										fill: "hsl(var(--muted-foreground))",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fill: "hsl(var(--muted-foreground))",
										fontSize: 11
									},
									domain: ["auto", "auto"]
								}),
								range && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceArea, {
									y1: range.min,
									y2: range.max,
									fill: "var(--primary)",
									fillOpacity: .08
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "hsl(var(--popover))",
									border: "1px solid hsl(var(--border))"
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "value",
									name: ind.label,
									stroke: "var(--primary)",
									strokeWidth: 2.5,
									dot: {
										r: 4,
										fill: "var(--primary)"
									},
									connectNulls: true,
									isAnimationActive: false
								})
							]
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "É necessário pelo menos duas avaliações com este teste para exibir o gráfico de evolução."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 divide-y divide-border rounded-xl border border-border",
					children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-3 text-xs text-muted-foreground",
						children: "Nenhum resultado registrado para este teste."
					}), [...rows].reverse().map((r) => {
						const styles = STATUS_STYLE[zoneToClinical(r.zone)];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 px-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: new Date(r.date).toLocaleDateString("pt-BR")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-semibold tabular-nums",
									children: [
										r.value != null ? formatNumber(r.value, ind.unit) : "—",
										" ",
										ind.unit
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("text-[10px] font-semibold", styles.text),
									children: r.zone ?? styles.label
								})
							]
						}, r.id);
					})]
				})
			]
		})
	});
}
function InsightsPanel({ data, last, prev, classEvals }) {
	const insights = (0, import_react.useMemo)(() => {
		const out = [];
		const lastScore = prometricIndex(last.classifications ?? {}).score;
		if (prev) {
			const prevScore = prometricIndex(prev.classifications ?? {}).score;
			const delta = lastScore - prevScore;
			if (delta >= 5) out.push({
				tone: "good",
				text: `Índice ProMetric subiu de ${prevScore} para ${lastScore} desde a última avaliação.`
			});
			else if (delta <= -5) out.push({
				tone: "bad",
				text: `Índice ProMetric caiu de ${prevScore} para ${lastScore} desde a última avaliação.`
			});
			else out.push({
				tone: "info",
				text: `Índice ProMetric estável (${lastScore}) em relação à avaliação anterior.`
			});
		}
		const sorted = [...dimensionScores(last.classifications ?? {})].filter((d) => d.category).sort((a, b) => b.score - a.score);
		if (sorted[0]) out.push({
			tone: "good",
			text: `Ponto forte: ${sorted[0].dimension} (${sorted[0].score}/100 — ${sorted[0].category}).`
		});
		const weakest = sorted[sorted.length - 1];
		if (weakest && weakest.score < 50) out.push({
			tone: "warn",
			text: `Ponto de atenção: ${weakest.dimension} (${weakest.score}/100 — ${weakest.category}).`
		});
		if (classEvals.length >= 2) for (const ind of INDICATORS) {
			const v = num(last, ind.field);
			const vals = classEvals.map((e) => num(e, ind.field)).filter((x) => x != null);
			if (v == null || !vals.length) continue;
			const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
			if (avg === 0) continue;
			const diff = (v - avg) / avg * 100;
			const better = ind.higherBetter ? diff >= 10 : diff <= -10;
			const worse = ind.higherBetter ? diff <= -10 : diff >= 10;
			if (better) {
				out.push({
					tone: "good",
					text: `${ind.label}: ${Math.abs(diff).toFixed(0)}% acima da média da turma.`
				});
				break;
			}
			if (worse) {
				out.push({
					tone: "warn",
					text: `${ind.label}: ${Math.abs(diff).toFixed(0)}% abaixo da média da turma.`
				});
				break;
			}
		}
		if (data.length >= 3) out.push({
			tone: "info",
			text: `Acompanhamento consistente: ${data.length} avaliações registradas.`
		});
		return out;
	}, [
		data,
		last,
		prev,
		classEvals
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 font-display text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), " Análise automática"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "space-y-2",
			children: [insights.map((i, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: i.tone === "good" ? "🟢" : i.tone === "warn" ? "🟡" : i.tone === "bad" ? "🔴" : "🔵"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground/90",
					children: i.text
				})]
			}, idx)), !insights.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-xs text-muted-foreground",
				children: "Sem dados suficientes para gerar insights."
			})]
		})]
	});
}
function EvolutionChart({ data }) {
	const [metric, setMetric] = (0, import_react.useState)("prometric");
	const ind = metric === "prometric" ? null : INDICATORS.find((i) => i.key === metric);
	const label = ind ? ind.label : "Índice ProMetric";
	const unit = ind ? ind.unit : "/100";
	const higherBetter = ind ? ind.higherBetter : true;
	const series = data.map((e) => ({
		date: new Date(e.evaluated_at).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "short",
			year: "2-digit"
		}),
		valor: ind ? num(e, ind.field) : prometricIndex(e.classifications ?? {}).score
	}));
	const first = series.find((s) => s.valor != null)?.valor ?? null;
	const last = [...series].reverse().find((s) => s.valor != null)?.valor ?? null;
	const { diff, positive } = pct(last, first, higherBetter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 font-display text-sm font-semibold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-primary" }),
					" Evolução — ",
					label
				]
			}), diff != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					first,
					" ",
					unit,
					" → ",
					last,
					" ",
					unit,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("ml-1 font-medium", positive ? "text-success" : "text-destructive"),
						children: [
							"(",
							diff > 0 ? "+" : "",
							diff.toFixed(1),
							"%)"
						]
					})
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: metric,
				onValueChange: (v) => setMetric(v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-[220px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "prometric",
					children: "Índice ProMetric"
				}), INDICATORS.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: i.key,
					children: i.label
				}, i.key))] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-80 w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data: series,
				margin: {
					top: 8,
					right: 16,
					bottom: 0,
					left: -10
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						stroke: "hsl(var(--border))"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "date",
						stroke: "hsl(var(--muted-foreground))",
						fontSize: 11
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						stroke: "hsl(var(--muted-foreground))",
						fontSize: 11,
						domain: metric === "prometric" ? [0, 100] : ["auto", "auto"]
					}),
					metric === "prometric" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceArea, {
						y1: EXPECTED_INDEX_RANGE.min,
						y2: EXPECTED_INDEX_RANGE.max,
						fill: "#22c55e",
						fillOpacity: .12,
						stroke: "#22c55e",
						strokeOpacity: .4,
						strokeDasharray: "4 4",
						label: {
							value: "Referência ProMetric®",
							position: "insideTopRight",
							fontSize: 10,
							fill: "#16a34a"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "hsl(var(--popover))",
							border: "1px solid hsl(var(--border))",
							borderRadius: 8,
							fontSize: 12
						},
						formatter: (v) => [`${v} ${unit}`, label]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "valor",
						stroke: "var(--primary)",
						strokeWidth: 2.5,
						dot: {
							r: 4,
							fill: "var(--primary)"
						},
						activeDot: { r: 6 },
						connectNulls: true,
						isAnimationActive: false
					})
				]
			}) })
		})]
	});
}
function RadarEvolutivo({ first, last }) {
	const firstDims = dimensionScores(first.classifications ?? {});
	const chartData = dimensionScores(last.classifications ?? {}).map((d, i) => ({
		dim: d.dimension.split(" ")[0],
		Inicial: firstDims[i]?.score ?? 0,
		Atual: d.score
	}));
	const sameEval = first.id === last.id;
	const fDate = new Date(first.evaluated_at).toLocaleDateString("pt-BR");
	const lDate = new Date(last.evaluated_at).toLocaleDateString("pt-BR");
	const firstScore = prometricIndex(first.classifications ?? {}).score;
	const lastScore = prometricIndex(last.classifications ?? {}).score;
	const delta = lastScore - firstScore;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-display text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4 text-primary" }), " Radar Evolutivo — Inicial × Atual"]
				}), !sameEval && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", delta >= 0 ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"),
					children: [
						delta >= 0 ? "+" : "",
						delta,
						" pts no Índice ProMetric"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs text-muted-foreground",
				children: sameEval ? `Apenas uma avaliação registrada (${lDate}). Realize uma nova avaliação para visualizar a evolução.` : `Inicial: ${fDate} (${firstScore}/100) • Atual: ${lDate} (${lastScore}/100)`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-80 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
					data: chartData,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "hsl(var(--border))" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
							dataKey: "dim",
							stroke: "hsl(var(--muted-foreground))",
							fontSize: 11
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
							angle: 90,
							domain: [0, 100],
							stroke: "hsl(var(--muted-foreground))",
							fontSize: 10
						}),
						!sameEval && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: `Inicial (${fDate})`,
							dataKey: "Inicial",
							stroke: "#94a3b8",
							fill: "#94a3b8",
							fillOpacity: .2
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: `Atual (${lDate})`,
							dataKey: "Atual",
							stroke: "hsl(var(--primary))",
							fill: "hsl(var(--primary))",
							fillOpacity: .45
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
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
	});
}
function ComparativeTab({ last, classEvals, schoolEvals }) {
	const radarData = dimensionScores(last.classifications ?? {}).map((d) => ({
		dim: d.dimension.split(" ")[0],
		Aluno: d.score,
		Turma: avgDimension(classEvals, d.dimension),
		Escola: avgDimension(schoolEvals, d.dimension)
	}));
	const rows = INDICATORS.map((ind) => {
		const v = num(last, ind.field);
		const cVals = classEvals.map((e) => num(e, ind.field)).filter((x) => x != null);
		const sVals = schoolEvals.map((e) => num(e, ind.field)).filter((x) => x != null);
		const cAvg = cVals.length ? cVals.reduce((a, b) => a + b, 0) / cVals.length : null;
		const sAvg = sVals.length ? sVals.reduce((a, b) => a + b, 0) / sVals.length : null;
		const cDiff = pct(v, cAvg, ind.higherBetter);
		return {
			...ind,
			v,
			cAvg,
			sAvg,
			cDiff
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-sm font-semibold",
				children: "Radar ProMetric — Aluno × Turma × Escola"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-80 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
					data: radarData,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "hsl(var(--border))" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
							dataKey: "dim",
							stroke: "hsl(var(--muted-foreground))",
							fontSize: 11
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
							angle: 90,
							domain: [0, 100],
							stroke: "hsl(var(--muted-foreground))",
							fontSize: 10
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: "Aluno",
							dataKey: "Aluno",
							stroke: "#6366f1",
							fill: "#6366f1",
							fillOpacity: .45
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: "Turma",
							dataKey: "Turma",
							stroke: "#f59e0b",
							fill: "#f59e0b",
							fillOpacity: .18
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
							name: "Escola",
							dataKey: "Escola",
							stroke: "#10b981",
							fill: "#10b981",
							fillOpacity: .12
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
							background: "hsl(var(--popover))",
							border: "1px solid hsl(var(--border))",
							borderRadius: 8,
							fontSize: 12
						} })
					]
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-[10px] text-muted-foreground",
				children: "Escala 0–100 do Índice ProMetric por dimensão."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-2xl border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-muted/40 text-xs uppercase text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 text-left font-medium",
						children: "Indicador"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 text-right font-medium",
						children: "Aluno"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 text-right font-medium",
						children: "Turma"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 text-right font-medium",
						children: "Escola"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 text-right font-medium",
						children: "vs Turma"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "divide-y divide-border bg-card",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 font-medium",
						children: r.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 text-right font-mono",
						children: r.v != null ? `${r.v} ${r.unit}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 text-right font-mono text-muted-foreground",
						children: r.cAvg != null ? `${r.cAvg.toFixed(1)} ${r.unit}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 text-right font-mono text-muted-foreground",
						children: r.sAvg != null ? `${r.sAvg.toFixed(1)} ${r.unit}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 text-right",
						children: r.cDiff.diff != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", r.cDiff.positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"),
							children: [
								r.cDiff.positive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3 w-3" }),
								r.cDiff.diff > 0 ? "+" : "",
								r.cDiff.diff.toFixed(1),
								"%"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "—"
						})
					})
				] }, r.key))
			})]
		})
	})] });
}
function avgDimension(evals, dimension) {
	if (!evals.length) return 0;
	const scores = evals.map((e) => {
		return dimensionScores(e.classifications ?? {}).find((d) => d.dimension === dimension)?.score ?? 0;
	}).filter((x) => x > 0);
	return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}
function TimelineTab({ data, studentId, student, tenantName, onOpenPortal, onView }) {
	const navigate = useNavigate();
	const ordered = (0, import_react.useMemo)(() => [...data].reverse(), [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-4 flex items-center gap-2 font-display text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-primary" }), " Histórico de Avaliações"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "relative space-y-4 border-l border-border pl-5",
				children: [ordered.map((ev, idx) => {
					const cls = ev.classifications ?? {};
					const filled = Object.values(cls).filter(Boolean).length;
					const hasResult = filled > 0;
					const score = hasResult ? prometricIndex(cls).score : null;
					const ov = hasResult ? overallScore(cls) : null;
					const partial = filled < 9;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full border border-border bg-card text-[10px]",
								children: partial ? "🟡" : "🟢"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold",
										children: new Date(ev.evaluated_at).toLocaleDateString("pt-BR")
									}),
									idx === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] uppercase text-primary",
										children: "mais recente"
									}),
									ov?.label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("rounded-full border px-2 py-0.5 text-[10px]", zoneColor(ov.label)),
										children: ["Perfil: ", ov.label]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary",
										children: score == null ? "Sem classificação" : `Índice ${score}`
									}),
									partial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] text-warning",
										children: [
											"Parcial ",
											filled,
											"/9"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-xs",
										onClick: () => onView(ev),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1 h-3 w-3" }), " Visualizar"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-xs",
										onClick: () => navigate({
											to: "/quick-eval",
											search: { evaluation: ev.id }
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-1 h-3 w-3" }), " Editar"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-xs",
										onClick: onOpenPortal,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 h-3 w-3" }), " Portal"]
									})
								]
							})
						]
					}, ev.id);
				}), !ordered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-xs text-muted-foreground",
					children: "Sem avaliações registradas."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
					onClick: () => navigate({
						to: "/quick-eval",
						search: { student: studentId }
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1 h-3.5 w-3.5" }), " Nova avaliação"]
				})
			})
		]
	});
}
function PersonalDataTab({ studentId, onSaved }) {
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["student-personal", studentId],
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,cpf,rg,phone,email,guardian_name,guardian_relationship,guardian_phone,guardian_email,address_zip,address_street,address_number,address_complement,address_neighborhood,address_city,address_state").eq("id", studentId).single();
			if (error) throw error;
			return data;
		}
	});
	const [form, setForm] = (0, import_react.useState)({});
	const [dirty, setDirty] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (q.data) {
			setForm(q.data);
			setDirty(false);
		}
	}, [q.data]);
	const save = useMutation({
		mutationFn: async () => {
			if (!form.full_name || !form.birth_date || !form.sex) throw new Error("Nome, sexo e data de nascimento são obrigatórios");
			const payload = {
				full_name: form.full_name,
				sex: form.sex,
				birth_date: form.birth_date,
				cpf: form.cpf ?? null,
				rg: form.rg ?? null,
				phone: form.phone ?? null,
				email: form.email ?? null,
				guardian_name: form.guardian_name ?? null,
				guardian_relationship: form.guardian_relationship ?? null,
				guardian_phone: form.guardian_phone ?? null,
				guardian_email: form.guardian_email ?? null,
				address_zip: form.address_zip ?? null,
				address_street: form.address_street ?? null,
				address_number: form.address_number ?? null,
				address_complement: form.address_complement ?? null,
				address_neighborhood: form.address_neighborhood ?? null,
				address_city: form.address_city ?? null,
				address_state: form.address_state ?? null
			};
			const { data: updated, error } = await supabase.from("students").update(payload).eq("id", studentId).select("id");
			if (error) throw error;
			if (!updated || updated.length === 0) throw new Error("Sem permissão para editar este aluno (perfil somente leitura).");
		},
		onSuccess: () => {
			toast.success("Dados atualizados");
			qc.invalidateQueries({ queryKey: ["student-personal", studentId] });
			qc.invalidateQueries({ queryKey: ["student", studentId] });
			qc.invalidateQueries({ queryKey: ["student-portal", studentId] });
			qc.invalidateQueries({ queryKey: ["student-portal-min", studentId] });
			qc.invalidateQueries({ queryKey: ["students"] });
			qc.invalidateQueries({ queryKey: ["class-stats"] });
			qc.invalidateQueries({ queryKey: ["group-stats"] });
			onSaved();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar")
	});
	(0, import_react.useEffect)(() => {
		if (!dirty) return;
		if (!form.full_name || !form.birth_date || !form.sex) return;
		const t = setTimeout(() => {
			save.mutate();
		}, 800);
		return () => clearTimeout(t);
	}, [form, dirty]);
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Carregando…"
	});
	const f = form;
	const set = (patch) => {
		setForm((p) => ({
			...p,
			...patch
		}));
		setDirty(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			save.mutate();
		},
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Identificação",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nome completo *",
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: f.full_name ?? "",
							onChange: (e) => set({ full_name: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sexo *",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: f.sex ?? "male",
							onValueChange: (v) => set({ sex: v }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "male",
								children: "Masculino"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "female",
								children: "Feminino"
							})] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Data de nascimento *",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							required: true,
							value: f.birth_date ?? "",
							onChange: (e) => set({ birth_date: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "CPF",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.cpf ?? "",
							onChange: (e) => set({ cpf: e.target.value }),
							placeholder: "000.000.000-00",
							maxLength: 20
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "RG",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.rg ?? "",
							onChange: (e) => set({ rg: e.target.value }),
							maxLength: 20
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Telefone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.phone ?? "",
							onChange: (e) => set({ phone: e.target.value }),
							maxLength: 20
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "E-mail",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: f.email ?? "",
							onChange: (e) => set({ email: e.target.value }),
							maxLength: 255
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Responsável",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nome",
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.guardian_name ?? "",
							onChange: (e) => set({ guardian_name: e.target.value }),
							maxLength: 120
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Parentesco",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.guardian_relationship ?? "",
							onChange: (e) => set({ guardian_relationship: e.target.value }),
							placeholder: "Pai, mãe, responsável…",
							maxLength: 50
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Telefone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.guardian_phone ?? "",
							onChange: (e) => set({ guardian_phone: e.target.value }),
							maxLength: 20
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "E-mail",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: f.guardian_email ?? "",
							onChange: (e) => set({ guardian_email: e.target.value }),
							maxLength: 255
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Endereço",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "CEP",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_zip ?? "",
							onChange: (e) => set({ address_zip: e.target.value }),
							maxLength: 15
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Endereço",
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_street ?? "",
							onChange: (e) => set({ address_street: e.target.value }),
							maxLength: 160
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Número",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_number ?? "",
							onChange: (e) => set({ address_number: e.target.value }),
							maxLength: 20
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Complemento",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_complement ?? "",
							onChange: (e) => set({ address_complement: e.target.value }),
							maxLength: 80
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Bairro",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_neighborhood ?? "",
							onChange: (e) => set({ address_neighborhood: e.target.value }),
							maxLength: 80
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Cidade",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_city ?? "",
							onChange: (e) => set({ address_city: e.target.value }),
							maxLength: 80
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Estado",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address_state ?? "",
							onChange: (e) => set({ address_state: e.target.value }),
							maxLength: 2,
							placeholder: "UF"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: save.isPending,
					className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1.5 h-4 w-4" }),
						" ",
						save.isPending ? "Salvando…" : "Salvar alterações"
					]
				})
			})
		]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 font-display text-sm font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 gap-4 md:grid-cols-3",
			children
		})]
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs",
			children: label
		}), children]
	});
}
function NotesTab({ studentId }) {
	const qc = useQueryClient();
	const [content, setContent] = (0, import_react.useState)("");
	const notes = useQuery({
		queryKey: ["student-notes", studentId],
		queryFn: async () => {
			const { data, error } = await supabase.from("student_notes").select("id,content,created_at,author_id,author:profiles!student_notes_author_id_fkey(full_name,email)").eq("student_id", studentId).order("created_at", { ascending: false });
			if (error) {
				const r = await supabase.from("student_notes").select("id,content,created_at,author_id").eq("student_id", studentId).order("created_at", { ascending: false });
				if (r.error) throw r.error;
				return r.data;
			}
			return data;
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			const text = content.trim();
			if (text.length < 2) throw new Error("Conteúdo muito curto");
			if (text.length > 4e3) throw new Error("Limite de 4000 caracteres");
			const { data: u } = await supabase.auth.getUser();
			if (!u.user) throw new Error("Sem sessão");
			const { data: s, error: se } = await supabase.from("students").select("tenant_id").eq("id", studentId).single();
			if (se) throw se;
			const { error } = await supabase.from("student_notes").insert([{
				student_id: studentId,
				tenant_id: s.tenant_id,
				author_id: u.user.id,
				content: text
			}]);
			if (error) throw error;
		},
		onSuccess: () => {
			setContent("");
			toast.success("Observação registrada");
			qc.invalidateQueries({ queryKey: ["student-notes", studentId] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("student_notes").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Observação removida");
			qc.invalidateQueries({ queryKey: ["student-notes", studentId] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 font-display text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "h-4 w-4 text-primary" }), " Nova observação"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: content,
					onChange: (e) => setContent(e.target.value),
					placeholder: "Anotação do professor, evolução, conduta, próximos passos…",
					rows: 4,
					maxLength: 4e3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] text-muted-foreground",
						children: [content.length, "/4000"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => create.mutate(),
						disabled: create.isPending || content.trim().length < 2,
						className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
						children: create.isPending ? "Salvando…" : "Adicionar observação"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: notes.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Carregando…"
			}) : (notes.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-dashed border-border bg-gradient-card p-8 text-center text-sm text-muted-foreground",
				children: "Nenhuma observação registrada ainda."
			}) : (notes.data ?? []).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1.5 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted-foreground",
						children: [
							new Date(n.created_at).toLocaleString("pt-BR"),
							" ·",
							" ",
							n.author?.full_name ?? n.author?.email ?? "—"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "text-destructive hover:text-destructive",
						onClick: () => remove.mutate(n.id),
						title: "Remover",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "whitespace-pre-wrap text-sm text-foreground/90",
					children: n.content
				})]
			}, n.id))
		})]
	});
}
function ProMetricHero({ last, effective }) {
	const pm = prometricIndex(effective ?? last.classifications ?? {});
	const dims = pm.dimensions;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-primary/30 bg-gradient-brand p-6 text-primary-foreground shadow-glow",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-wide opacity-80",
					children: "Índice ProMetric"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 font-display text-5xl font-bold leading-none",
					children: pm.score
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-xs opacity-80",
					children: "de 100"
				}),
				pm.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 inline-flex rounded-full bg-background/15 px-3 py-1 text-xs font-medium backdrop-blur",
					children: pm.category
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 inline-flex max-w-[240px] rounded-full bg-background/15 px-3 py-1 text-[11px] font-medium backdrop-blur",
					children: [
						"Dados insuficientes (",
						pm.filledTests,
						"/9 testes)"
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-3 font-display text-sm font-semibold",
				children: "Dimensões"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
				children: dims.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-40 shrink-0 truncate text-xs text-muted-foreground",
							children: d.dimension
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative h-2 flex-1 overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-primary transition-all",
								style: { width: `${d.score}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-10 shrink-0 text-right text-xs font-medium tabular-nums",
							children: d.score
						}),
						d.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded-full border px-2 py-0.5 text-[10px]", categoryColor(d.category)),
							children: d.category
						})
					]
				}, d.dimension))
			})]
		})]
	});
}
function RankingPanel({ last, classEvals }) {
	const rows = (0, import_react.useMemo)(() => {
		if (classEvals.length === 0) return [];
		const pool = classEvals.some((e) => e.id === last.id) ? classEvals : [...classEvals, last];
		const total = pool.length;
		const indRows = INDICATORS.map((ind) => {
			const vals = pool.map((e) => ({
				id: e.id,
				v: num(e, ind.field)
			})).filter((x) => x.v != null);
			if (!vals.length) return {
				label: ind.label,
				position: null,
				total: vals.length,
				unit: ind.unit,
				value: num(last, ind.field)
			};
			vals.sort((a, b) => ind.higherBetter ? b.v - a.v : a.v - b.v);
			const idx = vals.findIndex((x) => x.id === last.id);
			return {
				label: ind.label,
				position: idx >= 0 ? idx + 1 : null,
				total: vals.length,
				unit: ind.unit,
				value: num(last, ind.field)
			};
		});
		const scored = pool.map((e) => ({
			id: e.id,
			s: prometricIndex(e.classifications ?? {}).score
		}));
		scored.sort((a, b) => b.s - a.s);
		const idxOverall = scored.findIndex((x) => x.id === last.id);
		return [{
			label: "Índice ProMetric (geral)",
			position: idxOverall >= 0 ? idxOverall + 1 : null,
			total,
			unit: "",
			value: prometricIndex(last.classifications ?? {}).score
		}, ...indRows];
	}, [last, classEvals]);
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-dashed border-border bg-gradient-card p-8 text-center text-sm text-muted-foreground",
		children: "Sem colegas avaliados na turma para gerar ranking."
	});
	const podiumTone = (pos, total) => {
		if (pos == null || total === 0) return "bg-muted text-muted-foreground border-border";
		const pct = pos / total;
		if (pct <= .2) return "bg-success/15 text-success border-success/30";
		if (pct <= .5) return "bg-primary/10 text-primary border-primary/30";
		if (pct <= .8) return "bg-warning/15 text-warning border-warning/30";
		return "bg-destructive/15 text-destructive border-destructive/30";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 font-display text-sm font-semibold",
			children: "Ranking na turma"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-xs text-muted-foreground",
						children: r.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-sm font-semibold",
						children: r.value != null ? `${r.value}${r.unit ? ` ${r.unit}` : ""}` : "—"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("ml-2 shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold", podiumTone(r.position, r.total)),
					children: r.position != null ? `${r.position}º de ${r.total}` : "—"
				})]
			}, r.label))
		})]
	});
}
function PortalTab({ studentId, studentName }) {
	const qc = useQueryClient();
	const portal = useQuery({
		queryKey: ["student-portal", studentId],
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("portal_enabled,portal_token,portal_slug,portal_token_created_at,portal_last_access,portal_views,tenant_id").eq("id", studentId).single();
			if (error) throw error;
			return data;
		}
	});
	const logs = useQuery({
		queryKey: ["portal-logs", studentId],
		queryFn: async () => {
			const { data, error } = await supabase.from("portal_access_logs").select("accessed_at,ip,user_agent").eq("student_id", studentId).order("accessed_at", { ascending: false }).limit(10);
			if (error) throw error;
			return data;
		}
	});
	const setEnabled = useMutation({
		mutationFn: async (enabled) => {
			const { error } = await supabase.rpc("portal_set_enabled", {
				_student: studentId,
				_enabled: enabled
			});
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["student-portal", studentId] });
			qc.invalidateQueries({ queryKey: ["student-portal-min", studentId] });
			toast.success("Atualizado");
		},
		onError: (e) => {
			console.error("[portal_set_enabled]", e);
			const msg = e?.message || e?.error_description || e?.hint || e?.details || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
			toast.error(msg);
		}
	});
	const regenerate = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc("portal_regenerate_token", { _student: studentId });
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["student-portal", studentId] });
			qc.invalidateQueries({ queryKey: ["student-portal-min", studentId] });
			toast.success("Novo link gerado");
		},
		onError: (e) => {
			console.error("[portal_regenerate_token]", e);
			const msg = e?.message || e?.error_description || e?.hint || e?.details || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
			toast.error(msg);
		}
	});
	const tok = portal.data?.portal_token;
	const slug = portal.data?.portal_slug;
	const key = slug ?? tok;
	const url = key ? `${typeof window !== "undefined" ? window.location.origin : ""}${slug ? "/p/" : "/portal/aluno/"}${key}` : "";
	const active = !!portal.data?.portal_enabled && !!key;
	const copy = () => {
		navigator.clipboard.writeText(url);
		toast.success("Link copiado");
	};
	const wapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Acompanhe ${studentName}: ${url}`)}`, "_blank");
	if (portal.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Carregando…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border bg-gradient-card p-5 shadow-soft",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display font-semibold",
					children: "Portal do Aluno"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Link público para a família acompanhar a evolução, sem necessidade de login."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full border px-3 py-1 text-xs font-medium", active ? "border-success/40 bg-success/15 text-success" : "border-border bg-muted text-muted-foreground"),
					children: active ? "Ativo" : "Inativo"
				})]
			}), !key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 bg-gradient-brand text-primary-foreground hover:opacity-90",
				onClick: () => setEnabled.mutate(true),
				disabled: setEnabled.isPending,
				children: "Ativar portal"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						readOnly: true,
						value: url,
						className: "flex-1 min-w-[240px] font-mono text-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: copy,
						children: "Copiar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: wapp,
						children: "WhatsApp"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => regenerate.mutate(),
						disabled: regenerate.isPending,
						children: "Regenerar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "text-destructive",
						onClick: () => setEnabled.mutate(!active),
						children: active ? "Desativar" : "Reativar"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Acessos",
						value: String(portal.data?.portal_views ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Último acesso",
						value: portal.data?.portal_last_access ? new Date(portal.data.portal_last_access).toLocaleString("pt-BR") : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Token criado",
						value: portal.data?.portal_token_created_at ? new Date(portal.data.portal_token_created_at).toLocaleDateString("pt-BR") : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Status",
						value: active ? "Ativo" : "Inativo"
					})
				]
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border bg-card p-4 shadow-soft",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mb-2 text-sm font-display font-semibold",
				children: "Histórico de acessos"
			}), !logs.data || logs.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Sem acessos registrados."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border text-xs",
				children: logs.data.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(l.accessed_at).toLocaleString("pt-BR") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: l.ip ?? "—"
					})]
				}, i))
			})]
		})]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border bg-card/60 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm font-medium",
			children: value
		})]
	});
}
function QuickMeasureDialog({ open, onOpenChange, studentId, tenantId, student, onSaved }) {
	const [weight, setWeight] = (0, import_react.useState)("");
	const [height, setHeight] = (0, import_react.useState)("");
	const [waist, setWaist] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setWeight("");
		setHeight("");
		setWaist("");
		(async () => {
			const { data } = await supabase.from("evaluations").select("weight_kg,height_cm,waist_cm").eq("student_id", studentId).order("evaluated_at", { ascending: false }).limit(1).maybeSingle();
			if (data) {
				if (data.weight_kg != null) setWeight(String(data.weight_kg));
				if (data.height_cm != null) setHeight(String(data.height_cm));
				const w = data.waist_cm;
				if (w != null) setWaist(String(w));
			}
		})();
	}, [open, studentId]);
	const save = async () => {
		if (!tenantId) {
			toast.error("Sem tenant");
			return;
		}
		const w = weight ? Number(weight) : null;
		const h = height ? Number(height) : null;
		const c = waist ? Number(waist) : null;
		if (w == null && h == null && c == null) {
			toast.error("Preencha ao menos um campo");
			return;
		}
		setSaving(true);
		try {
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			const age = ageFromBirth(student.birth_date, new Date(today));
			const imc = w && h ? +(w / Math.pow(h / 100, 2)).toFixed(2) : null;
			const rce = c && h ? +(c / h).toFixed(3) : null;
			const payload = {
				tenant_id: tenantId,
				student_id: studentId,
				evaluated_at: today,
				age_years: age,
				sex: student.sex
			};
			if (w != null) payload.weight_kg = w;
			if (h != null) payload.height_cm = h;
			if (c != null) payload.waist_cm = c;
			if (imc != null) payload.imc = imc;
			if (rce != null) payload.rce = rce;
			const { error } = await supabase.from("evaluations").upsert(payload, { onConflict: "student_id,evaluated_at" });
			if (error) throw error;
			toast.success("Medidas atualizadas");
			onSaved?.();
			onOpenChange(false);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erro ao salvar");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Atualizar peso, altura e cintura" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [student.full_name, " — registro de hoje"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Peso (kg)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.1",
									inputMode: "decimal",
									value: weight,
									onChange: (e) => setWeight(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Altura (cm)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.1",
									inputMode: "decimal",
									value: height,
									onChange: (e) => setHeight(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Cintura (cm)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.1",
									inputMode: "decimal",
									value: waist,
									onChange: (e) => setWaist(e.target.value)
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					disabled: saving,
					children: "Cancelar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving,
					className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
					children: saving ? "Salvando…" : "Salvar"
				})] })
			]
		})
	});
}
function AIReportSection({ studentId }) {
	const storageKey = `ai-student-report:${studentId}`;
	const [report, setReport] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return null;
		try {
			const raw = window.localStorage.getItem(storageKey);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const run = async () => {
		setLoading(true);
		try {
			const { generateStudentReport } = await import("./ai-student-report.functions-DzwmKvJP.mjs");
			const r = await generateStudentReport({ data: { studentId } });
			setReport(r);
			try {
				window.localStorage.setItem(storageKey, JSON.stringify(r));
			} catch {}
			toast.success("Relatório gerado pela IA");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Falha ao gerar relatório");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-primary/30 bg-gradient-card p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 font-display text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), " Análise Automática (IA)"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: run,
				disabled: loading,
				className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1.5 h-4 w-4" }), loading ? "Analisando…" : report ? "Regenerar Relatório" : "Gerar Relatório com IA"]
			})]
		}), !report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "A IA configurada irá analisar todo o histórico do aluno seguindo a metodologia ProMetric® e produzir um parecer estruturado (resumo, evolução, pontos fortes, atenção, recomendações e conclusão)."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportBlock, {
					title: "Resumo Geral",
					text: report.resumo_geral
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportBlock, {
					title: "Evolução",
					text: report.evolucao
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportList, {
					title: "Pontos Fortes",
					items: report.pontos_fortes,
					tone: "good"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportList, {
					title: "Pontos de Atenção",
					items: report.pontos_atencao,
					tone: "warn"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportList, {
					title: "Recomendações",
					items: report.recomendacoes,
					tone: "info"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportBlock, {
					title: "Conclusão",
					text: report.conclusao
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] text-muted-foreground",
					children: [
						"Gerado em ",
						new Date(report.generatedAt).toLocaleString("pt-BR"),
						" • Modelo ProMetric® ",
						report.promptVersion,
						" • via ",
						report.provider,
						" (",
						report.source,
						")"
					]
				})
			]
		})]
	});
}
function ReportBlock({ title, text }) {
	if (!text) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-1 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "whitespace-pre-wrap text-foreground/90",
		children: text
	})] });
}
function ReportList({ title, items, tone }) {
	if (!items?.length) return null;
	const icon = tone === "good" ? "🟢" : tone === "warn" ? "🟡" : "🔵";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-1 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1.5",
		children: items.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": true,
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-foreground/90",
				children: t
			})]
		}, i))
	})] });
}
//#endregion
export { StudentDetail as component };
