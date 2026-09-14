import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Pencil, P as Plus, i as UsersRound, kt as ChartColumn, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/groups.index-ChlSyK_M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GroupsPage() {
	const { tenantId } = useCurrentTenant();
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const list = useQuery({
		queryKey: ["groups", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("id,name,description,color").eq("tenant_id", tenantId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("groups").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Grupo removido");
			qc.invalidateQueries({ queryKey: ["groups"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Grupos",
			description: "Crie grupos personalizados — modalidade, turma, horário, equipe.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => {
					setEditing(null);
					setOpen(true);
				},
				className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), " Novo grupo"]
			})
		}),
		list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Carregando…"
		}) : (list.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nenhum grupo ainda",
			description: "Exemplos: Futebol Sub-13, Academia Manhã, Voleibol Feminino.",
			actionLabel: "Criar grupo",
			onAction: () => {
				setEditing(null);
				setOpen(true);
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: list.data.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-card p-5 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/groups/$id",
					params: { id: g.id },
					className: "flex items-start gap-3 hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate font-display font-semibold hover:text-primary hover:underline",
							children: g.name
						}), g.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 line-clamp-2 text-xs text-muted-foreground",
							children: g.description
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "min-h-11",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/groups/$id/dashboard",
								params: { id: g.id },
								"aria-label": `Abrir resumo do grupo ${g.name}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mr-1 h-3.5 w-3.5" }), " Resumo"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "min-h-11",
							onClick: () => {
								setEditing(g);
								setOpen(true);
							},
							"aria-label": `Editar grupo ${g.name}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-1 h-3.5 w-3.5" }), " Editar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => del.mutate(g.id),
							className: "min-h-11 min-w-11 text-destructive",
							"aria-label": `Excluir grupo ${g.name}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})
					]
				})]
			}, g.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupDialog, {
			open,
			onOpenChange: setOpen,
			editing,
			tenantId
		})
	] });
}
function GroupDialog({ open, onOpenChange, editing, tenantId }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(editing ?? {});
	const save = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant");
			if (!form.name) throw new Error("Nome obrigatório");
			const payload = {
				tenant_id: tenantId,
				name: form.name,
				description: form.description ?? null,
				color: form.color ?? null
			};
			if (editing) {
				const { error } = await supabase.from("groups").update(payload).eq("id", editing.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("groups").insert([payload]);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Atualizado" : "Criado");
			qc.invalidateQueries({ queryKey: ["groups"] });
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Editar grupo" : "Novo grupo" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
							placeholder: "Ex.: Futebol Sub-13"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Descrição"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							value: form.description ?? "",
							onChange: (e) => setForm({
								...form,
								description: e.target.value
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
//#endregion
export { GroupsPage as component };
