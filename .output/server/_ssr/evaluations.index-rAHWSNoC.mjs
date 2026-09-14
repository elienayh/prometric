import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as ScanLine, I as Pencil, Ot as ChartLine, P as Plus, Pt as Brain, T as Search, X as Layers, ct as Eye, ft as Download, lt as ExternalLink, p as Trash2, q as LoaderCircle, vt as ClipboardList, y as Sparkles } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { t as createSsrRpc } from "./createSsrRpc-p5Uzme7Q.mjs";
import { a as calcRce, c as overallScore, i as calcImc, l as zoneColor, o as classifyAll, r as ageFromBirth, t as TEST_META } from "./proesp-DU2T_E5l.mjs";
import { a as prometricIndex, r as categoryColor } from "./prometric-method-BGZfQ42Z.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as currentEvaluation, t as consolidatedClassifications } from "./student-metrics-BReO5ZgL.mjs";
import { t as downloadStudentEvolutionPDF } from "./pdf-evolution-report-Ds1rMNGQ.mjs";
import { t as Run6MinInput } from "./run6min-input-DW7X2MHz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/evaluations.index-rAHWSNoC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var generateDiagnosis = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.evaluationId) throw new Error("evaluationId obrigatório");
	return data;
}).handler(createSsrRpc("fa62531b566d3095b56ec514c128f5ee9540f1d16500db1ac84e47386936457c"));
function EvaluationsPage() {
	const { tenantId, tenant } = useCurrentTenant();
	useNavigate();
	const qc = useQueryClient();
	const [openNew, setOpenNew] = (0, import_react.useState)(false);
	const [openDetail, setOpenDetail] = (0, import_react.useState)(null);
	const students = useQuery({
		queryKey: ["students-lite", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date").eq("tenant_id", tenantId).eq("is_active", true).order("full_name");
			if (error) throw error;
			return data;
		}
	});
	const list = useQuery({
		queryKey: ["evaluations", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("id,student_id,tenant_id,evaluated_at,age_years,weight_kg,height_cm,imc,classifications,ai_diagnosis,student:students(full_name,sex,birth_date)").eq("tenant_id", tenantId).order("evaluated_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("evaluations").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Avaliação removida");
			qc.invalidateQueries({ queryKey: ["evaluations"] });
			qc.invalidateQueries({ queryKey: ["class-stats"] });
			qc.invalidateQueries({ queryKey: ["group-stats"] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Central de Avaliações",
			description: "Visão operacional das avaliações — o cadastro principal acontece na ficha do aluno.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/evaluations/import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "mr-1.5 h-4 w-4" }), " Importar fichas"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpenNew(true),
					className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), " Nova"]
				})]
			})
		}),
		list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Carregando…"
		}) : !list.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Sem avaliações",
			description: "Aplique os 7 testes ProMetric — IMC, RCE, classificações e PDF são gerados automaticamente.",
			actionLabel: "Nova avaliação",
			onAction: () => setOpenNew(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CentralSections, {
			all: list.data,
			tenantName: tenant?.name ?? "ProMetric"
		}),
		openNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvaluationDialog, {
			mode: "single",
			tenantId,
			students: students.data ?? [],
			onClose: () => setOpenNew(false)
		}),
		openDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvaluationDetail, {
			id: openDetail,
			tenantName: tenant?.name ?? "ProMetric",
			onClose: () => setOpenDetail(null),
			onDelete: (id) => {
				del.mutate(id);
				setOpenDetail(null);
			}
		})
	] });
}
function StudentCard({ s, tenantName }) {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(null);
	const openFicha = () => navigate({
		to: "/students/$id",
		params: { id: s.student_id }
	});
	const reportEvolutivo = async () => {
		try {
			setBusy("evolutivo");
			const { data, error } = await supabase.from("evaluations").select("*, student:students(full_name,sex,birth_date)").eq("id", s.lastEvalId).single();
			if (error) throw error;
			await downloadStudentEvolutionPDF(s.student_id, s.tenantId, tenantName);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erro ao gerar PDF");
		} finally {
			setBusy(null);
		}
	};
	const openPortal = async () => {
		try {
			setBusy("portal");
			const { data, error } = await supabase.from("students").select("portal_enabled,portal_token").eq("id", s.student_id).maybeSingle();
			if (error) throw error;
			if (!data?.portal_enabled || !data?.portal_token) {
				toast.info("Portal ainda não ativado. Ative na ficha do aluno.");
				openFicha();
				return;
			}
			window.open(`${window.location.origin}/portal/aluno/${data.portal_token}`, "_blank");
			qc.invalidateQueries({ queryKey: ["student-portal", s.student_id] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erro ao abrir portal");
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: openFicha,
						className: "truncate text-left font-display text-base font-semibold hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
						"aria-label": `Abrir ficha de ${s.full_name}`,
						children: s.full_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							s.count,
							" avaliaç",
							s.count === 1 ? "ão" : "ões",
							" realizada",
							s.count === 1 ? "" : "s"
						]
					})]
				}), s.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full border px-2 py-0.5 text-[10px]", categoryColor(s.category)),
					children: s.category
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/40 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase text-muted-foreground",
							children: "Última"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-sm font-bold",
							children: new Date(s.lastDate).toLocaleDateString("pt-BR")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/40 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase text-muted-foreground",
							children: "Índice"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-sm font-bold tabular-nums",
							children: s.score
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/40 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase text-muted-foreground",
							children: "Perfil"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-[11px] font-bold leading-tight",
							children: s.category ?? "—"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: openFicha,
						className: "min-h-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1 h-3.5 w-3.5" }), " Ficha"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: openPortal,
						disabled: busy === "portal",
						className: "min-h-10",
						children: [busy === "portal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 h-3.5 w-3.5" }), "Portal"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: reportEvolutivo,
						disabled: busy === "evolutivo",
						className: "min-h-10 bg-gradient-brand text-primary-foreground hover:opacity-90",
						children: [busy === "evolutivo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { className: "mr-1 h-3.5 w-3.5" }), "Relatório Evolutivo"]
					})
				]
			})
		]
	});
}
function CentralSections({ all, tenantName }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const summaries = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const ev of all) {
			if (!map.has(ev.student_id)) map.set(ev.student_id, []);
			map.get(ev.student_id).push(ev);
		}
		const out = [];
		for (const [sid, evs] of map) {
			const last = [...evs].sort((a, b) => b.evaluated_at.localeCompare(a.evaluated_at))[0];
			const current = currentEvaluation(evs) ?? last;
			const classifications = consolidatedClassifications(evs);
			const pm = prometricIndex(classifications);
			const fallback = overallScore(classifications).label;
			out.push({
				student_id: sid,
				full_name: last.student.full_name,
				count: evs.length,
				lastDate: last.evaluated_at,
				lastEvalId: current.id,
				score: pm.score,
				category: pm.category ?? fallback ?? null,
				tenantId: last.tenant_id ?? ""
			});
		}
		out.sort((a, b) => b.lastDate.localeCompare(a.lastDate));
		return out;
	}, [all]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return summaries;
		return summaries.filter((s) => s.full_name.toLowerCase().includes(q));
	}, [summaries, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-sm flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Buscar aluno…",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					className: "pl-9"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted-foreground",
				children: [
					filtered.length,
					" aluno",
					filtered.length === 1 ? "" : "s",
					" avaliado",
					filtered.length === 1 ? "" : "s"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
			children: filtered.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentCard, {
				s,
				tenantName
			}, s.student_id))
		})]
	});
}
var FIELDS = [
	{
		key: "weight_kg",
		label: "Peso",
		unit: "kg",
		step: "0.1"
	},
	{
		key: "height_cm",
		label: "Estatura",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "wingspan_cm",
		label: "Envergadura",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "waist_cm",
		label: "Cintura",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "hip_cm",
		label: "Quadril",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "sit_and_reach_cm",
		label: "Flexibilidade",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "abdominal_reps",
		label: "Abdominal 1min",
		unit: "reps"
	},
	{
		key: "horizontal_jump_cm",
		label: "Salto horizontal",
		unit: "cm",
		step: "0.1"
	},
	{
		key: "medicine_ball_m",
		label: "Medicine ball 2kg",
		unit: "m",
		step: "0.01"
	},
	{
		key: "square_test_s",
		label: "Agilidade (quadrado)",
		unit: "s",
		step: "0.01"
	},
	{
		key: "sprint_20m_s",
		label: "Velocidade 20m",
		unit: "s",
		step: "0.01"
	},
	{
		key: "run_6min_m",
		label: "Corrida 6min",
		unit: "m",
		step: "1"
	}
];
function EvaluationDialog({ mode, tenantId, students, onClose }) {
	const qc = useQueryClient();
	const [selectedIds, setSelectedIds] = (0, import_react.useState)([]);
	const [singleId, setSingleId] = (0, import_react.useState)("");
	const [evaluatedAt, setEvaluatedAt] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [values, setValues] = (0, import_react.useState)({});
	const [notes, setNotes] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant");
			const ids = mode === "single" ? singleId ? [singleId] : [] : selectedIds;
			if (!ids.length) throw new Error("Selecione aluno(s)");
			const numeric = (k) => {
				const v = values[k];
				if (v == null || v === "") return null;
				const n = parseFloat(v.replace(",", "."));
				return isNaN(n) ? null : n;
			};
			const rows = ids.map((sid) => {
				const s = students.find((x) => x.id === sid);
				const age = ageFromBirth(s.birth_date, new Date(evaluatedAt));
				const base = {
					tenant_id: tenantId,
					student_id: sid,
					evaluated_at: evaluatedAt,
					age_years: age,
					notes: notes || null
				};
				for (const f of FIELDS) base[f.key] = numeric(f.key);
				base.imc = calcImc(base.weight_kg, base.height_cm);
				base.rce = calcRce(base.waist_cm, base.height_cm);
				base.classifications = classifyAll({
					sex: s.sex,
					age,
					weight_kg: base.weight_kg,
					height_cm: base.height_cm,
					waist_cm: base.waist_cm,
					hip_cm: base.hip_cm,
					sit_and_reach_cm: base.sit_and_reach_cm,
					abdominal_reps: base.abdominal_reps,
					horizontal_jump_cm: base.horizontal_jump_cm,
					medicine_ball_m: base.medicine_ball_m,
					square_test_s: base.square_test_s,
					sprint_20m_s: base.sprint_20m_s,
					run_6min_m: base.run_6min_m
				});
				return base;
			});
			const { error } = await supabase.from("evaluations").insert(rows);
			if (error) throw error;
			return rows.length;
		},
		onSuccess: (n) => {
			toast.success(`${n} avaliação(ões) registrada(s)`);
			qc.invalidateQueries({ queryKey: ["evaluations"] });
			qc.invalidateQueries({ queryKey: ["class-stats"] });
			qc.invalidateQueries({ queryKey: ["group-stats"] });
			onClose();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	const preview = (0, import_react.useMemo)(() => {
		const s = students.find((x) => x.id === singleId);
		if (!s || mode !== "single") return null;
		const age = ageFromBirth(s.birth_date, new Date(evaluatedAt));
		const n = (k) => {
			const v = values[k];
			if (!v) return null;
			const p = parseFloat(v.replace(",", "."));
			return isNaN(p) ? null : p;
		};
		return classifyAll({
			sex: s.sex,
			age,
			weight_kg: n("weight_kg"),
			height_cm: n("height_cm"),
			waist_cm: n("waist_cm"),
			hip_cm: n("hip_cm"),
			sit_and_reach_cm: n("sit_and_reach_cm"),
			abdominal_reps: n("abdominal_reps"),
			horizontal_jump_cm: n("horizontal_jump_cm"),
			medicine_ball_m: n("medicine_ball_m"),
			square_test_s: n("square_test_s"),
			sprint_20m_s: n("sprint_20m_s"),
			run_6min_m: n("run_6min_m")
		});
	}, [
		singleId,
		values,
		evaluatedAt,
		students,
		mode
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (b) => !b && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [mode === "batch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4" }), mode === "batch" ? "Avaliação em lote" : "Nova avaliação"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate();
				},
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Data"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: evaluatedAt,
								onChange: (e) => setEvaluatedAt(e.target.value)
							})]
						}), mode === "single" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Aluno*"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: singleId,
								onValueChange: setSingleId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s.id,
									children: s.full_name
								}, s.id)) })]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Alunos selecionados"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm",
								children: [
									selectedIds.length,
									" de ",
									students.length
								]
							})]
						})]
					}),
					mode === "batch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-h-48 overflow-auto rounded-lg border border-border p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => setSelectedIds(students.map((s) => s.id)),
								children: "Todos"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								onClick: () => setSelectedIds([]),
								children: "Nenhum"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1 text-sm",
							children: students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted/50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: selectedIds.includes(s.id),
									onChange: (e) => setSelectedIds((p) => e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: s.full_name
								})]
							}, s.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("space-y-1.5", f.key === "run_6min_m" && "sm:col-span-2"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs",
									children: [
										f.label,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [
												"(",
												f.unit,
												")"
											]
										})
									]
								}),
								f.key === "run_6min_m" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Run6MinInput, {
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
									onChange: (e) => setValues((p) => ({
										...p,
										[f.key]: e.target.value
									}))
								}),
								mode === "single" && preview?.[mapKey(f.key)] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("inline-block rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(preview[mapKey(f.key)])),
									children: preview[mapKey(f.key)]
								})
							]
						}, f.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Observações"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: notes,
							onChange: (e) => setNotes(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: onClose,
						children: "Cancelar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
						children: save.isPending ? "Salvando…" : "Salvar"
					})] })
				]
			})]
		})
	});
}
function mapKey(k) {
	return {
		sit_and_reach_cm: "flex",
		abdominal_reps: "abdo",
		horizontal_jump_cm: "jump",
		medicine_ball_m: "mball",
		square_test_s: "square",
		sprint_20m_s: "sprint",
		run_6min_m: "run6"
	}[k] ?? "imc";
}
function EvaluationDetail({ id, tenantName, onClose, onDelete }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const aiFn = useServerFn(generateDiagnosis);
	const detail = useQuery({
		queryKey: ["evaluation", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("evaluations").select("*, student:students(full_name,sex,birth_date)").eq("id", id).single();
			if (error) throw error;
			return data;
		}
	});
	const ai = useMutation({
		mutationFn: () => aiFn({ data: { evaluationId: id } }),
		onSuccess: () => {
			toast.success("Diagnóstico gerado");
			qc.invalidateQueries({ queryKey: ["evaluation", id] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro IA")
	});
	const ev = detail.data;
	const overall = ev ? overallScore(ev.classifications ?? {}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (b) => !b && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: ev?.student.full_name ?? "Avaliação" }) }), !ev ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Carregando…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(ev.evaluated_at).toLocaleDateString("pt-BR") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [ev.age_years, " anos"] }),
							overall?.label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("ml-auto rounded-full border px-2 py-0.5", zoneColor(overall.label)),
								children: ["Perfil: ", overall.label]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: Object.entries(TEST_META).map(([k, m]) => {
							const v = ev[m.field];
							const z = ev.classifications?.[k];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-gradient-card p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase text-muted-foreground",
										children: m.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-display text-sm font-bold",
										children: [v ?? "—", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] font-normal text-muted-foreground",
											children: [" ", m.unit]
										})]
									}),
									z && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(z)),
										children: z
									})
								]
							}, k);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-gradient-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 font-display text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-4 w-4 text-accent" }), " Diagnóstico (IA)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => ai.mutate(),
								disabled: ai.isPending,
								children: [ai.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1",
									children: ev.ai_diagnosis ? "Regenerar" : "Gerar"
								})]
							})]
						}), ev.ai_diagnosis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "whitespace-pre-wrap text-xs leading-relaxed text-foreground/90",
							children: ev.ai_diagnosis
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Gere um diagnóstico técnico personalizado com base nos resultados."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "flex-wrap gap-2 sm:gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => onDelete(id),
								className: "text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 h-4 w-4" }), " Excluir"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => {
									onClose();
									navigate({
										to: "/quick-eval",
										search: { evaluation: id }
									});
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-1 h-4 w-4" }), " Editar avaliação"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => ev && downloadStudentEvolutionPDF(ev.student_id, ev.tenant_id, tenantName),
								className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-4 w-4" }), " Gerar Relatório"]
							})
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { EvaluationsPage as component };
