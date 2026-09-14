import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { Bt as Activity, d as TrendingUp, mt as Database, r as Users } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.monitoring-CksHsDy8.js
var import_jsx_runtime = require_jsx_runtime();
function MonitoringPage() {
	const { data } = useQuery({
		queryKey: ["admin-monitoring"],
		queryFn: async () => {
			const since = (/* @__PURE__ */ new Date(Date.now() - 7 * 864e5)).toISOString();
			const [students, evalsTotal, evals7d, users, tenants] = await Promise.all([
				supabase.from("students").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("evaluations").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("evaluations").select("id, created_at").gte("created_at", since),
				supabase.from("profiles").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("tenants").select("created_at")
			]);
			const evalsByDay = {};
			(evals7d.data ?? []).forEach((e) => {
				const d = new Date(e.created_at).toLocaleDateString("pt-BR");
				evalsByDay[d] = (evalsByDay[d] ?? 0) + 1;
			});
			const tenantsByMonth = {};
			(tenants.data ?? []).forEach((t) => {
				const d = new Date(t.created_at);
				const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
				tenantsByMonth[k] = (tenantsByMonth[k] ?? 0) + 1;
			});
			return {
				students: students.count ?? 0,
				evaluations: evalsTotal.count ?? 0,
				users: users.count ?? 0,
				evals7d: (evals7d.data ?? []).length,
				evalsByDay,
				tenantsByMonth
			};
		}
	});
	const cards = [
		{
			label: "Total de usuários",
			value: data?.users ?? 0,
			icon: Users
		},
		{
			label: "Total de alunos",
			value: data?.students ?? 0,
			icon: Users
		},
		{
			label: "Avaliações totais",
			value: data?.evaluations ?? 0,
			icon: Activity
		},
		{
			label: "Avaliações (7 dias)",
			value: data?.evals7d ?? 0,
			icon: TrendingUp
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold lg:text-3xl",
				children: "Monitoramento"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Saúde operacional e crescimento"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-4 w-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-2xl font-bold",
							children: c.value.toLocaleString("pt-BR")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: c.label
						})
					]
				}, c.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5" }), " Avaliações por dia (7d)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [Object.entries(data?.evalsByDay ?? {}).map(([d, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-24 text-muted-foreground",
									children: d
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 rounded-full bg-primary/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full rounded-full bg-primary",
											style: { width: `${Math.min(100, n * 8)}%` }
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-8 text-right font-semibold",
									children: n
								})
							]
						}, d)), Object.keys(data?.evalsByDay ?? {}).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground",
							children: "Sem dados."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" }), " Novos clientes por mês"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [Object.entries(data?.tenantsByMonth ?? {}).slice(-6).map(([m, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-24 text-muted-foreground",
									children: m
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 rounded-full bg-success/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full rounded-full bg-success",
											style: { width: `${Math.min(100, n * 12)}%` }
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-8 text-right font-semibold",
									children: n
								})
							]
						}, m)), Object.keys(data?.tenantsByMonth ?? {}).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground",
							children: "Sem dados."
						})]
					})]
				})]
			})
		]
	});
}
//#endregion
export { MonitoringPage as component };
