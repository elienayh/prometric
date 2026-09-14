import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Pencil, P as Plus, kt as ChartColumn, nt as GraduationCap, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Cyj8fg_M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classes.index-DgXiWkyC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var shiftLabels = {
	morning: "Manhã",
	afternoon: "Tarde",
	evening: "Noite",
	full: "Integral"
};
function ClassesPage() {
	const { tenantId } = useCurrentTenant();
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const schools = useQuery({
		queryKey: ["schools-lite", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("schools").select("id,name").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const list = useQuery({
		queryKey: ["classes", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("classes").select("id,name,grade,school_year,shift,school_id,school:schools(name)").eq("tenant_id", tenantId).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const studentsInClass = useQuery({
		queryKey: ["class-students-count", toDelete?.id],
		enabled: !!toDelete,
		queryFn: async () => {
			const { count, error } = await supabase.from("students").select("id", {
				count: "exact",
				head: true
			}).eq("class_id", toDelete.id).eq("is_active", true);
			if (error) throw error;
			return count ?? 0;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error: unlinkErr } = await supabase.from("students").update({ class_id: null }).eq("class_id", id);
			if (unlinkErr) throw unlinkErr;
			const { error } = await supabase.from("classes").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Turma removida. Alunos foram desvinculados.");
			qc.invalidateQueries({ queryKey: ["classes"] });
			qc.invalidateQueries({ queryKey: ["students"] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover turma")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Turmas",
			description: "Organize alunos por turma, série e turno.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => {
					setEditing(null);
					setOpen(true);
				},
				className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), " Nova turma"]
			})
		}),
		list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Carregando…"
		}) : (list.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nenhuma turma cadastrada",
			description: "Crie turmas para organizar seus alunos por série e turno.",
			actionLabel: "Criar turma",
			onAction: () => {
				setEditing(null);
				setOpen(true);
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2 md:hidden",
			children: list.data.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/classes/$id",
						params: { id: c.id },
						className: "flex min-w-0 items-center gap-2 font-semibold hover:text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate hover:underline",
							children: c.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								asChild: true,
								className: "min-h-11 min-w-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/classes/$id/dashboard",
									params: { id: c.id },
									"aria-label": `Abrir resumo da turma ${c.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4 text-primary" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => {
									setEditing(c);
									setOpen(true);
								},
								"aria-label": `Editar turma ${c.name}`,
								className: "min-h-11 min-w-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => setToDelete(c),
								className: "min-h-11 min-w-11 text-destructive",
								"aria-label": `Excluir turma ${c.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid grid-cols-2 gap-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Escola"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 truncate font-medium",
							children: c.school?.name ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Série"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 font-medium",
							children: c.grade ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Ano"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 font-medium",
							children: c.school_year ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Turno"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 font-medium",
							children: c.shift ? shiftLabels[c.shift] : "—"
						})] })
					]
				})]
			}, c.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden overflow-hidden rounded-2xl border border-border md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted/40 text-xs uppercase text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-medium",
							children: "Turma"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-medium",
							children: "Escola"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-medium",
							children: "Série"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-medium",
							children: "Ano"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-medium",
							children: "Turno"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border bg-card",
					children: list.data.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-medium",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/classes/$id",
								params: { id: c.id },
								className: "flex items-center gap-2 hover:text-primary hover:underline",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 text-primary" }),
									" ",
									c.name
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.school?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.grade ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.school_year ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: c.shift ? shiftLabels[c.shift] : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									asChild: true,
									className: "min-h-11 min-w-11",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/classes/$id/dashboard",
										params: { id: c.id },
										"aria-label": `Abrir resumo da turma ${c.name}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4 text-primary" })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => {
										setEditing(c);
										setOpen(true);
									},
									className: "min-h-11 min-w-11",
									"aria-label": `Editar turma ${c.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => setToDelete(c),
									className: "min-h-11 min-w-11 text-destructive",
									"aria-label": `Excluir turma ${c.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						})
					] }, c.id))
				})]
			})
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassDialog, {
			open,
			onOpenChange: setOpen,
			editing,
			tenantId,
			schools: schools.data ?? []
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!toDelete,
			onOpenChange: (b) => !b && setToDelete(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Excluir turma?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: toDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"A turma ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: toDelete.name }),
				" será removida permanentemente.",
				(studentsInClass.data ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					" Os ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: studentsInClass.data }),
					" aluno(s) vinculados a esta turma serão automaticamente ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "desvinculados" }),
					" (não excluídos) e poderão ser reatribuídos a outra turma depois."
				] })
			] }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancelar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				onClick: () => {
					if (toDelete) {
						del.mutate(toDelete.id);
						setToDelete(null);
					}
				},
				children: "Excluir turma"
			})] })] })
		})
	] });
}
function ClassDialog({ open, onOpenChange, editing, tenantId, schools }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(editing ?? {});
	const save = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant ativo");
			if (!form.name) throw new Error("Nome é obrigatório");
			const payload = {
				tenant_id: tenantId,
				name: form.name,
				grade: form.grade ?? null,
				school_year: form.school_year ?? null,
				shift: form.shift ?? null,
				school_id: form.school_id ?? null
			};
			if (editing) {
				const { error } = await supabase.from("classes").update(payload).eq("id", editing.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("classes").insert([payload]);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Turma atualizada" : "Turma criada");
			qc.invalidateQueries({ queryKey: ["classes"] });
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
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Editar turma" : "Nova turma" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate();
				},
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Nome*"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.name ?? "",
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							placeholder: "Ex.: 8º A"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Escola"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.school_id ?? void 0,
							onValueChange: (v) => setForm({
								...form,
								school_id: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sem escola" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: schools.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.id,
								children: s.name
							}, s.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Série"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.grade ?? "",
								onChange: (e) => setForm({
									...form,
									grade: e.target.value
								}),
								placeholder: "Ex.: 8º ano"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Ano letivo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.school_year ?? "",
								onChange: (e) => setForm({
									...form,
									school_year: e.target.value ? Number(e.target.value) : null
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Turno"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.shift ?? void 0,
							onValueChange: (v) => setForm({
								...form,
								shift: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(shiftLabels).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s,
								children: shiftLabels[s]
							}, s)) })]
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
//#endregion
export { ClassesPage as component };
