import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { f as Outlet, g as Link, l as useRouterState, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { Et as ChevronDown, G as LogOut, H as Menu, J as LifeBuoy, Nt as Building2, Y as LayoutDashboard, at as FileText, b as Shield, it as FlaskConical, kt as ChartColumn, n as X, pt as DollarSign, x as ShieldCheck, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as useAuth } from "./use-auth-CwvrlDNK.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useIsPlatformAdmin } from "./use-admin-4ZxV4WX8.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { t as ThemeToggle } from "./theme-toggle-CXfE45vU.mjs";
import { t as AdminDashboard } from "./admin-dashboard-CJcvFjst.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DUFpIDms.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var navItems = [
	{
		to: "/admin/dashboard",
		label: "Dashboard SaaS",
		icon: LayoutDashboard
	},
	{
		to: "/admin/clients",
		label: "Clientes",
		icon: Building2
	},
	{
		to: "/admin/financial",
		label: "Financeiro",
		icon: DollarSign,
		need: "finance"
	},
	{
		to: "/admin/support",
		label: "Suporte",
		icon: LifeBuoy,
		need: "support"
	},
	{
		to: "/admin/administrators",
		label: "Administradores",
		icon: ShieldCheck,
		need: "super"
	},
	{
		to: "/admin/logs",
		label: "Logs",
		icon: FileText
	},
	{
		to: "/admin/monitoring",
		label: "Monitoramento",
		icon: ChartColumn,
		need: "ops"
	},
	{
		to: "/admin/demo",
		label: "Ambiente Demo",
		icon: FlaskConical,
		need: "super"
	}
];
function AdminShell({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const perms = useIsPlatformAdmin();
	const items = navItems.filter((i) => {
		if (!i.need) return true;
		if (i.need === "super") return perms.isSuperAdmin;
		if (i.need === "finance") return perms.isFinance;
		if (i.need === "support") return perms.isSupport;
		if (i.need === "ops") return perms.isOps;
		return false;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "relative z-10 hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar/95 backdrop-blur lg:flex lg:flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { items })
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
					items,
					onNavigate: () => setOpen(false)
				})]
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3.5 w-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold uppercase tracking-wider text-foreground",
								children: "Área da Plataforma"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Voltar ao app"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, { className: "min-h-10 min-w-10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, {})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-4 py-6 lg:px-8 lg:py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-full max-w-7xl animate-fade-up",
						children
					})
				})]
			})
		]
	});
}
function SidebarContent({ items, onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/admin/dashboard",
		onClick: onNavigate,
		className: "flex items-center gap-2.5 px-5 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-hero shadow-glow",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 truncate text-[11px] text-sidebar-foreground/60",
				children: "Super Admin"
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex-1 space-y-0.5 overflow-y-auto px-3 pb-4",
		children: items.map((item) => {
			const active = pathname === item.to || pathname.startsWith(item.to + "/");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("h-4 w-4 shrink-0", active && "text-primary") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: item.label
				})]
			}, item.to);
		})
	})] });
}
function UserMenu() {
	const router = useRouter();
	const qc = useQueryClient();
	const { user } = useAuth();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => setOpen((o) => !o),
			className: "min-h-10 gap-2 rounded-full pl-1 pr-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground shadow-soft",
				children: (user?.email?.[0] ?? "A").toUpperCase()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-pop",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border/60 px-3 py-2.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate text-xs text-muted-foreground",
					children: user?.email
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setOpen(false);
					signOut.mutate();
				},
				className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-destructive/15 hover:text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sair"]
			})]
		})] })]
	});
}
function AdminLayout() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: pathname === "/admin" || pathname === "/admin/" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboard, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AdminLayout as component };
