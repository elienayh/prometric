import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Pencil, Ot as ChartLine, P as Plus, T as Search, a as User, c as Upload, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Cyj8fg_M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/students.index-D0jQEo9D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function calcAge(birth) {
	const b = new Date(birth);
	const diff = Date.now() - b.getTime();
	return Math.floor(diff / (365.25 * 24 * 3600 * 1e3));
}
function StudentsPage() {
	const { tenantId } = useCurrentTenant();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const classes = useQuery({
		queryKey: ["classes-lite", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("classes").select("id,name").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const groups = useQuery({
		queryKey: ["groups-lite", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("id,name").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const list = useQuery({
		queryKey: ["students", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,class_id,group_id,phone,email,class:classes(name),group:groups(name)").eq("tenant_id", tenantId).eq("is_active", true).order("full_name");
			if (error) throw error;
			return data;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("students").update({ is_active: false }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Aluno arquivado");
			qc.invalidateQueries({ queryKey: ["students"] });
			qc.invalidateQueries({ queryKey: ["class-stats"] });
			qc.invalidateQueries({ queryKey: ["group-stats"] });
		}
	});
	const filtered = (0, import_react.useMemo)(() => {
		const all = list.data ?? [];
		if (!q.trim()) return all;
		const term = q.toLowerCase();
		return all.filter((s) => s.full_name.toLowerCase().includes(term));
	}, [list.data, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Alunos",
			description: "Cadastro central de alunos, atletas e clientes.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/students/import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1.5 h-4 w-4" }), " Importar"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), " Novo aluno"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-sm flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "pl-9",
					placeholder: "Buscar aluno…",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted-foreground",
				children: [filtered.length, " resultado(s)"]
			})]
		}),
		list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Carregando…"
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: q ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado",
			description: q ? "Tente outro termo de busca." : "Comece cadastrando seu primeiro aluno ou atleta.",
			actionLabel: q ? void 0 : "Cadastrar aluno",
			onAction: q ? void 0 : () => {
				setEditing(null);
				setOpen(true);
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: filtered.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group relative rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:border-primary/50",
				title: "Abrir ficha do aluno",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/students/$id",
						params: { id: s.id },
						"aria-label": `Abrir ficha completa de ${s.full_name}`,
						onKeyDown: (e) => {
							if (e.key === " ") {
								e.preventDefault();
								navigate({
									to: "/students/$id",
									params: { id: s.id }
								});
							}
						},
						className: "absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full items-start gap-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate font-display font-semibold group-hover:text-primary transition-colors",
								children: s.full_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									s.sex === "male" ? "Masc." : "Fem.",
									" • ",
									calcAge(s.birth_date),
									" anos"
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-1.5 text-[11px]",
						children: [s.class?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground",
							children: s.class.name
						}), s.group?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-accent/20 px-2 py-0.5 text-accent-foreground",
							children: s.group.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-20 mt-3 flex gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "min-h-11 flex-1",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/students/$id",
									params: { id: s.id },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { className: "mr-1 h-3.5 w-3.5" }), " Ficha completa"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "min-h-11 min-w-11",
								"aria-label": `Editar ${s.full_name}`,
								onClick: () => {
									setEditing(s);
									setOpen(true);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								"aria-label": `Arquivar ${s.full_name}`,
								onClick: () => {
									setToDelete(s);
								},
								className: "min-h-11 min-w-11 text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})
						]
					})
				]
			}, s.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentDialog, {
			open,
			onOpenChange: setOpen,
			editing,
			tenantId,
			classes: classes.data ?? [],
			groups: groups.data ?? []
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!toDelete,
			onOpenChange: (b) => !b && setToDelete(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Arquivar aluno?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: toDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: toDelete.full_name }), " será arquivado e deixará de aparecer nas listas, dashboards e rankings. As avaliações existentes serão preservadas no histórico, mas o aluno não poderá receber novas avaliações enquanto estiver arquivado."] }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancelar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				onClick: () => {
					if (toDelete) {
						del.mutate(toDelete.id);
						setToDelete(null);
					}
				},
				children: "Arquivar aluno"
			})] })] })
		})
	] });
}
function StudentDialog({ open, onOpenChange, editing, tenantId, classes, groups }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(editing ?? { sex: "male" });
	(0, import_react.useEffect)(() => {
		if (open) setForm(editing ?? { sex: "male" });
	}, [open, editing]);
	const save = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant");
			if (!form.full_name || !form.birth_date || !form.sex) throw new Error("Preencha os campos obrigatórios");
			const payload = {
				tenant_id: tenantId,
				full_name: form.full_name,
				sex: form.sex,
				birth_date: form.birth_date,
				class_id: form.class_id ?? null,
				group_id: form.group_id ?? null,
				phone: form.phone ?? null,
				email: form.email ?? null
			};
			if (editing) {
				const { error } = await supabase.from("students").update(payload).eq("id", editing.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("students").insert([payload]);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Aluno atualizado" : "Aluno cadastrado");
			qc.invalidateQueries({ queryKey: ["students"] });
			qc.invalidateQueries({ queryKey: ["class-stats"] });
			qc.invalidateQueries({ queryKey: ["group-stats"] });
			onOpenChange(false);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (b) => {
			if (b) setForm(editing ?? { sex: "male" });
			onOpenChange(b);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Editar aluno" : "Novo aluno" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
							children: "Nome completo*"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.full_name ?? "",
							onChange: (e) => setForm({
								...form,
								full_name: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Sexo*"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.sex ?? "male",
								onValueChange: (v) => setForm({
									...form,
									sex: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "male",
									children: "Masculino"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "female",
									children: "Feminino"
								})] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Nascimento*"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								required: true,
								value: form.birth_date ?? "",
								onChange: (e) => setForm({
									...form,
									birth_date: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Turma"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.class_id ?? void 0,
								onValueChange: (v) => setForm({
									...form,
									class_id: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id)) })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Grupo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.group_id ?? void 0,
								onValueChange: (v) => setForm({
									...form,
									group_id: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: g.id,
									children: g.name
								}, g.id)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Telefone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.phone ?? "",
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "E-mail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: form.email ?? "",
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								})
							})]
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
export { StudentsPage as component };
