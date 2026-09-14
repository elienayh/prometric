import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as Play, K as LogIn, L as Pause, Nt as Building2, T as Search, ct as Eye, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useIsPlatformAdmin, t as logAudit } from "./use-admin-4ZxV4WX8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.clients.index-CoUy7We9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var accountStatusMap = {
	active: {
		label: "Ativa",
		variant: "default"
	},
	trial: {
		label: "Ativa",
		variant: "default"
	},
	suspended: {
		label: "Suspensa",
		variant: "secondary"
	},
	blocked: {
		label: "Bloqueada",
		variant: "destructive"
	},
	canceled: {
		label: "Cancelada",
		variant: "outline"
	}
};
function financialStatus(sub) {
	if (!sub) return {
		label: "Gratuito",
		variant: "outline"
	};
	switch (sub.status) {
		case "active": return (sub.amount_cents ?? 0) > 0 ? {
			label: "Pago",
			variant: "default"
		} : {
			label: "Gratuito",
			variant: "outline"
		};
		case "trial": return {
			label: "Trial",
			variant: "secondary"
		};
		case "past_due":
		case "suspended": return {
			label: "Atrasado",
			variant: "destructive"
		};
		case "canceled": return {
			label: "Cancelado",
			variant: "outline"
		};
		default: return {
			label: "—",
			variant: "outline"
		};
	}
}
function fmtDate(d) {
	return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}
