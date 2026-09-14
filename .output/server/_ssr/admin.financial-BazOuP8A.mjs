import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as Plus, pt as DollarSign } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.financial-BazOuP8A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fmt = (cents) => (cents / 100).toLocaleString("pt-BR", {
	style: "currency",
	currency: "BRL"
});
function FinancialPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const payments = useQuery({
		queryKey: ["admin-payments"],
		queryFn: async () => {
			const { data, error } = await supabase.from("payments").select("id, amount_cents, status, method, paid_at, notes, tenant:tenants(name)").order("paid_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const subs = useQuery({
		queryKey: ["admin-subs-finance"],
		queryFn: async () => (await supabase.from("subscriptions").select("status, amount_cents, billing_cycle")).data ?? []
	});
	const tenants = useQuery({
		queryKey: ["admin-tenants-list"],
		queryFn: async () => (await supabase.from("tenants").select("id, name").order("name")).data ?? []
	});
	const [form, setForm] = (0, import_react.useState)({
		tenant_id: "",
		amount: "",
		status: "paid",
		method: "pix",
		notes: ""
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!form.tenant_id) throw new Error("Selecione um cliente");
			const { error } = await supabase.from("payments").insert({
				tenant_id: form.tenant_id,
				amount_cents: Math.round(parseFloat(form.amount) * 100),
				status: form.status,
				method: form.method,
				notes: form.notes || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-payments"] });
			toast.success("Pagamento registrado");
			setOpen(false);
			setForm({
				tenant_id: "",
				amount: "",
				status: "paid",
				method: "pix",
				notes: ""
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const active = (subs.data ?? []).filter((s) => s.status === "active");
	const mrr = active.reduce((a, s) => a + (s.billing_cycle === "yearly" ? s.amount_cents / 12 : s.amount_cents), 0);
	const arr = mrr * 12;
	const payingClients = new Set(active.map((_, i) => i)).size;
	const ticket = active.length > 0 ? mrr / active.length : 0;
	const now = /* @__PURE__ */ new Date();
	const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startYear = new Date(now.getFullYear(), 0, 1);
	const paid = (payments.data ?? []).filter((p) => p.status === "paid");
	const monthRev = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= startMonth).reduce((a, p) => a + p.amount_cents, 0);
	const yearRev = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= startYear).reduce((a, p) => a + p.amount_cents, 0);
	const kpis = [
		{
			label: "MRR",
			value: fmt(mrr)
		},
		{
			label: "ARR",
			value: fmt(arr)
		},
		{
			label: "Receita do mês",
			value: fmt(monthRev)
		},
		{
			label: "Receita do ano",
			value: fmt(yearRev)
		},
		{
			label: "Clientes pagantes",
			value: payingClients.toString()
		},
		{
			label: "Ticket médio",
			value: fmt(ticket)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold lg:text-3xl",
					children: "Financeiro"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "MRR, ARR e histórico de pagamentos"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Lançar pagamento"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Novo pagamento" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cliente" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.tenant_id,
								onValueChange: (v) => setForm({
									...form,
									tenant_id: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione..." }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (tenants.data ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t.id,
									children: t.name
								}, t.id)) })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Valor (R$)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.01",
									value: form.amount,
									onChange: (e) => setForm({
										...form,
										amount: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Método" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.method,
									onValueChange: (v) => setForm({
										...form,
										method: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "pix",
											children: "PIX"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "boleto",
											children: "Boleto"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "credit_card",
											children: "Cartão"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "transfer",
											children: "Transferência"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "other",
											children: "Outro"
										})
									] })]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.status,
								onValueChange: (v) => setForm({
									...form,
									status: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "paid",
										children: "Pago"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "pending",
										children: "Pendente"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "failed",
										children: "Falhou"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "refunded",
										children: "Reembolsado"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Observações" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.notes,
								onChange: (e) => setForm({
									...form,
									notes: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => create.mutate(),
								disabled: create.isPending,
								children: "Registrar"
							})
						]
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6",
				children: kpis.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-success" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-xl font-bold",
							children: k.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: k.label
						})
					]
				}, k.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-1 text-sm font-semibold",
						children: "Pagamentos recentes"
					}),
					payments.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground",
						children: "Carregando..."
					}),
					!payments.isLoading && (payments.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground",
						children: "Nenhum pagamento registrado."
					}),
					(payments.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-semibold",
									children: p.tenant?.name ?? "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "shrink-0 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold",
									children: fmt(p.amount_cents)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] uppercase text-muted-foreground",
									children: p.status
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 text-xs text-muted-foreground",
							children: ["Método: ", p.method ?? "—"]
						})]
					}, p.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "hidden overflow-hidden md:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border/60 px-4 py-3 text-sm font-semibold",
					children: "Pagamentos recentes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Data"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Cliente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Valor"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Método"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Status"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
							payments.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "px-4 py-8 text-center text-muted-foreground",
								children: "Carregando..."
							}) }),
							!payments.isLoading && (payments.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "px-4 py-8 text-center text-muted-foreground",
								children: "Nenhum pagamento registrado."
							}) }),
							(payments.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-medium",
										children: p.tenant?.name ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: fmt(p.amount_cents)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: p.method ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: p.status
									})
								]
							}, p.id))
						] })]
					})
				})]
			})
		]
	});
}
//#endregion
export { FinancialPage as component };
