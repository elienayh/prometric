import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Pencil, o as UserPlus, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader, t as EmptyState } from "./page-header-BgOgZloR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-CzwvkaSR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_LABEL = {
	admin: "Administrador",
	evaluator: "Avaliador",
	viewer: "Visualizador"
};
function TeamPage() {
	const { tenantId, role: myRole } = useCurrentTenant();
	const qc = useQueryClient();
	const [edit, setEdit] = (0, import_react.useState)(null);
	const isAdmin = myRole === "admin";
	const list = useQuery({
		queryKey: ["team-contacts", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("team_contacts").select("id,full_name,email,phone,role,notes").eq("tenant_id", tenantId).order("full_name");
			if (error) throw error;
			return data ?? [];
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("team_contacts").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Membro removido");
			qc.invalidateQueries({ queryKey: ["team-contacts"] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Equipe",
				description: "Cadastro manual de membros da equipe (nome, e-mail, telefone, função).",
				action: isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setEdit("new"),
					className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1.5 h-4 w-4" }), " Novo membro"]
				})
			}),
			list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Carregando…"
			}) : !list.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Sem membros cadastrados",
				description: isAdmin ? "Cadastre manualmente os membros da sua equipe." : "Aguardando administrador cadastrar membros.",
				actionLabel: isAdmin ? "Adicionar membro" : void 0,
				onAction: isAdmin ? () => setEdit("new") : void 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2 md:hidden",
				children: list.data.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-medium",
									children: m.full_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-xs text-muted-foreground",
									children: m.email ?? "—"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary",
								children: ROLE_LABEL[m.role]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-xs text-muted-foreground",
							children: m.phone ?? "—"
						}),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex justify-end gap-1 border-t border-border/40 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setEdit(m),
								"aria-label": "Editar",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => {
									if (confirm("Remover este membro?")) del.mutate(m.id);
								},
								className: "text-destructive",
								"aria-label": "Remover",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						})
					]
				}, m.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto rounded-2xl border border-border md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/40 text-xs uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left font-medium",
								children: "Nome"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left font-medium",
								children: "E-mail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left font-medium",
								children: "Telefone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left font-medium",
								children: "Função"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border bg-card",
						children: list.data.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium",
								children: m.full_name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: m.email ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: m.phone ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary",
									children: ROLE_LABEL[m.role]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right",
								children: isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => setEdit(m),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => {
											if (confirm("Remover este membro?")) del.mutate(m.id);
										},
										className: "text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								})
							})
						] }, m.id))
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "💡 O envio automático de convites por e-mail e o vínculo com contas de login serão liberados em fase futura."
			}),
			edit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactDialog, {
				tenantId,
				contact: edit === "new" ? null : edit,
				onClose: () => setEdit(null)
			})
		]
	});
}
function ContactDialog({ tenantId, contact, onClose }) {
	const qc = useQueryClient();
	const [fullName, setFullName] = (0, import_react.useState)(contact?.full_name ?? "");
	const [email, setEmail] = (0, import_react.useState)(contact?.email ?? "");
	const [phone, setPhone] = (0, import_react.useState)(contact?.phone ?? "");
	const [role, setRole] = (0, import_react.useState)(contact?.role ?? "evaluator");
	const save = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Sem tenant");
			const payload = {
				full_name: fullName,
				email: email || null,
				phone: phone || null,
				role
			};
			const db = supabase;
			if (contact) {
				const { error } = await db.from("team_contacts").update(payload).eq("id", contact.id);
				if (error) throw error;
			} else {
				const { error } = await db.from("team_contacts").insert([{
					...payload,
					tenant_id: tenantId
				}]);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(contact ? "Membro atualizado" : "Membro cadastrado");
			qc.invalidateQueries({ queryKey: ["team-contacts"] });
			onClose();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (b) => !b && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: contact ? "Editar membro" : "Novo membro" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
							value: fullName,
							onChange: (e) => setFullName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "E-mail"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "colega@escola.com"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Telefone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							placeholder: "(11) 99999-9999"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Função*"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: role,
							onValueChange: (v) => setRole(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "admin",
									children: "Administrador"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "evaluator",
									children: "Avaliador"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "viewer",
									children: "Visualizador"
								})
							] })]
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
//#endregion
export { TeamPage as component };
