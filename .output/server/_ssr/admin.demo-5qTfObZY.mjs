import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as RefreshCw, K as LogIn, it as FlaskConical, p as Trash2, y as Sparkles } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useIsPlatformAdmin } from "./use-admin-4ZxV4WX8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.demo-5qTfObZY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DemoEnvironmentPage() {
	const { isSuperAdmin, isLoading } = useIsPlatformAdmin();
	const qc = useQueryClient();
	const router = useRouter();
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const statsQ = useQuery({
		queryKey: ["admin-demo-stats"],
		enabled: !isLoading && isSuperAdmin,
		queryFn: async () => {
			const t = await supabase.from("tenants").select("id, name, created_at").eq("demo_data", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (t.error) throw t.error;
			if (!t.data) return {
				tenantId: null,
				tenantName: null,
				schools: 0,
				classes: 0,
				groups: 0,
				students: 0,
				evaluations: 0,
				team: 0,
				createdAt: null
			};
			const tid = t.data.id;
			const count = (q) => q.select("id", {
				count: "exact",
				head: true
			}).eq("tenant_id", tid);
			const [sc, cl, gr, st, ev, tc] = await Promise.all([
				count(supabase.from("schools")),
				count(supabase.from("classes")),
				count(supabase.from("groups")),
				count(supabase.from("students")),
				count(supabase.from("evaluations")),
				count(supabase.from("team_contacts"))
			]);
			return {
				tenantId: tid,
				tenantName: t.data.name,
				schools: sc.count ?? 0,
				classes: cl.count ?? 0,
				groups: gr.count ?? 0,
				students: st.count ?? 0,
				evaluations: ev.count ?? 0,
				team: tc.count ?? 0,
				createdAt: t.data.created_at
			};
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			const { data, error } = await supabase.rpc("create_demo_environment");
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			toast.success("Ambiente demonstrativo criado");
			qc.invalidateQueries({ queryKey: ["admin-demo-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const restore = useMutation({
		mutationFn: async () => {
			const { data, error } = await supabase.rpc("restore_demo_environment");
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			toast.success("Ambiente demonstrativo recriado");
			qc.invalidateQueries({ queryKey: ["admin-demo-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc("delete_demo_environment");
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Ambiente demonstrativo removido");
			setConfirmDelete(false);
			qc.invalidateQueries({ queryKey: ["admin-demo-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const enter = useMutation({
		mutationFn: async (tenantId) => {
			const { error } = await supabase.rpc("impersonate_tenant", { _tenant: tenantId });
			if (error) throw error;
		},
		onSuccess: async () => {
			await qc.cancelQueries();
			qc.clear();
			router.navigate({
				to: "/dashboard",
				replace: true
			});
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isLoading && !isSuperAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-8 text-center text-muted-foreground",
		children: "Apenas Super Admins podem gerenciar o ambiente demonstrativo."
	});
	const stats = statsQ.data;
	const exists = !!stats?.tenantId;
	const busy = create.isPending || restore.isPending || remove.isPending || enter.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero shadow-glow",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "h-6 w-6 text-white" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold",
						children: "Ambiente de Demonstração"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Gere um tenant completo com escolas, turmas, grupos, alunos e avaliações para apresentações comerciais, treinamentos e produção de material — sem misturar com dados reais de clientes."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Status atual"
						})]
					}),
					statsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Carregando…"
					}) : !exists ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nenhum ambiente demonstrativo ativo."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Tenant",
								value: stats.tenantName ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Escolas",
								value: stats.schools
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Turmas",
								value: stats.classes
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Grupos",
								value: stats.groups
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Alunos",
								value: stats.students
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Avaliações",
								value: stats.evaluations
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: [!exists && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => create.mutate(),
							disabled: busy,
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), create.isPending ? "Gerando…" : "Criar ambiente demonstrativo"]
						}), exists && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => enter.mutate(stats.tenantId),
								disabled: busy,
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), "Entrar no ambiente demonstrativo"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => restore.mutate(),
								disabled: busy,
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${restore.isPending ? "animate-spin" : ""}` }), restore.isPending ? "Recriando…" : "Restaurar / Recriar"]
							}),
							!confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => setConfirmDelete(true),
								disabled: busy,
								className: "gap-2 text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Excluir"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "destructive",
								onClick: () => remove.mutate(),
								disabled: busy,
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), remove.isPending ? "Removendo…" : "Confirmar exclusão"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setConfirmDelete(false),
								disabled: busy,
								children: "Cancelar"
							})] })
						] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 font-semibold text-foreground",
					children: "O que é gerado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-inside list-disc space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Tenant ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Colégio Modelo ProMetric" }),
							" (plano Rede)"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3 escolas, 9 turmas e 10 grupos esportivos" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "4 contatos de equipe (professores fictícios)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "200 alunos com nomes brasileiros realistas, distribuídos nas turmas" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3 avaliações por aluno com evolução coerente (peso, altura, IMC, flexibilidade, abdominal, salto, medicine ball, corrida 6 min, sprint 20 m, agilidade)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Diagnóstico de IA variado em cada avaliação" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Todos os registros marcados com ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "demo_data = true" }),
							" — isolados dos dados reais"
						] })
					]
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border/60 bg-muted/30 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 truncate text-lg font-bold",
			children: value
		})]
	});
}
//#endregion
export { DemoEnvironmentPage as component };