function fmtDateTime(d) {
	return d ? new Date(d).toLocaleString("pt-BR", {
		dateStyle: "short",
		timeStyle: "short"
	}) : "Nunca";
}
function ClientsPage() {
	const qc = useQueryClient();
	const router = useRouter();
	const perms = useIsPlatformAdmin();
	const [search, setSearch] = (0, import_react.useState)("");
	const { data, isLoading } = useQuery({
		queryKey: ["admin-tenants-list"],
		queryFn: async () => {
			const [tRes, sRes] = await Promise.all([supabase.from("tenants").select("id, name, type, owner_id, is_active, status, last_login_at, created_at, plan:plans(name), subscriptions(status, amount_cents)").order("created_at", { ascending: false }), supabase.from("students").select("tenant_id")]);
			if (tRes.error) throw tRes.error;
			if (sRes.error) throw sRes.error;
			const counts = /* @__PURE__ */ new Map();
			for (const s of sRes.data ?? []) counts.set(s.tenant_id, (counts.get(s.tenant_id) ?? 0) + 1);
			return (tRes.data ?? []).map((t) => ({
				...t,
				_students: counts.get(t.id) ?? 0
			}));
		}
	});
	const toggleActive = useMutation({
		mutationFn: async ({ id, active }) => {
			const { error } = await supabase.from("tenants").update({
				is_active: active,
				status: active ? "active" : "suspended"
			}).eq("id", id);
			if (error) throw error;
			await logAudit(active ? "tenant.reactivated" : "tenant.suspended", {
				entity_type: "tenant",
				entity_id: id,
				tenant_id: id
			});
		},
		onSuccess: (_d, v) => {
			qc.invalidateQueries({ queryKey: ["admin-tenants-list"] });
			toast.success(v.active ? "Cliente reativado" : "Cliente suspenso");
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("tenants").delete().eq("id", id);
			if (error) throw error;
			await logAudit("tenant.deleted", {
				entity_type: "tenant",
				entity_id: id
			});
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-tenants-list"] });
			toast.success("Cliente excluído");
		},
		onError: (e) => toast.error(e.message)
	});
	const impersonate = useMutation({
		mutationFn: async (t) => {
			const { error } = await supabase.rpc("impersonate_tenant", { _tenant: t.id });
			if (error) throw error;
			return t;
		},
		onSuccess: async (t) => {
			await qc.cancelQueries();
			qc.clear();
			toast.success(`Acessando como ${t.name}`);
			router.navigate({
				to: "/dashboard",
				replace: true
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = (data ?? []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
	const goTo = (id) => router.navigate({
		to: "/admin/clients/$id",
		params: { id }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight lg:text-3xl",
					children: "Clientes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Gestão comercial dos tenants da plataforma"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Buscar cliente...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "w-64 pl-9"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 md:hidden",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground",
						children: "Carregando..."
					}),
					!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground",
						children: "Nenhum cliente encontrado."
					}),
					filtered.map((t) => {
						const acc = accountStatusMap[t.status ?? (t.is_active ? "active" : "suspended")] ?? accountStatusMap.active;
						const fin = financialStatus(t.subscriptions?.[0]);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							tabIndex: 0,
							role: "link",
							onClick: () => goTo(t.id),
							onKeyDown: (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									goTo(t.id);
								}
							},
							className: "cursor-pointer p-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-w-0 items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate font-semibold text-foreground",
											children: t.name
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: acc.variant,
										className: "shrink-0",
										children: acc.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 grid grid-cols-2 gap-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Tipo"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 font-medium",
											children: t.type
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Plano"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 font-medium",
											children: t.plan?.name ?? "—"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Financeiro"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: fin.variant,
												children: fin.label
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Alunos"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 font-medium",
											children: t._students
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Último acesso"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 font-medium",
											children: fmtDateTime(t.last_login_at)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Criado em"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 font-medium",
											children: fmtDate(t.created_at)
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap justify-end gap-1 border-t border-border/40 pt-3",
									onClick: (e) => e.stopPropagation(),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/admin/clients/$id",
											params: { id: t.id },
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												"aria-label": "Detalhes",
												className: "min-h-11 min-w-11",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
											})
										}),
										perms.isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											"aria-label": "Acessar como",
											className: "min-h-11 min-w-11",
											onClick: () => {
												if (confirm(`Entrar como "${t.name}"?`)) impersonate.mutate(t);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4 text-primary" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "min-h-11 min-w-11",
											onClick: () => toggleActive.mutate({
												id: t.id,
												active: !t.is_active
											}),
											children: t.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "min-h-11 min-w-11",
											onClick: () => {
												if (confirm(`Excluir "${t.name}"?`)) remove.mutate(t.id);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
										})
									]
								})
							]
						}, t.id);
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "hidden overflow-hidden md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Cliente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Tipo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Plano"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Conta"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Financeiro"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-right",
									children: "Alunos"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Último acesso"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left",
									children: "Criado em"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-right",
									children: "Ações"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
							isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 9,
								className: "px-4 py-8 text-center text-muted-foreground",
								children: "Carregando..."
							}) }),
							!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 9,
								className: "px-4 py-8 text-center text-muted-foreground",
								children: "Nenhum cliente encontrado."
							}) }),
							filtered.map((t) => {
								const acc = accountStatusMap[t.status ?? (t.is_active ? "active" : "suspended")] ?? accountStatusMap.active;
								const fin = financialStatus(t.subscriptions?.[0]);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									tabIndex: 0,
									role: "link",
									onClick: () => goTo(t.id),
									onKeyDown: (e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											goTo(t.id);
										}
									},
									className: "cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-2 font-medium text-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "underline-offset-4 hover:underline",
													children: t.name
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-muted-foreground",
											children: t.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: t.plan?.name ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: acc.variant,
												children: acc.label
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: fin.variant,
												children: fin.label
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right tabular-nums",
											children: t._students
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-muted-foreground",
											children: fmtDateTime(t.last_login_at)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-muted-foreground",
											children: fmtDate(t.created_at)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											onClick: (e) => e.stopPropagation(),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-end gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/admin/clients/$id",
														params: { id: t.id },
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "ghost",
															size: "icon",
															"aria-label": "Detalhes",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
														})
													}),
													perms.isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														size: "icon",
														"aria-label": "Acessar como",
														onClick: () => {
															if (confirm(`Entrar como "${t.name}"?`)) impersonate.mutate(t);
														},
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4 text-primary" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														size: "icon",
														onClick: () => toggleActive.mutate({
															id: t.id,
															active: !t.is_active
														}),
														children: t.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														size: "icon",
														onClick: () => {
															if (confirm(`Excluir "${t.name}"?`)) remove.mutate(t.id);
														},
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
													})
												]
											})
										})
									]
								}, t.id);
							})
						] })]
					})
				})
			})
		]
	});
}
//#endregion
export { ClientsPage as component };
