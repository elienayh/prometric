import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { Nt as Building2, d as TrendingUp, nt as GraduationCap, pt as DollarSign, r as Users, vt as ClipboardList } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-dashboard-CJcvFjst.js
var import_jsx_runtime = require_jsx_runtime();
function fmtCurrency(cents) {
	return (cents / 100).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL"
	});
}
function AdminDashboard() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-saas-overview"],
		queryFn: async () => {
			const [tenants, students, evaluations, users, subs, payments] = await Promise.all([
				supabase.from("tenants").select("id, created_at", { count: "exact" }),
				supabase.from("students").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("evaluations").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("profiles").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("subscriptions").select("status, amount_cents, billing_cycle"),
				supabase.from("payments").select("amount_cents, paid_at, status").eq("status", "paid")
			]);
			const subsArr = subs.data ?? [];
			const active = subsArr.filter((s) => s.status === "active").length;
			const trial = subsArr.filter((s) => s.status === "trial").length;
			const suspended = subsArr.filter((s) => s.status === "suspended").length;
			const paying = subsArr.filter((s) => s.status === "active" && (s.amount_cents ?? 0) > 0).length;
			const free = subsArr.filter((s) => s.status === "active" && (s.amount_cents ?? 0) === 0).length;
			const overdue = subsArr.filter((s) => s.status === "past_due" || s.status === "suspended").length;
			const canceled = subsArr.filter((s) => s.status === "canceled").length;
			const mrr = subsArr.filter((s) => s.status === "active").reduce((acc, s) => acc + (s.billing_cycle === "yearly" ? s.amount_cents / 12 : s.amount_cents), 0);
			const arr = mrr * 12;
			const now = /* @__PURE__ */ new Date();
			const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const monthRevenue = (payments.data ?? []).filter((p) => p.paid_at && new Date(p.paid_at) >= startMonth).reduce((a, p) => a + p.amount_cents, 0);
			return {
				totalTenants: tenants.count ?? 0,
				active,
				trial,
				suspended,
				paying,
				free,
				overdue,
				canceled,
				students: students.count ?? 0,
				evaluations: evaluations.count ?? 0,
				users: users.count ?? 0,
				mrr,
				arr,
				monthRevenue
			};
		}
	});
	const stats = [
		{
			label: "Pagantes",
			value: data?.paying ?? 0,
			icon: DollarSign,
			accent: "text-success"
		},
		{
			label: "Trial",
			value: data?.trial ?? 0,
			icon: TrendingUp,
			accent: "text-warning"
		},
		{
			label: "Gratuitos",
			value: data?.free ?? 0,
			icon: Users,
			accent: "text-muted-foreground"
		},
		{
			label: "Inadimplentes",
			value: data?.overdue ?? 0,
			icon: Building2,
			accent: "text-destructive"
		},
		{
			label: "Cancelados",
			value: data?.canceled ?? 0,
			icon: Building2,
			accent: "text-muted-foreground"
		},
		{
			label: "Usuários",
			value: data?.users ?? 0,
			icon: Users,
			accent: "text-primary"
		},
		{
			label: "Alunos cadastrados",
			value: data?.students ?? 0,
			icon: GraduationCap,
			accent: "text-primary"
		},
		{
			label: "Avaliações",
			value: data?.evaluations ?? 0,
			icon: ClipboardList,
			accent: "text-primary"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight lg:text-3xl",
				children: "Dashboard SaaS"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Visão consolidada da plataforma ProMetric"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6",
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: s.accent }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 text-2xl font-bold",
							children: isLoading ? "—" : s.value.toLocaleString("pt-BR")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: s.label
						})
					]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }), " MRR"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-3xl font-bold text-success",
								children: fmtCurrency(data?.mrr ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Receita mensal recorrente"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }), " ARR"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-3xl font-bold",
								children: fmtCurrency(data?.arr ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Receita anual recorrente"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }), " Receita do mês"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-3xl font-bold text-primary",
								children: fmtCurrency(data?.monthRevenue ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: ["Pagamentos liquidados em ", (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { month: "long" })]
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { AdminDashboard as t };
