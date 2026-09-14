import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Activity, E as School, F as Play, It as Ban, K as LogIn, L as Pause, Nt as Building2, O as Save, at as FileText, b as Shield, nt as GraduationCap, p as Trash2, r as Users, tt as HardDrive, vt as ClipboardList, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useIsPlatformAdmin, t as logAudit } from "./use-admin-4ZxV4WX8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Route } from "./admin.clients._id-XHrX-VJP.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.clients._id-Ck6sArbf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	active: "Ativo",
	trial: "Trial",
	suspended: "Suspenso",
	blocked: "Bloqueado",
	canceled: "Cancelado"
};
var STATUS_VARIANT = {
	active: "default",
	trial: "secondary",
	suspended: "destructive",
	blocked: "destructive",
	canceled: "outline"
};
var fmtCurrency = (cents) => (cents / 100).toLocaleString("pt-BR", {
	style: "currency",
	currency: "BRL"
});
var fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
var fmtDateTime = (d) => d ? new Date(d).toLocaleString("pt-BR") : "—";
function ClientDetailPage() {
	const { id } = Route.useParams();
	const router = useRouter();
	const qc = useQueryClient();
	const perms = useIsPlatformAdmin();
	const tenantQ = useQuery({
		queryKey: ["admin-tenant", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("*, plan:plans(*)").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const countsQ = useQuery({
		queryKey: ["admin-tenant-counts", id],
		queryFn: async () => {
			const [students, evals, classes, groups, schools, members] = await Promise.all([
				supabase.from("students").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", id),
				supabase.from("evaluations").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", id),
				supabase.from("classes").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", id),
				supabase.from("groups").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", id),
				supabase.from("schools").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", id),
				supabase.from("tenant_members").select("id", {
					count: "exact",
					head: true
				}).eq("tenant_id", id)
			]);
			return {
				students: students.count ?? 0,
				evaluations: evals.count ?? 0,
				classes: classes.count ?? 0,
				groups: groups.count ?? 0,
				schools: schools.count ?? 0,
				members: members.count ?? 0
			};
		}
	});
	const subQ = useQuery({
		queryKey: ["admin-tenant-sub", id],
		queryFn: async () => {
			const { data } = await supabase.from("subscriptions").select("*, plan:plans(*)").eq("tenant_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
			return data;
		}
	});
	const paymentsQ = useQuery({
		queryKey: ["admin-tenant-payments", id],
		queryFn: async () => (await supabase.from("payments").select("*").eq("tenant_id", id).order("paid_at", { ascending: false }).limit(50)).data ?? []
	});
	const auditQ = useQuery({
		queryKey: ["admin-tenant-audit", id],
		queryFn: async () => (await supabase.from("audit_logs").select("*").eq("tenant_id", id).order("created_at", { ascending: false }).limit(100)).data ?? []
	});
	const ownerQ = useQuery({
		queryKey: ["admin-tenant-owner", id],
		enabled: !!tenantQ.data?.owner_id,
		queryFn: async () => {
			const ownerId = tenantQ.data.owner_id;
			const { data } = await supabase.from("profiles").select("id, email, full_name, avatar_url, created_at, updated_at").eq("id", ownerId).maybeSingle();
			return data;
		}
	});
	const ticketsQ = useQuery({
		queryKey: ["admin-tenant-tickets", id],
		queryFn: async () => (await supabase.from("support_tickets").select("*").eq("tenant_id", id).order("created_at", { ascending: false })).data ?? []
	});
	const plansQ = useQuery({
		queryKey: ["plans-all"],
		queryFn: async () => (await supabase.from("plans").select("*").order("sort_order")).data ?? []
	});
	const t = tenantQ.data;
	const plan = t?.plan;
	const sub = subQ.data;
	const counts = countsQ.data;
	const status = t?.status ?? (t?.is_active ? "active" : "suspended");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		type: "professor",
		contact_name: "",
		email: "",
		phone: "",
		cnpj: "",
		city: "",
		state: "",
		internal_notes: ""
	});
	const owner = ownerQ.data;
	(0, import_react.useEffect)(() => {
		if (!t) return;
		setForm({
			name: t.name ?? "",
			type: t.type ?? "professor",
			contact_name: t.contact_name || owner?.full_name || "",
			email: t.email || owner?.email || "",
			phone: t.phone ?? "",
			cnpj: t.cnpj ?? "",
			city: t.city ?? "",
			state: t.state ?? "",
			internal_notes: t.internal_notes ?? ""
		});
	}, [t?.id, owner?.id]);
	const saveGeneral = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("tenants").update(form).eq("id", id);
			if (error) throw error;
			await logAudit("tenant.updated", {
				entity_type: "tenant",
				entity_id: id,
				tenant_id: id
			});
		},
		onSuccess: () => {
			toast.success("Dados salvos");
			qc.invalidateQueries({ queryKey: ["admin-tenant", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const setStatus = useMutation({
		mutationFn: async (s) => {
			const patch = {
				status: s,
				is_active: s === "active" || s === "trial"
			};
			const { error } = await supabase.from("tenants").update(patch).eq("id", id);
			if (error) throw error;
			await logAudit(`tenant.status.${s}`, {
				entity_type: "tenant",
				entity_id: id,
				tenant_id: id
			});
		},
		onSuccess: (_d, s) => {
			toast.success(`Status: ${STATUS_LABEL[s]}`);
			qc.invalidateQueries({ queryKey: ["admin-tenant", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("tenants").delete().eq("id", id);
			if (error) throw error;
			await logAudit("tenant.deleted", {
				entity_type: "tenant",
				entity_id: id
			});
		},
		onSuccess: () => {
			toast.success("Cliente excluído");
			router.navigate({
				to: "/admin/clients",
				replace: true
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const impersonate = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc("impersonate_tenant", { _tenant: id });
			if (error) throw error;
		},
		onSuccess: async () => {
			await qc.cancelQueries();
			qc.clear();
			toast.success("Acessando como cliente");
			router.navigate({
				to: "/dashboard",
				replace: true
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const updateSub = useMutation({
		mutationFn: async (patch) => {
			const planId = patch.plan_id ?? null;
			if (planId) {
				const { error: tErr } = await supabase.from("tenants").update({ plan_id: planId }).eq("id", id);
				if (tErr) throw tErr;
			}
			if (!sub) {
				const { error } = await supabase.from("subscriptions").insert({
					tenant_id: id,
					...patch
				});
				if (error) throw error;
			} else {
				const { error } = await supabase.from("subscriptions").update(patch).eq("id", sub.id);
				if (error) throw error;
			}
			await logAudit("tenant.plan_overridden", {
				entity_type: "tenant",
				entity_id: id,
				tenant_id: id,
				metadata: {
					plan_id: planId,
					status: patch.status
				}
			});
		},
		onSuccess: () => {
			toast.success("Plano e assinatura atualizados");
			qc.invalidateQueries({ queryKey: ["admin-tenant-sub", id] });
			qc.invalidateQueries({ queryKey: ["admin-tenant", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (tenantQ.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-muted-foreground",
		children: "Carregando…"
	});
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-muted-foreground",
		children: "Cliente não encontrado."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin/clients",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Voltar"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-bold tracking-tight lg:text-3xl",
									children: t.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: STATUS_VARIANT[status],
									children: STATUS_LABEL[status]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs md:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Tipo"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium capitalize",
									children: t.type
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Plano"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: plan?.name ?? "—"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Cadastrado"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: fmtDate(t.created_at)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Último acesso"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: fmtDateTime(t.last_login_at)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2 md:col-span-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Tenant ID"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "truncate font-mono text-[11px]",
										children: t.id
									})]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							perms.isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								onClick: () => {
									if (confirm(`Entrar como "${t.name}"? Será registrado nos logs.`)) impersonate.mutate();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-3.5 w-3.5" }), " Acessar"]
							}),
							status !== "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								onClick: () => setStatus.mutate("active"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" }), " Reativar"]
							}),
							status !== "suspended" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								onClick: () => setStatus.mutate("suspended"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-3.5 w-3.5" }), " Suspender"]
							}),
							status !== "blocked" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5 text-destructive",
								onClick: () => setStatus.mutate("blocked"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-3.5 w-3.5" }), " Bloquear"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "destructive",
								size: "sm",
								className: "gap-1.5",
								onClick: () => {
									if (confirm(`EXCLUIR "${t.name}" e todos os dados? Esta ação é irreversível.`)) remove.mutate();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Excluir"]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: Users,
						label: "Alunos",
						value: counts?.students ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: ClipboardList,
						label: "Avaliações",
						value: counts?.evaluations ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: GraduationCap,
						label: "Turmas",
						value: counts?.classes ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: Shield,
						label: "Usuários",
						value: counts?.members ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: School,
						label: "Escolas",
						value: counts?.schools ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: Activity,
						label: "Último login",
						value: t.last_login_at ? fmtDate(t.last_login_at) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						icon: FileText,
						label: "Plano",
						value: plan?.name ?? "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "general",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex h-auto flex-wrap justify-start gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "general",
								children: "Dados gerais"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "subscription",
								children: "Plano e Cobrança"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "usage",
								children: "Utilização"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "access",
								children: "Acessos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "audit",
								children: "Auditoria"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "finance",
								children: "Financeiro"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "support",
								children: "Suporte"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "general",
						className: "space-y-4",
						children: [owner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Conta de acesso (login)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [owner.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: owner.avatar_url,
										alt: "",
										className: "h-14 w-14 rounded-full border border-border object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid h-14 w-14 place-items-center rounded-full bg-muted text-lg font-bold text-muted-foreground",
										children: (owner.full_name || owner.email || "?").charAt(0).toUpperCase()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "grid flex-1 grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "Nome (Google)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium",
												children: owner.full_name ?? "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "E-mail de login"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium break-all",
												children: owner.email ?? "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "Cadastrado em"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium",
												children: fmtDateTime(owner.created_at)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "User ID"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-mono text-[11px] break-all",
												children: owner.id
											})] })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: "Dados obtidos da conta de autenticação (Google/e-mail). O e-mail e nome abaixo podem ser editados independentemente para fins comerciais."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 md:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Nome da conta",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.name,
											onChange: (e) => setForm({
												...form,
												name: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Tipo de cliente",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.type,
											onValueChange: (v) => setForm({
												...form,
												type: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "professor",
													children: "Professor"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "school",
													children: "Escola"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "academy",
													children: "Academia"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "club",
													children: "Clube"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "personal_trainer",
													children: "Personal Trainer"
												})
											] })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Nome do responsável",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.contact_name,
											onChange: (e) => setForm({
												...form,
												contact_name: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "E-mail principal",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "email",
											value: form.email,
											onChange: (e) => setForm({
												...form,
												email: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Telefone",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.phone,
											onChange: (e) => setForm({
												...form,
												phone: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "CPF/CNPJ",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.cnpj,
											onChange: (e) => setForm({
												...form,
												cnpj: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Cidade",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.city,
											onChange: (e) => setForm({
												...form,
												city: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Estado",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.state,
											onChange: (e) => setForm({
												...form,
												state: e.target.value
											}),
											maxLength: 2
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "md:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Observações internas (somente super admin)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												rows: 4,
												value: form.internal_notes,
												onChange: (e) => setForm({
													...form,
													internal_notes: e.target.value
												}),
												placeholder: "Cliente piloto, isento de cobrança, atendimento prioritário…"
											})
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => saveGeneral.mutate(),
									disabled: saveGeneral.isPending,
									className: "gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Salvar alterações"]
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "subscription",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubscriptionTab, {
							tenantId: id,
							sub,
							plans: plansQ.data ?? [],
							onSave: (p) => updateSub.mutate(p),
							pending: updateSub.isPending
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "usage",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Limites do plano"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usage, {
										label: "Alunos",
										used: counts?.students ?? 0,
										max: plan?.max_students
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usage, {
										label: "Usuários",
										used: counts?.members ?? 0,
										max: plan?.max_users
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usage, {
										label: "Escolas",
										used: counts?.schools ?? 0,
										max: plan?.max_schools
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usage, {
										label: "Avaliações",
										used: counts?.evaluations ?? 0,
										max: plan?.max_evaluations
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usage, {
										label: "Turmas",
										used: counts?.classes ?? 0,
										max: null
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usage, {
										label: "Grupos",
										used: counts?.groups ?? 0,
										max: null
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 pt-2 text-sm text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, { className: "h-4 w-4" }), " Storage: integração futura"]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "access",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Últimos acessos"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Último login registrado"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: fmtDateTime(t.last_login_at)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "pt-2 text-xs text-muted-foreground",
									children: "Histórico detalhado de IP, dispositivo e navegador exige captura na camada de autenticação. Disponível em fase futura — a tabela está pronta para receber esses eventos."
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "audit",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-0 overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-b border-border/60 px-4 py-3 text-sm font-semibold",
									children: "Histórico de auditoria"
								}),
								auditQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 text-center text-sm text-muted-foreground",
									children: "Carregando…"
								}),
								!auditQ.isLoading && (auditQ.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 text-center text-sm text-muted-foreground",
									children: "Sem registros."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "divide-y divide-border/60",
									children: (auditQ.data ?? []).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "grid grid-cols-[1fr_auto] gap-2 px-4 py-2.5 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate font-mono text-xs",
												children: l.action
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "truncate text-xs text-muted-foreground",
												children: [
													l.actor_email ?? "—",
													" • ",
													l.entity_type ?? "—",
													l.entity_id ? ` #${String(l.entity_id).slice(0, 8)}` : ""
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "shrink-0 text-right text-xs text-muted-foreground",
											children: fmtDateTime(l.created_at)
										})]
									}, l.id))
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "finance",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-0 overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-b border-border/60 px-4 py-3 text-sm font-semibold",
									children: "Histórico de cobranças"
								}),
								paymentsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 text-center text-sm text-muted-foreground",
									children: "Carregando…"
								}),
								!paymentsQ.isLoading && (paymentsQ.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 text-center text-sm text-muted-foreground",
									children: "Nenhuma cobrança registrada. Stripe será conectado em fase futura."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "divide-y divide-border/60",
									children: (paymentsQ.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium",
												children: fmtCurrency(p.amount_cents)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs text-muted-foreground",
												children: [
													p.method ?? "—",
													" • ",
													fmtDateTime(p.paid_at)
												]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: p.status === "paid" ? "default" : p.status === "pending" ? "secondary" : "destructive",
												children: p.status
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[10px] text-muted-foreground",
												children: p.external_id ? `#${p.external_id.slice(0, 8)}` : ""
											})
										]
									}, p.id))
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "support",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-0 overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-b border-border/60 px-4 py-3 text-sm font-semibold",
									children: "Chamados"
								}),
								ticketsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 text-center text-sm text-muted-foreground",
									children: "Carregando…"
								}),
								!ticketsQ.isLoading && (ticketsQ.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 text-center text-sm text-muted-foreground",
									children: "Sem chamados."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "divide-y divide-border/60",
									children: (ticketsQ.data ?? []).map((tk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "px-4 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium",
													children: tk.subject
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														children: tk.priority
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: tk.status })]
												})]
											}),
											tk.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-muted-foreground",
												children: tk.description
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 text-xs text-muted-foreground",
												children: fmtDateTime(tk.created_at)
											})
										]
									}, tk.id))
								})
							]
						})
					})
				]
			})
		]
	});
}
function Kpi({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 truncate text-xl font-bold",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground",
				children: label
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "text-xs text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1",
		children
	})] });
}
function Usage({ label, used, max }) {
	const unlimited = !max || max <= 0;
	const pctVal = unlimited ? 0 : Math.min(100, Math.round(used / max * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-center justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground",
				children: [used, unlimited ? "" : ` / ${max}`]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: unlimited ? 0 : pctVal }),
		unlimited && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-[11px] text-muted-foreground",
			children: "Sem limite definido no plano"
		})
	] });
}
function SubscriptionTab({ sub, plans, onSave, pending }) {
	const [s, setS] = (0, import_react.useState)({
		plan_id: sub?.plan_id ?? "",
		status: sub?.status ?? "trial",
		billing_cycle: sub?.billing_cycle ?? "monthly",
		amount_cents: sub?.amount_cents ?? 0,
		amount_yearly_cents: sub?.amount_yearly_cents ?? 0,
		discount_cents: sub?.discount_cents ?? 0,
		trial_ends_at: sub?.trial_ends_at ? sub.trial_ends_at.slice(0, 10) : "",
		current_period_start: sub?.current_period_start ? sub.current_period_start.slice(0, 10) : "",
		current_period_end: sub?.current_period_end ? sub.current_period_end.slice(0, 10) : "",
		cancel_at_period_end: sub?.cancel_at_period_end ?? false
	});
	(0, import_react.useEffect)(() => {
		if (!sub) return;
		setS({
			plan_id: sub.plan_id ?? "",
			status: sub.status ?? "trial",
			billing_cycle: sub.billing_cycle ?? "monthly",
			amount_cents: sub.amount_cents ?? 0,
			amount_yearly_cents: sub.amount_yearly_cents ?? 0,
			discount_cents: sub.discount_cents ?? 0,
			trial_ends_at: sub.trial_ends_at ? sub.trial_ends_at.slice(0, 10) : "",
			current_period_start: sub.current_period_start ? sub.current_period_start.slice(0, 10) : "",
			current_period_end: sub.current_period_end ? sub.current_period_end.slice(0, 10) : "",
			cancel_at_period_end: !!sub.cancel_at_period_end
		});
	}, [sub?.id]);
	const valorFinal = Math.max(0, (s.billing_cycle === "yearly" ? s.amount_yearly_cents : s.amount_cents) - s.discount_cents);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Plano e situação"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Plano",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: s.plan_id || "none",
								onValueChange: (v) => setS({
									...s,
									plan_id: v === "none" ? "" : v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sem plano" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "none",
									children: "Sem plano"
								}), plans.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p.id,
									children: p.name
								}, p.id))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Situação",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: s.status,
								onValueChange: (v) => setS({
									...s,
									status: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "trial",
										children: "Trial"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "active",
										children: "Ativo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "suspended",
										children: "Suspenso"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "canceled",
										children: "Cancelado"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "past_due",
										children: "Inadimplente"
									})
								] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ciclo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: s.billing_cycle,
								onValueChange: (v) => setS({
									...s,
									billing_cycle: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "monthly",
									children: "Mensal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "yearly",
									children: "Anual"
								})] })]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Valores"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Valor mensal (R$)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								value: (s.amount_cents / 100).toString(),
								onChange: (e) => setS({
									...s,
									amount_cents: Math.round(parseFloat(e.target.value || "0") * 100)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Valor anual (R$)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								value: (s.amount_yearly_cents / 100).toString(),
								onChange: (e) => setS({
									...s,
									amount_yearly_cents: Math.round(parseFloat(e.target.value || "0") * 100)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Desconto (R$)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								value: (s.discount_cents / 100).toString(),
								onChange: (e) => setS({
									...s,
									discount_cents: Math.round(parseFloat(e.target.value || "0") * 100)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Valor final",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: fmtCurrency(valorFinal),
								disabled: true
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Datas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Trial até",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: s.trial_ends_at,
								onChange: (e) => setS({
									...s,
									trial_ends_at: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Início do ciclo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: s.current_period_start,
								onChange: (e) => setS({
									...s,
									current_period_start: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Renovação / vencimento",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: s.current_period_end,
								onChange: (e) => setS({
									...s,
									current_period_end: e.target.value
								})
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Stripe (integração futura)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 text-xs md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
								label: "Customer ID",
								value: sub?.stripe_customer_id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
								label: "Subscription ID",
								value: sub?.stripe_subscription_id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
								label: "Price ID",
								value: sub?.stripe_price_id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
								label: "Status do Stripe",
								value: sub?.stripe_status
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[11px] text-muted-foreground",
						children: "A integração com Stripe está preparada na base de dados. Os campos serão preenchidos automaticamente após a conexão."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: pending,
					className: "gap-1.5",
					onClick: () => onSave({
						plan_id: s.plan_id || null,
						status: s.status,
						billing_cycle: s.billing_cycle,
						amount_cents: s.amount_cents,
						amount_yearly_cents: s.amount_yearly_cents,
						discount_cents: s.discount_cents,
						trial_ends_at: s.trial_ends_at || null,
						current_period_start: s.current_period_start || null,
						current_period_end: s.current_period_end || null,
						cancel_at_period_end: s.cancel_at_period_end
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Salvar assinatura"]
				})
			})
		]
	});
}
function Info$1({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border/60 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 truncate font-mono",
			children: value || "—"
		})]
	});
}
//#endregion
export { ClientDetailPage as component };
