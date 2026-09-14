import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as Plus } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.support-DiwT-VHg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupportPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const tickets = useQuery({
		queryKey: ["admin-tickets"],
		queryFn: async () => {
			const { data, error } = await supabase.from("support_tickets").select("id, subject, priority, status, created_at, resolved_at, description, tenant:tenants(name)").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const tenants = useQuery({
		queryKey: ["admin-tenants-list"],
		queryFn: async () => (await supabase.from("tenants").select("id, name").order("name")).data ?? []
	});
	const [form, setForm] = (0, import_react.useState)({
		tenant_id: "",
		subject: "",
		description: "",
		priority: "normal"
	});
	const create = useMutation({
		mutationFn: async () => {
			const { data: u } = await supabase.auth.getUser();
			const { error } = await supabase.from("support_tickets").insert({
				tenant_id: form.tenant_id || null,
				subject: form.subject,
				description: form.description || null,
				priority: form.priority,
				opened_by: u.user?.id
			});
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-tickets"] });
			toast.success("Ticket criado");
			setOpen(false);
			setForm({
				tenant_id: "",
				subject: "",
				description: "",
				priority: "normal"
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const updateStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const patch = { status };
			if (status === "resolved" || status === "closed") patch.resolved_at = (/* @__PURE__ */ new Date()).toISOString();
			const { error } = await supabase.from("support_tickets").update(patch).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tickets"] })
	});
	const filtered = (tickets.data ?? []).filter((t) => filter === "all" || t.status === filter);
	const prioColor = {
		low: "bg-muted text-muted-foreground",
		normal: "bg-primary/15 text-primary",
		high: "bg-warning/20 text-warning",
		urgent: "bg-destructive/20 text-destructive"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold lg:text-3xl",
				children: "Suporte"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Chamados dos clientes"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filter,
					onValueChange: (v) => setFilter(v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Todos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "open",
							children: "Aberto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "pending",
							children: "Pendente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "resolved",
							children: "Resolvido"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "closed",
							children: "Fechado"
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Novo ticket"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Novo chamado" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cliente (opcional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.tenant_id,
								onValueChange: (v) => setForm({
									...form,
									tenant_id: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sem cliente" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (tenants.data ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t.id,
									children: t.name
								}, t.id)) })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assunto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.subject,
								onChange: (e) => setForm({
									...form,
									subject: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrição" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: form.description,
								onChange: (e) => setForm({
									...form,
									description: e.target.value
								}),
								rows: 4
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prioridade" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.priority,
								onValueChange: (v) => setForm({
									...form,
									priority: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "low",
										children: "Baixa"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "normal",
										children: "Normal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "high",
										children: "Alta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "urgent",
										children: "Urgente"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => create.mutate(),
								disabled: create.isPending || !form.subject,
								children: "Criar"
							})
						]
					})] })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				tickets.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-muted-foreground",
					children: "Carregando..."
				}),
				!tickets.isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-8 text-center text-muted-foreground",
					children: "Nenhum ticket."
				}),
				filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: prioColor[t.priority],
										children: t.priority
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold",
										children: t.subject
									})]
								}),
								t.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm text-muted-foreground",
									children: t.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.tenant?.name ?? "Sem cliente" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(t.created_at).toLocaleString("pt-BR") })
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: t.status,
							onValueChange: (v) => updateStatus.mutate({
								id: t.id,
								status: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 w-32",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "open",
									children: "Aberto"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "pending",
									children: "Pendente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "resolved",
									children: "Resolvido"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "closed",
									children: "Fechado"
								})
							] })]
						})]
					})
				}, t.id))
			]
		})]
	});
}
//#endregion
export { SupportPage as component };
