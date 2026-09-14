import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { f as Outlet, g as Link, l as useRouterState, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Activity, Et as ChevronDown, Ft as BookOpen, G as LogOut, H as Menu, Nt as Building2, S as ShieldAlert, Y as LayoutDashboard, _t as Clock, b as Shield, d as TrendingUp, et as HeartPulse, i as UsersRound, kt as ChartColumn, n as X, nt as GraduationCap, q as LoaderCircle, r as Users, t as Zap, vt as ClipboardList, w as Settings, y as Sparkles } from "../_libs/lucide-react.mjs";
import { t as useAuth } from "./use-auth-CwvrlDNK.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useIsPlatformAdmin } from "./use-admin-4ZxV4WX8.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { t as ThemeToggle } from "./theme-toggle-CXfE45vU.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { n as useProfile, t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DSUnwV78.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var typeOptions = [
	{
		value: "professor",
		label: "Professor independente"
	},
	{
		value: "school",
		label: "Escola"
	},
	{
		value: "academy",
		label: "Academia"
	},
	{
		value: "club",
		label: "Clube esportivo"
	},
	{
		value: "personal_trainer",
		label: "Personal Trainer"
	}
];
function OnboardingDialog() {
	const [name, setName] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("professor");
	const qc = useQueryClient();
	const create = useMutation({
		mutationFn: async () => {
			const { data, error } = await supabase.rpc("create_tenant_with_owner", {
				_name: name.trim(),
				_type: type
			});
			if (error) throw error;
			return data;
		},
		onSuccess: async () => {
			toast.success("Espaço criado! Bem-vindo.");
			await Promise.all([
				qc.invalidateQueries({ queryKey: ["current-tenant"] }),
				qc.invalidateQueries({ queryKey: ["tenant-membership"] }),
				qc.invalidateQueries({ queryKey: ["user-profile"] }),
				qc.invalidateQueries({ queryKey: ["onboarding-status"] }),
				qc.refetchQueries({ queryKey: ["my-memberships"] }),
				qc.refetchQueries({ queryKey: ["profile"] })
			]);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar espaço")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			onPointerDownOutside: (e) => e.preventDefault(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero shadow-glow",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6 text-white" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-center font-display text-2xl",
					children: "Vamos configurar seu espaço"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-center",
					children: "Dê um nome ao seu ambiente — pode ser sua escola, academia ou seu próprio nome."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					if (name.trim().length >= 2) create.mutate();
				},
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tname",
							children: "Nome do espaço"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tname",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Ex.: Escola Estrela / Academia X / Prof. João",
							required: true,
							minLength: 2,
							maxLength: 80
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tipo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: type,
							onValueChange: (v) => setType(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: typeOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: o.value,
								children: o.label
							}, o.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
						disabled: create.isPending || name.trim().length < 2,
						children: [create.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Criar meu espaço"]
					})
				]
			})]
		})
	});
}
/**
* Server-backed impersonation state — persists across reloads and tabs.
* Subscribes to Realtime updates on profiles to invalidate other tabs
* when impersonation starts or ends.
*/
function useImpersonation() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["impersonation", user?.id],
		enabled: !!user,
		refetchOnWindowFocus: true,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("impersonating_tenant_id, impersonation_original_tenant_id, impersonation_started_at, tenant:tenants!profiles_impersonating_tenant_id_fkey(id,name)").eq("id", user.id).maybeSingle();
			if (error) throw error;
			if (!data?.impersonating_tenant_id) return null;
			const tenant = data.tenant;
			return {
				tenantId: data.impersonating_tenant_id,
				tenantName: tenant?.name ?? "Cliente",
				originalTenantId: data.impersonation_original_tenant_id ?? null,
				startedAt: data.impersonation_started_at ?? null
			};
		}
	});
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		const channel = supabase.channel(`impersonation:${user.id}:${Math.random().toString(36).slice(2)}`);
		channel.on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "profiles",
			filter: `id=eq.${user.id}`
		}, (payload) => {
			const next = payload.new;
			const prev = payload.old;
			qc.invalidateQueries({ queryKey: ["impersonation", user.id] });
			if ((prev?.impersonating_tenant_id ?? null) !== (next.impersonating_tenant_id ?? null)) qc.clear();
		});
		channel.subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [user?.id, qc]);
	return q.data ?? null;
}
function formatElapsed(from, to) {
	const s = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 1e3));
	const h = Math.floor(s / 3600);
	const m = Math.floor(s % 3600 / 60);
	const sec = s % 60;
	if (h > 0) return `${h}h ${m}m`;
	if (m > 0) return `${m}m ${sec}s`;
	return `${sec}s`;
}
function ImpersonationBanner() {
	const state = useImpersonation();
	const qc = useQueryClient();
	const router = useRouter();
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		if (!state?.startedAt) return;
		const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(id);
	}, [state?.startedAt]);
	const exit = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc("end_impersonation");
			if (error) throw error;
		},
		onSuccess: async () => {
			await qc.cancelQueries();
			qc.clear();
			toast.success("Voltou para sua conta");
			router.navigate({
				to: "/admin/clients",
				replace: true
			});
		},
		onError: (e) => toast.error(e.message)
	});
	if (!state) return null;
	const startedAt = state.startedAt ? new Date(state.startedAt) : null;
	const elapsed = startedAt ? formatElapsed(startedAt, now) : null;
	const sinceLabel = startedAt ? startedAt.toLocaleString("pt-BR", {
		dateStyle: "short",
		timeStyle: "short"
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-900 backdrop-blur dark:text-amber-100 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1 truncate",
				children: [
					"Você está acessando como ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: state.tenantName }),
					" (modo impersonação). Toda ação é registrada nos logs."
				]
			}),
			sinceLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "hidden items-center gap-1.5 rounded-md bg-background/50 px-2 py-1 text-xs font-medium md:inline-flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
					"desde ",
					sinceLabel,
					elapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-amber-700 dark:text-amber-200/80",
						children: ["· ", elapsed]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => exit.mutate(),
				disabled: exit.isPending,
				className: "gap-1.5 border-amber-600/40 bg-background/60 hover:bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), "Voltar para minha conta"]
			})
		]
	});
}
var navSections = [
	{
		label: "Professor",
		items: [
			{
				to: "/dashboard",
				label: "Dashboard",
				icon: LayoutDashboard,
				tooltip: "Visão geral da turma"
			},
			{
				to: "/quick-eval",
				label: "Modo Quadra",
				icon: Zap,
				tooltip: "Avaliação rápida em campo"
			},
			{
				to: "/students",
				label: "Alunos",
				icon: Users,
				tooltip: "Cadastro e perfil dos alunos"
			},
			{
				to: "/evaluations",
				label: "Avaliações",
				icon: ClipboardList,
				tooltip: "Histórico de avaliações"
			},
			{
				to: "/classes",
				label: "Turmas",
				icon: GraduationCap,
				tooltip: "Turmas e dashboards por turma"
			},
			{
				to: "/groups",
				label: "Grupos",
				icon: UsersRound,
				tooltip: "Grupos esportivos e projetos"
			},
			{
				to: "/schools",
				label: "Escolas",
				icon: Building2,
				tooltip: "Escolas e dashboards institucionais"
			},
			{
				to: "/reports",
				label: "Relatórios",
				icon: ChartColumn,
				tooltip: "Relatórios em PDF e exportações"
			},
			{
				to: "/risk",
				label: "Saúde e Risco",
				icon: HeartPulse,
				tooltip: "Mapa de risco e alertas"
			}
		]
	},
	{
		label: "Gestão",
		adminOnly: true,
		items: [{
			to: "/team",
			label: "Equipe",
			icon: Sparkles,
			tooltip: "Convites e membros do tenant"
		}, {
			to: "/settings",
			label: "Configurações",
			icon: Settings,
			tooltip: "Branding, plano e preferências"
		}]
	},
	{
		label: "Inteligência",
		items: [{
			to: "/executive",
			label: "Dashboard Executivo",
			icon: TrendingUp,
			tooltip: "Visão estratégica consolidada"
		}, {
			to: "/knowledge",
			label: "Central de Conhecimento",
			icon: BookOpen,
			tooltip: "Metodologia e referências"
		}]
	}
];
function useVisibleSections(role) {
	const isAdmin = role === "admin";
	return navSections.filter((s) => !s.adminOnly || isAdmin);
}
function useCurrentPageLabel() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return [...navSections.flatMap((s) => s.items)].sort((a, b) => b.to.length - a.to.length).find((i) => pathname.startsWith(i.to))?.label ?? "";
}
function AppShell({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { tenant, role, hasNoTenant, isLoading } = useCurrentTenant();
	const { isAdmin: isPlatformAdmin, isLoading: isAdminLoading } = useIsPlatformAdmin();
	const pageLabel = useCurrentPageLabel();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-0 bg-gradient-mesh opacity-60",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "relative z-10 hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar/95 backdrop-blur lg:flex lg:flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {
					tenantName: tenant?.name,
					role
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				onClick: () => setOpen(false),
				className: "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
				initial: { x: -320 },
				animate: { x: 0 },
				exit: { x: -320 },
				transition: {
					type: "spring",
					damping: 24,
					stiffness: 240
				},
				className: "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => setOpen(false),
						"aria-label": "Fechar menu",
						className: "min-h-11 min-w-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {
					tenantName: tenant?.name,
					role,
					onNavigate: () => setOpen(false)
				})]
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpersonationBanner, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl lg:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "min-h-11 min-w-11 lg:hidden",
								onClick: () => setOpen(true),
								"aria-label": "Abrir menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-medium",
										children: tenant?.name ?? (isLoading ? "Carregando…" : "ProMetric")
									}), pageLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground/40",
										children: "/"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-foreground",
										children: pageLabel
									})] })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLink, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, { className: "min-h-10 min-w-10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, {})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "flex-1 px-4 py-6 lg:px-8 lg:py-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto w-full max-w-7xl animate-fade-up",
							children
						})
					})
				]
			}),
			!isLoading && !isAdminLoading && !isPlatformAdmin && hasNoTenant && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingDialog, {})
		]
	});
}
function SidebarContent({ tenantName, role, onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const sections = useVisibleSections(role);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/dashboard",
			onClick: onNavigate,
			className: "flex items-center gap-2.5 px-5 py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-hero shadow-glow",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
					className: "h-5 w-5 text-white",
					strokeWidth: 2.5
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-base font-bold leading-none",
					children: ["Pro", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gradient-brand",
						children: "Metric"
					})]
				}), tenantName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 truncate text-[11px] text-sidebar-foreground/60",
					children: tenantName
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "flex-1 space-y-5 overflow-y-auto px-3 pb-4",
			children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40",
				children: section.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: section.items.map((item) => {
					const active = pathname === item.to || pathname.startsWith(item.to + "/");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						onClick: onNavigate,
						title: item.tooltip ?? item.label,
						"aria-label": item.label,
						className: cn("group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ease-out-soft", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"),
						children: [
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								layoutId: "nav-active",
								className: "absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-gradient-brand",
								transition: {
									type: "spring",
									damping: 30,
									stiffness: 350
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: item.label
							})
						]
					}, item.to);
				})
			})] }, section.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-sidebar-border p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-lg bg-sidebar-accent/40 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-medium text-sidebar-foreground/80",
					children: role === "admin" ? "Administrador" : role === "evaluator" ? "Avaliador" : role === "viewer" ? "Visualizador" : "Conectado"
				})]
			})
		})
	] });
}
function AdminLink() {
	const { isAdmin } = useIsPlatformAdmin();
	if (!isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/admin/dashboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			className: "hidden gap-1.5 md:inline-flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3.5 w-3.5" }), " Admin"]
		})
	});
}
function UserMenu() {
	const router = useRouter();
	const qc = useQueryClient();
	const { user } = useAuth();
	const profile = useProfile();
	const [open, setOpen] = (0, import_react.useState)(false);
	const signOut = useMutation({
		mutationFn: async () => {
			await qc.cancelQueries();
			qc.clear();
			await supabase.auth.signOut();
		},
		onSuccess: () => router.navigate({
			to: "/auth",
			replace: true
		})
	});
	const impersonation = useImpersonation();
	const name = profile.data?.full_name ?? user?.email ?? "Usuário";
	const initial = (name?.[0] ?? "U").toUpperCase();
	const email = user?.email ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => setOpen((o) => !o),
			className: cn("min-h-10 gap-2 rounded-full pl-1 pr-2.5", impersonation && "ring-2 ring-amber-500/70 ring-offset-2 ring-offset-background"),
			"aria-label": "Abrir menu do usuário",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-primary-foreground shadow-soft", impersonation ? "bg-amber-500 text-amber-950" : "bg-gradient-brand"),
				title: impersonation ? `Impersonando ${impersonation.tenantName}` : void 0,
				children: impersonation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" }) : initial
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: -6,
				scale: .98
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			transition: {
				duration: .16,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-pop",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border/60 px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-sm font-semibold text-popover-foreground",
						children: name
					}), email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-xs text-muted-foreground",
						children: email
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/settings",
					onClick: () => setOpen(false),
					className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-accent/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" }), " Configurações"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						setOpen(false);
						signOut.mutate();
					},
					className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-destructive/15 hover:text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sair"]
				})
			]
		})] })]
	});
}
function AuthLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AuthLayout as component };
