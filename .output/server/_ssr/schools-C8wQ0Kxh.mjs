import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Pencil, Nt as Building2, P as Plus, at as FileText, kt as ChartColumn, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { n as ZONES } from "./proesp-DU2T_E5l.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { n as generateInstitutionalPDF } from "./pdf-report-Dv2aqzFY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schools-C8wQ0Kxh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SchoolsPage() {
	const { tenantId } = useCurrentTenant();
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const list = useQuery({
		queryKey: ["schools", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("schools").select("id,name,network,city,state,phone,email").eq("tenant_id", tenantId).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("schools").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Escola removida");
			qc.invalidateQueries({ queryKey: ["schools"] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Escolas",
			description: "Gerencie as unidades escolares do seu espaço.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => {
					setEditing(null);
					setOpen(true);
				},
				className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), " Nova escola"]
			})
		}),
		list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Carregando…"
		}) : (list.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nenhuma escola ainda",
			description: "Cadastre sua primeira escola para começar a organizar turmas e alunos.",
			actionLabel: "Cadastrar escola",
			onAction: () => {
				setEditing(null);
				setOpen(true);
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
			children: list.data.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/schools/$id",
									params: { id: s.id },
									className: "block truncate font-display font-semibold hover:text-primary",
									children: s.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [s.city, s.state].filter(Boolean).join(" / ") || "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								asChild: true,
								title: "Abrir dashboard",
								className: "min-h-11 min-w-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/schools/$id",
									params: { id: s.id },
									"aria-label": `Abrir dashboard da escola ${s.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4 text-primary" })
								})
							})
						]
					}),
					s.network && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: ["Rede: ", s.network]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									setEditing(s);
									setOpen(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-1 h-3.5 w-3.5" }), " Editar"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstitutionalReportButton, { schoolId: s.id }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => del.mutate(s.id),
								className: "min-h-11 min-w-11 text-destructive hover:text-destructive",
								"aria-label": `Excluir escola ${s.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})
						]
					})
				]
			}, s.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolDialog, {
			open,
			onOpenChange: setOpen,
			editing,
			tenantId
		})
	] });
}
function SchoolDialog({ open, onOpenChange, editing, tenantId }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({});
	function reset() {
		setForm(editing ?? {});
	}
	if (open && form === void 0) reset();
	const save = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant ativo");
			if (!form.name) throw new Error("Nome é obrigatório");
			const payload = {
				tenant_id: tenantId,
				name: form.name,
				network: form.network ?? null,
				city: form.city ?? null,
				state: form.state ?? null,
				phone: form.phone ?? null,
				email: form.email ?? null
			};
			if (editing) {
				const { error } = await supabase.from("schools").update(payload).eq("id", editing.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("schools").insert([payload]);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Escola atualizada" : "Escola criada");
			qc.invalidateQueries({ queryKey: ["schools"] });
			onOpenChange(false);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (b) => {
			if (b) setForm(editing ?? {});
			onOpenChange(b);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Editar escola" : "Nova escola" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate();
				},
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nome*",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.name ?? "",
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rede",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.network ?? "",
							onChange: (e) => setForm({
								...form,
								network: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cidade",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.city ?? "",
								onChange: (e) => setForm({
									...form,
									city: e.target.value
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Estado",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								maxLength: 2,
								value: form.state ?? "",
								onChange: (e) => setForm({
									...form,
									state: e.target.value.toUpperCase()
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Telefone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.phone ?? "",
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "E-mail",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: form.email ?? "",
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
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
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs",
			children: label
		}), children]
	});
}
function InstitutionalReportButton({ schoolId }) {
	const { tenantId, tenant } = useCurrentTenant();
	const gen = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant ativo");
			const { data: school, error: sErr } = await supabase.from("schools").select("name,city,state,network").eq("id", schoolId).single();
			if (sErr || !school) throw new Error("Escola não encontrada");
			const { data: classesRows } = await supabase.from("classes").select("id,name").eq("school_id", schoolId).eq("tenant_id", tenantId);
			const classIds = (classesRows ?? []).map((c) => c.id);
			const { data: students } = await supabase.from("students").select("id,full_name,sex,class_id").in("class_id", classIds.length ? classIds : ["00000000-0000-0000-0000-000000000000"]).eq("is_active", true);
			const studentIds = (students ?? []).map((s) => s.id);
			const { data: evals } = await supabase.from("evaluations").select("id,student_id,classifications").in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]).order("evaluated_at", { ascending: false });
			const latest = /* @__PURE__ */ new Map();
			for (const e of evals ?? []) if (!latest.has(e.student_id)) latest.set(e.student_id, e);
			const zoneCounts = ZONES.reduce((acc, z) => ({
				...acc,
				[z]: 0
			}), {});
			for (const e of latest.values()) for (const z of Object.values(e.classifications ?? {})) if (z) zoneCounts[z]++;
			const classMap = new Map((classesRows ?? []).map((c) => [c.id, c.name]));
			const studClass = new Map((students ?? []).map((s) => [s.id, s.class_id]));
			const byClass = {};
			for (const [sid, ev] of latest) {
				const cn = classMap.get(studClass.get(sid) ?? "") ?? "Sem turma";
				byClass[cn] ??= {
					total: 0,
					healthy: 0,
					risk: 0
				};
				const vals = Object.values(ev.classifications ?? {}).filter(Boolean);
				if (!vals.length) continue;
				byClass[cn].total++;
				const h = vals.filter((z) => z === "Bom" || z === "Muito Bom" || z === "Excelente").length / vals.length;
				const r = vals.filter((z) => z === "Fraco" || z === "Muito Fraco").length / vals.length;
				if (h >= .6) byClass[cn].healthy++;
				if (r >= .3) byClass[cn].risk++;
			}
			const classBreakdown = Object.entries(byClass).map(([name, v]) => ({
				name,
				total: v.total,
				healthyPct: v.total ? Math.round(v.healthy / v.total * 100) : 0,
				riskPct: v.total ? Math.round(v.risk / v.total * 100) : 0
			})).sort((a, b) => b.healthyPct - a.healthyPct);
			const atRisk = [];
			const studName = new Map((students ?? []).map((s) => [s.id, s.full_name]));
			for (const [sid, ev] of latest) {
				const issues = Object.entries(ev.classifications ?? {}).filter(([, z]) => z === "Fraco" || z === "Muito Fraco").map(([k, z]) => `${k}:${z}`).join(", ");
				if (issues) atRisk.push({
					name: studName.get(sid) ?? "—",
					class: classMap.get(studClass.get(sid) ?? "") ?? "—",
					issues
				});
			}
			generateInstitutionalPDF({
				tenantName: tenant?.name ?? "ProMetric",
				school,
				totalStudents: (students ?? []).length,
				totalEvaluations: (evals ?? []).length,
				totalClasses: (classesRows ?? []).length,
				sex: {
					male: (students ?? []).filter((s) => s.sex === "male").length,
					female: (students ?? []).filter((s) => s.sex === "female").length
				},
				zoneCounts,
				classBreakdown,
				atRisk: atRisk.slice(0, 40)
			});
		},
		onSuccess: () => toast.success("Relatório gerado"),
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao gerar")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		onClick: () => gen.mutate(),
		disabled: gen.isPending,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1 h-3.5 w-3.5" }),
			" ",
			gen.isPending ? "Gerando…" : "Relatório PDF"
		]
	});
}
//#endregion
export { SchoolsPage as component };
