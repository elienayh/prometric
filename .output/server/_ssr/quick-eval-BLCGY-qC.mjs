import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as Check, Nt as Building2, Rt as ArrowRight, g as Table2, i as UsersRound, j as Radio, nt as GraduationCap, q as LoaderCircle, r as Users, t as Zap, vt as ClipboardList, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { a as calcRce, i as calcImc, o as classifyAll, r as ageFromBirth } from "./proesp-DU2T_E5l.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { t as Run6MinInput } from "./run6min-input-DW7X2MHz.mjs";
import { t as Route } from "./quick-eval-BdsB-NOe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quick-eval-BLCGY-qC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIELDS = [
	{
		key: "weight_kg",
		label: "Peso",
		short: "Peso",
		unit: "kg",
		step: "0.1"
	},
	{
		key: "height_cm",
		label: "Altura",
		short: "Alt.",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "waist_cm",
		label: "Cintura",
		short: "Cint.",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "wingspan_cm",
		label: "Envergadura",
		short: "Env.",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "sit_and_reach_cm",
		label: "Sentar e Alcançar",
		short: "Flex",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "abdominal_reps",
		label: "Abdominal 1min",
		short: "Abdo",
		unit: "reps"
	},
	{
		key: "run_6min_m",
		label: "Corrida 6 minutos",
		short: "6min",
		unit: "m",
		step: "1"
	},
	{
		key: "medicine_ball_m",
		label: "Medicine Ball 2kg",
		short: "MBall",
		unit: "m",
		step: "0.01"
	},
	{
		key: "horizontal_jump_cm",
		label: "Salto Horizontal",
		short: "Salto",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "square_test_s",
		label: "Agilidade (Quadrado)",
		short: "Agil",
		unit: "s",
		step: "0.01"
	},
	{
		key: "sprint_20m_s",
		label: "Corrida 20 metros",
		short: "20m",
		unit: "s",
		step: "0.01"
	}
];
var SESSION_KEY = "pm:quick-eval:session";
function readSession() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const s = JSON.parse(raw);
		if (!s || !s.classId && !s.groupId) return null;
		return s;
	} catch {
		return null;
	}
}
function writeSession(patch) {
	if (typeof window === "undefined") return;
	try {
		const cur = readSession() ?? {};
		localStorage.setItem(SESSION_KEY, JSON.stringify({
			...cur,
			...patch,
			lastAccess: Date.now()
		}));
	} catch {}
}
function clearSession() {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(SESSION_KEY);
	} catch {}
}
function QuickEvalPage() {
	const { tenantId } = useCurrentTenant();
	const initial = Route.useSearch();
	const hasUrlContext = !!(initial.school || initial.class || initial.group || initial.student || initial.evaluation);
	const evalCtx = useQuery({
		queryKey: ["qe-eval-ctx", initial.evaluation],
		enabled: !!initial.evaluation && !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("id,student_id,evaluated_at").eq("id", initial.evaluation).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const effectiveStudentId = initial.student ?? evalCtx.data?.student_id ?? null;
	const forcedDate = evalCtx.data?.evaluated_at ?? null;
	const [schoolId, setSchoolId] = (0, import_react.useState)(initial.school ?? "");
	const [classId, setClassId] = (0, import_react.useState)(initial.class ?? "");
	const [groupId, setGroupId] = (0, import_react.useState)(initial.group ?? "");
	const [scopeKind, setScopeKind] = (0, import_react.useState)(initial.group ? "group" : "class");
	const [tab, setTab] = (0, import_react.useState)(initial.student || initial.evaluation ? "quadra" : "estacao");
	const [resume, setResume] = (0, import_react.useState)(null);
	const studentCtx = useQuery({
		queryKey: ["qe-student-ctx", effectiveStudentId],
		enabled: !!effectiveStudentId && !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,class_id,group_id,class:classes(id,school_id)").eq("id", effectiveStudentId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		const s = studentCtx.data;
		if (!s) return;
		if (s.class_id) {
			setScopeKind("class");
			setClassId(s.class_id);
			if (s.class?.school_id) setSchoolId(s.class.school_id);
		} else if (s.group_id) {
			setScopeKind("group");
			setGroupId(s.group_id);
		}
		setTab("quadra");
	}, [studentCtx.data]);
	(0, import_react.useEffect)(() => {
		if (hasUrlContext) return;
		const s = readSession();
		if (s) setResume(s);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!classId && !groupId) return;
		writeSession({
			scopeKind,
			schoolId,
			classId,
			groupId,
			tab
		});
	}, [
		scopeKind,
		schoolId,
		classId,
		groupId,
		tab
	]);
	const applyResume = (s) => {
		setScopeKind(s.scopeKind);
		setSchoolId(s.schoolId ?? "");
		setClassId(s.classId ?? "");
		setGroupId(s.groupId ?? "");
		setTab(s.tab ?? "estacao");
		setResume(null);
	};
	const discardResume = () => {
		clearSession();
		setResume(null);
	};
	const schools = useQuery({
		queryKey: ["qe-schools", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("schools").select("id,name").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const classes = useQuery({
		queryKey: [
			"qe-classes",
			tenantId,
			schoolId
		],
		enabled: !!tenantId && scopeKind === "class",
		queryFn: async () => {
			let q = supabase.from("classes").select("id,name,school_id").eq("tenant_id", tenantId).order("name");
			if (schoolId) q = q.eq("school_id", schoolId);
			const { data, error } = await q;
			if (error) throw error;
			return data;
		}
	});
	const groups = useQuery({
		queryKey: ["qe-groups", tenantId],
		enabled: !!tenantId && scopeKind === "group",
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("id,name").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const scope = scopeKind === "class" && classId && classId !== "__all__" ? {
		kind: "class",
		id: classId
	} : scopeKind === "group" && groupId ? {
		kind: "group",
		id: groupId
	} : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			resume && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResumeDialog, {
				session: resume,
				onContinue: () => applyResume(resume),
				onDiscard: discardResume
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Modo Quadra",
				description: "Otimizado para celular e tablet — selecione turma ou grupo e avalie todos os alunos sem voltar à lista.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/evaluations",
					className: "text-xs text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "mr-1 inline h-3.5 w-3.5" }), " Ver todas avaliações"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: scopeKind === "class" ? "default" : "outline",
						onClick: () => {
							setScopeKind("class");
							setGroupId("");
						},
						className: scopeKind === "class" ? "bg-gradient-brand text-primary-foreground" : "",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mr-1 h-3.5 w-3.5" }), " Turma"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: scopeKind === "group" ? "default" : "outline",
						onClick: () => {
							setScopeKind("group");
							setClassId("");
							setSchoolId("");
						},
						className: scopeKind === "group" ? "bg-gradient-brand text-primary-foreground" : "",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "mr-1 h-3.5 w-3.5" }), " Grupo"]
					})]
				}), scopeKind === "class" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "flex items-center gap-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3" }), " Escola"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: schoolId,
							onValueChange: (v) => {
								setSchoolId(v === "__all__" ? "" : v);
								setClassId("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Todas as escolas" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "__all__",
								children: "Todas as escolas"
							}), (schools.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.id,
								children: s.name
							}, s.id))] })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "flex items-center gap-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3 w-3" }), " Turma*"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: classId,
							onValueChange: setClassId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione uma turma" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (classes.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id)) })]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						className: "flex items-center gap-1 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "h-3 w-3" }), " Grupo*"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: groupId,
						onValueChange: setGroupId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione um grupo" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (groups.data ?? []).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: g.id,
							children: g.name
						}, g.id)) })]
					})]
				})]
			}),
			!scope ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: scopeKind === "class" ? "Escolha uma turma" : "Escolha um grupo",
				description: "Selecione o contexto para começar. Dica: o Modo Estação é o mais rápido em campo — escolha um teste e percorra todos os alunos."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: (v) => setTab(v),
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full max-w-xl grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "estacao",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "mr-1.5 h-3.5 w-3.5" }), " Estação"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "quadra",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1.5 h-3.5 w-3.5" }), " Por Aluno"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "planilha",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table2, { className: "mr-1.5 h-3.5 w-3.5" }), " Planilha"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "estacao",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationMode, {
							scope,
							tenantId
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "quadra",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuadraFlow, {
							scope,
							tenantId,
							forcedStudentId: effectiveStudentId,
							forcedDate,
							isNew: !initial.evaluation
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "planilha",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpreadsheetMode, {
							scope,
							tenantId
						})
					})
				]
			})
		]
	});
}
function useScopedStudents(scope) {
	return useQuery({
		queryKey: [
			"qe-students",
			scope?.kind,
			scope?.id
		],
		enabled: !!scope,
		queryFn: async () => {
			const col = scope.kind === "class" ? "class_id" : "group_id";
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,photo_url").eq(col, scope.id).eq("is_active", true).order("full_name");
			if (error) throw error;
			return data;
		},
		staleTime: 6e4
	});
}
function useTodayEvaluations(studentIds, date) {
	return useQuery({
		queryKey: [
			"qe-today-evals",
			date,
			...studentIds
		],
		enabled: studentIds.length > 0,
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("*").eq("evaluated_at", date).in("student_id", studentIds);
			if (error) throw error;
			return data ?? [];
		}
	});
}
function buildEvaluationPayload(student, tenantId, date, values, existing) {
	const age = ageFromBirth(student.birth_date, new Date(date));
	const payload = {
		tenant_id: tenantId,
		student_id: student.id,
		evaluated_at: date,
		age_years: age
	};
	for (const f of FIELDS) {
		const next = values[f.key];
		const prev = existing ? existing[f.key] : void 0;
		payload[f.key] = next !== void 0 ? next : prev ?? null;
	}
	payload.imc = calcImc(payload.weight_kg, payload.height_cm);
	payload.rce = calcRce(payload.waist_cm, payload.height_cm);
	payload.classifications = classifyAll({
		sex: student.sex,
		age,
		weight_kg: payload.weight_kg,
		height_cm: payload.height_cm,
		waist_cm: payload.waist_cm,
		sit_and_reach_cm: payload.sit_and_reach_cm,
		abdominal_reps: payload.abdominal_reps,
		horizontal_jump_cm: payload.horizontal_jump_cm,
		medicine_ball_m: payload.medicine_ball_m,
		square_test_s: payload.square_test_s,
		sprint_20m_s: payload.sprint_20m_s,
		run_6min_m: payload.run_6min_m
	});
	return payload;
}
function parseNum(s) {
	if (s == null || s === "") return null;
	const n = parseFloat(String(s).replace(",", "."));
	return isNaN(n) ? null : n;
}
function StationMode({ scope, tenantId }) {
	const qc = useQueryClient();
	const students = useScopedStudents(scope);
	const [date, setDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [field, setField] = (0, import_react.useState)("sit_and_reach_cm");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const list = students.data ?? [];
	const evals = useTodayEvaluations(list.map((s) => s.id), date);
	const evalByStudent = (0, import_react.useMemo)(() => {
		const m = {};
		for (const e of evals.data ?? []) m[e.student_id] = e;
		return m;
	}, [evals.data]);
	const [values, setValues] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)({});
	const timers = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		const next = {};
		for (const sid of Object.keys(evalByStudent)) {
			const v = evalByStudent[sid][field];
			if (v != null) next[sid] = String(v);
		}
		setValues(next);
		setSaving({});
	}, [
		field,
		date,
		evals.data
	]);
	const persist = (student, raw) => {
		const sid = student.id;
		setSaving((p) => ({
			...p,
			[sid]: "pending"
		}));
		clearTimeout(timers.current[sid]);
		timers.current[sid] = setTimeout(async () => {
			try {
				const payload = buildEvaluationPayload(student, tenantId, date, { [field]: parseNum(raw) }, evalByStudent[sid] ?? null);
				const { error } = await supabase.from("evaluations").upsert(payload, { onConflict: "student_id,evaluated_at" });
				if (error) throw error;
				setSaving((p) => ({
					...p,
					[sid]: "done"
				}));
				qc.invalidateQueries({ queryKey: ["qe-today-evals"] });
				qc.invalidateQueries({ queryKey: ["evaluations"] });
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Erro ao salvar");
				setSaving((p) => {
					const n = { ...p };
					delete n[sid];
					return n;
				});
			}
		}, 900);
	};
	const statusOf = (sid) => {
		if (values[sid]) return "done";
		const e = evalByStudent[sid];
		if (e && Object.values(e).some((v, i) => i > 4 && v != null)) return "pending";
		return "empty";
	};
	const filtered = list.filter((s) => {
		const st = statusOf(s.id);
		if (filter === "pending") return st !== "done";
		if (filter === "done") return st === "done";
		return true;
	});
	const counts = {
		total: list.length,
		done: list.filter((s) => statusOf(s.id) === "done").length,
		pending: list.filter((s) => statusOf(s.id) !== "done").length
	};
	const progress = counts.total ? Math.round(counts.done / counts.total * 100) : 0;
	const pendingSaves = Object.values(saving).filter((s) => s === "pending").length;
	(0, import_react.useEffect)(() => {
		if (!scope) return;
		writeSession({
			field,
			filter,
			filledCount: counts.done
		});
	}, [
		field,
		filter,
		counts.done,
		scope
	]);
	if (students.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Carregando alunos…"
	});
	if (!list.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Sem alunos",
		description: "Cadastre alunos neste contexto antes de avaliar."
	});
	const currentField = FIELDS.find((f) => f.key === field);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-[1fr_auto]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Estação (teste)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: field,
								onValueChange: (v) => setField(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-11",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: f.key,
									children: [
										f.label,
										" (",
										f.unit,
										")"
									]
								}, f.key)) })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Data"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: date,
								onChange: (e) => setDate(e.target.value),
								className: "h-11 sm:w-44"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1.5 flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-1 inline h-3 w-3" }),
								" ",
								counts.done,
								"/",
								counts.total,
								" concluídos"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium text-primary",
							children: [progress, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-gradient-brand transition-all",
							style: { width: `${progress}%` }
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [[
							"all",
							"pending",
							"done"
						].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: filter === k ? "default" : "outline",
							className: cn("h-8", filter === k && "bg-gradient-brand text-primary-foreground"),
							onClick: () => setFilter(k),
							children: k === "all" ? `Todos (${counts.total})` : k === "pending" ? `Pendentes (${counts.pending})` : `Concluídos (${counts.done})`
						}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto text-xs text-muted-foreground",
							children: pendingSaves > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-warning",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 inline h-3 w-3 animate-spin" }),
									" salvando ",
									pendingSaves,
									"…"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-success",
								children: "✓ tudo salvo"
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [filtered.map((s) => {
					const st = statusOf(s.id);
					const dotClass = st === "done" ? "bg-success" : st === "pending" ? "bg-warning" : "bg-muted-foreground/40";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 shadow-soft transition", st === "done" ? "border-success/30 bg-success/5" : st === "pending" ? "border-warning/30 bg-warning/5" : "border-border bg-gradient-card"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [s.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: s.photo_url,
									alt: "",
									className: "h-12 w-12 shrink-0 rounded-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-muted font-display text-sm font-bold text-muted-foreground",
									children: s.full_name.slice(0, 1).toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card", dotClass) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-display text-sm font-semibold",
									children: s.full_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground",
									children: [
										s.sex === "male" ? "Masc." : "Fem.",
										" • ",
										ageFromBirth(s.birth_date, new Date(date)),
										" anos"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [currentField.key === "run_6min_m" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-[260px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Run6MinInput, {
										compact: true,
										value: values[s.id] ?? "",
										onChange: (v) => {
											setValues((p) => ({
												...p,
												[s.id]: v
											}));
											persist(s, v);
										}
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: currentField.step ?? "1",
									inputMode: "decimal",
									placeholder: currentField.unit,
									value: values[s.id] ?? "",
									onChange: (e) => {
										const v = e.target.value;
										setValues((p) => ({
											...p,
											[s.id]: v
										}));
										persist(s, v);
									},
									onKeyDown: (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											const inputs = Array.from(document.querySelectorAll("input[data-station=\"1\"]"));
											inputs[inputs.findIndex((i) => i === e.currentTarget) + 1]?.focus();
										}
									},
									"data-station": "1",
									className: "h-11 w-24 text-center text-base font-semibold"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 text-center",
									children: saving[s.id] === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-4 w-4 animate-spin text-warning" }) : saving[s.id] === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto h-4 w-4 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: currentField.unit
									})
								})]
							})
						]
					}, s.id);
				}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
					children: "Nenhum aluno neste filtro."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "💡 Dica de campo: Selecione um teste, percorra os alunos um a um. Salvamento automático após digitar. Pressione Enter para pular ao próximo."
			})
		]
	});
}
function QuadraFlow({ scope, tenantId, forcedStudentId, forcedDate, isNew }) {
	const navigate = useNavigate();
	const students = useScopedStudents(scope);
	const today = forcedDate ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const list = students.data ?? [];
	const evals = useTodayEvaluations(list.map((s) => s.id), today);
	const evaluatedIds = (0, import_react.useMemo)(() => new Set((evals.data ?? []).map((e) => e.student_id)), [evals.data]);
	const [currentIdx, setCurrentIdx] = (0, import_react.useState)(() => {
		const idx = readSession()?.currentIdx;
		return typeof idx === "number" ? idx : null;
	});
	const [savedForced, setSavedForced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!forcedStudentId || !list.length) return;
		const idx = list.findIndex((s) => s.id === forcedStudentId);
		if (idx >= 0) setCurrentIdx(idx);
	}, [forcedStudentId, list]);
	const current = currentIdx != null ? list[currentIdx] : null;
	const doneCount = evaluatedIds.size;
	const progress = list.length ? Math.round(doneCount / list.length * 100) : 0;
	(0, import_react.useEffect)(() => {
		if (!scope) return;
		writeSession({
			currentIdx,
			filledCount: doneCount
		});
	}, [
		currentIdx,
		doneCount,
		scope
	]);
	if (students.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Carregando alunos…"
	});
	if (!list.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Sem alunos",
		description: "Cadastre alunos neste contexto antes de avaliar."
	});
	if (forcedStudentId && savedForced && current) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 rounded-2xl border border-success/30 bg-success/5 p-6 text-center shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/20 text-success",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-lg font-bold",
				children: "Avaliação salva com sucesso"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: current.full_name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => navigate({
						to: "/students/$id",
						params: { id: forcedStudentId }
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Voltar para ficha do aluno"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
					onClick: () => setSavedForced(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1 h-4 w-4" }), " Nova avaliação"]
				})]
			})
		]
	});
	if (current) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentEvalForm, {
		student: current,
		tenantId,
		date: today,
		isNew: !!isNew,
		progress: {
			done: doneCount,
			total: list.length,
			index: currentIdx + 1
		},
		onBack: () => {
			if (forcedStudentId) navigate({
				to: "/students/$id",
				params: { id: forcedStudentId }
			});
			else setCurrentIdx(null);
		},
		onSaved: () => {
			if (forcedStudentId) {
				setSavedForced(true);
				return;
			}
			const next = list.findIndex((s, i) => i > currentIdx && !evaluatedIds.has(s.id));
			if (next >= 0) setCurrentIdx(next);
			else {
				setCurrentIdx(null);
				toast.success("Concluído! 🎉");
			}
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-gradient-card p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-1 inline h-3 w-3" }),
					" ",
					list.length,
					" alunos"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium text-primary",
					children: [
						doneCount,
						" avaliados hoje (",
						progress,
						"%)"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2 overflow-hidden rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-gradient-brand transition-all",
					style: { width: `${progress}%` }
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
			children: list.map((s, i) => {
				const done = evaluatedIds.has(s.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setCurrentIdx(i),
					className: cn("group flex items-center justify-between gap-2 rounded-2xl border p-4 text-left shadow-soft transition active:scale-[0.98]", done ? "border-success/30 bg-success/5" : "border-border bg-gradient-card hover:border-primary/40"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate font-display text-base font-semibold",
							children: s.full_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								s.sex === "male" ? "Masc." : "Fem.",
								" • ",
								ageFromBirth(s.birth_date),
								" anos"
							]
						})]
					}), done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/20 text-success",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" })]
				}, s.id);
			})
		})]
	});
}
function StudentEvalForm({ student, tenantId, date, isNew, progress, onBack, onSaved }) {
	const qc = useQueryClient();
	const [values, setValues] = (0, import_react.useState)({});
	const [formDate, setFormDate] = (0, import_react.useState)(date);
	const existing = useQuery({
		queryKey: [
			"qe-eval",
			student.id,
			formDate
		],
		queryFn: async () => {
			const { data } = await supabase.from("evaluations").select("*").eq("student_id", student.id).eq("evaluated_at", formDate).maybeSingle();
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		if (isNew) {
			setValues({});
			return;
		}
		if (existing.data) {
			const v = {};
			for (const f of FIELDS) {
				const x = existing.data[f.key];
				if (x != null) v[f.key] = String(x);
			}
			setValues(v);
		}
	}, [existing.data, isNew]);
	const dateConflict = !!(isNew && existing.data);
	const save = useMutation({
		mutationFn: async () => {
			if (dateConflict) throw new Error("Já existe uma avaliação registrada nesta data. Escolha outra data ou edite a existente.");
			const numeric = {};
			for (const f of FIELDS) numeric[f.key] = parseNum(values[f.key]);
			const payload = buildEvaluationPayload(student, tenantId, formDate, numeric);
			const { error } = await supabase.from("evaluations").upsert(payload, { onConflict: "student_id,evaluated_at" });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success(`${student.full_name} salvo!`);
			qc.invalidateQueries({ queryKey: ["qe-today-evals"] });
			qc.invalidateQueries({ queryKey: ["qe-eval"] });
			qc.invalidateQueries({ queryKey: ["evaluations"] });
			qc.invalidateQueries({ queryKey: ["class-stats"] });
			qc.invalidateQueries({ queryKey: ["group-stats"] });
			onSaved();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onBack,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Lista"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground",
				children: [
					progress.index,
					" / ",
					progress.total,
					" • ",
					progress.done,
					" avaliados hoje"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-gradient-card p-4 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-xl font-bold",
						children: student.full_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							student.sex === "male" ? "Masculino" : "Feminino",
							" • ",
							ageFromBirth(student.birth_date, new Date(formDate)),
							" anos",
							isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary",
								children: "Nova avaliação"
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-[11px] font-medium",
							children: "Data da avaliação"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: formDate,
							onChange: (e) => setFormDate(e.target.value),
							className: "h-9 w-44"
						})]
					})]
				}),
				dateConflict && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning",
					children: "Já existe uma avaliação registrada para este aluno nesta data. Escolha outra data para criar uma nova avaliação ou volte e edite a existente."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						save.mutate();
					},
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
						children: FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("space-y-1", f.key === "run_6min_m" && "col-span-2 sm:col-span-3"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-[11px] font-medium",
								children: [f.label, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-1 text-muted-foreground",
									children: [
										"(",
										f.unit,
										")"
									]
								})]
							}), f.key === "run_6min_m" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Run6MinInput, {
								compact: true,
								value: values[f.key] ?? "",
								onChange: (v) => setValues((p) => ({
									...p,
									[f.key]: v
								}))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: f.step ?? "1",
								inputMode: "decimal",
								value: values[f.key] ?? "",
								onChange: (ev) => setValues((p) => ({
									...p,
									[f.key]: ev.target.value
								})),
								className: "h-11 text-base"
							})]
						}, f.key))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "flex-1",
							onClick: onBack,
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending || dateConflict,
							className: "flex-1 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
							children: save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Salvar e próximo ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-4 w-4" })] })
						})]
					})]
				})
			]
		})]
	});
}
function SpreadsheetMode({ scope, tenantId }) {
	const students = useScopedStudents(scope);
	const [date, setDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const qc = useQueryClient();
	const list = students.data ?? [];
	const evals = useQuery({
		queryKey: [
			"qe-sheet",
			scope?.kind,
			scope?.id,
			date
		],
		enabled: !!scope && list.length > 0,
		queryFn: async () => {
			const sids = list.map((s) => s.id);
			if (!sids.length) return [];
			const { data, error } = await supabase.from("evaluations").select("*").in("student_id", sids).eq("evaluated_at", date);
			if (error) throw error;
			return data;
		}
	});
	const existingByStudent = (0, import_react.useMemo)(() => {
		const m = {};
		for (const e of evals.data ?? []) m[e.student_id] = e;
		return m;
	}, [evals.data]);
	const [cells, setCells] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)({});
	const saveTimers = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		if (!evals.data) return;
		const next = {};
		for (const e of evals.data) {
			const sid = e.student_id;
			next[sid] = {};
			for (const f of FIELDS) {
				const v = e[f.key];
				if (v != null) next[sid][f.key] = String(v);
			}
		}
		setCells(next);
	}, [evals.data]);
	const persist = (student) => {
		const sid = student.id;
		setSaving((p) => ({
			...p,
			[sid]: "pending"
		}));
		clearTimeout(saveTimers.current[sid]);
		saveTimers.current[sid] = setTimeout(async () => {
			try {
				const v = cells[sid] ?? {};
				const numeric = {};
				for (const f of FIELDS) numeric[f.key] = parseNum(v[f.key]);
				const payload = buildEvaluationPayload(student, tenantId, date, numeric, existingByStudent[sid] ?? null);
				const { error } = await supabase.from("evaluations").upsert(payload, { onConflict: "student_id,evaluated_at" });
				if (error) throw error;
				setSaving((p) => ({
					...p,
					[sid]: "done"
				}));
				qc.invalidateQueries({ queryKey: ["evaluations"] });
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Erro ao salvar");
				setSaving((p) => {
					const n = { ...p };
					delete n[sid];
					return n;
				});
			}
		}, 1200);
	};
	const pendingCount = (0, import_react.useMemo)(() => Object.values(saving).filter((s) => s === "pending").length, [saving]);
	if (students.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Carregando…"
	});
	if (!list.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Sem alunos",
		description: "Cadastre alunos neste contexto antes de usar a planilha."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-gradient-card p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Data"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: date,
						onChange: (e) => setDate(e.target.value),
						className: "h-9 w-44"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: pendingCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-warning",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 inline h-3 w-3 animate-spin" }),
							" salvando ",
							pendingCount,
							"…"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-success",
						children: "✓ tudo salvo"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-2xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[900px] border-collapse text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky left-0 z-10 border-b border-border bg-muted/80 px-2 py-2 text-left",
								children: "Aluno"
							}),
							FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "border-b border-border px-1 py-2 text-center font-medium",
								children: [f.short, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[9px] font-normal opacity-70",
									children: f.key === "run_6min_m" ? "voltas + adic." : f.unit
								})]
							}, f.key)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "border-b border-border px-2 py-2 text-center",
								children: "✓"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "bg-card",
						children: list.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "sticky left-0 z-10 bg-card px-2 py-1.5 text-sm font-medium",
									children: s.full_name
								}),
								FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-0.5 py-0.5",
									children: f.key === "run_6min_m" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Run6MinCell, {
										value: cells[s.id]?.[f.key] ?? "",
										onChange: (v) => {
											setCells((p) => ({
												...p,
												[s.id]: {
													...p[s.id] ?? {},
													[f.key]: v
												}
											}));
											persist(s);
										}
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										step: f.step ?? "1",
										inputMode: "decimal",
										value: cells[s.id]?.[f.key] ?? "",
										onChange: (e) => {
											setCells((p) => ({
												...p,
												[s.id]: {
													...p[s.id] ?? {},
													[f.key]: e.target.value
												}
											}));
											persist(s);
										},
										onKeyDown: (e) => {
											if (e.key === "Enter") (e.currentTarget.closest("td")?.nextElementSibling?.querySelector("input"))?.focus();
										},
										className: "h-8 w-16 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none focus:ring-0"
									})
								}, f.key)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 text-center",
									children: saving[s.id] === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-3 w-3 animate-spin text-warning" }) : saving[s.id] === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto h-3 w-3 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "—"
									})
								})
							]
						}, s.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "💡 Edição é salva automaticamente ~1,2s após digitar. Use Tab/Enter para navegar entre células. Reavalia o mesmo aluno no mesmo dia? Atualiza a avaliação existente."
			})
		]
	});
}
function ResumeDialog({ session, onContinue, onDiscard }) {
	const ago = (() => {
		const diff = Date.now() - session.lastAccess;
		const m = Math.floor(diff / 6e4);
		if (m < 1) return "agora há pouco";
		if (m < 60) return `há ${m} min`;
		const h = Math.floor(m / 60);
		if (h < 24) return `há ${h}h`;
		return `há ${Math.floor(h / 24)}d`;
	})();
	const fieldLabel = session.field ? FIELDS.find((f) => f.key === session.field)?.label : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm",
		role: "dialog",
		"aria-modal": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-pop",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-9 w-9 place-items-center rounded-lg bg-primary/15",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-4 w-4 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-bold",
						children: "Continuar avaliação?"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: "Encontramos uma sessão anterior do Modo Quadra. Deseja retomar exatamente de onde parou?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mb-4 space-y-1.5 rounded-xl bg-muted/40 p-3 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Contexto"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: session.scopeKind === "class" ? "Turma" : "Grupo"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Modo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium capitalize",
								children: session.tab
							})]
						}),
						fieldLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Teste"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: fieldLabel
							})]
						}),
						typeof session.filledCount === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Preenchidos"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: session.filledCount
							})]
						}),
						typeof session.currentIdx === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Posição"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-medium",
								children: ["Aluno #", session.currentIdx + 1]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Último acesso"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: ago
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "flex-1",
						onClick: onDiscard,
						children: "Descartar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						className: "flex-1 bg-gradient-brand text-primary-foreground",
						onClick: onContinue,
						children: ["Continuar ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })]
					})]
				})
			]
		})
	});
}
function Run6MinCell({ value, onChange }) {
	const total = parseFloat((value ?? "").replace(",", "."));
	const safe = isFinite(total) && total > 0 ? total : 0;
	const laps = safe > 0 ? Math.floor(safe / 40) : 0;
	const rem = safe > 0 ? Math.round(safe - laps * 40) : 0;
	const extras = [
		0,
		10,
		20,
		30
	];
	const extra = extras.reduce((b, v) => Math.abs(v - rem) < Math.abs(b - rem) ? v : b, 0);
	const emit = (l, e) => onChange(l > 0 || e > 0 ? String(l * 40 + e) : "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			min: 0,
			step: 1,
			inputMode: "numeric",
			value: safe > 0 ? String(laps) : "",
			placeholder: "v",
			onChange: (e) => {
				const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
				emit(isFinite(n) ? n : 0, extra);
			},
			className: "h-8 w-12 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value: String(extra),
			onChange: (e) => emit(laps, Number(e.target.value)),
			className: "h-8 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none",
			children: extras.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
				value: m,
				children: ["+", m]
			}, m))
		})]
	});
}
//#endregion
export { QuickEvalPage as component };
