import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as Check, P as Plus, i as UsersRound, kt as ChartColumn, r as Users, s as UserMinus, t as Zap, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { t as Breadcrumbs } from "./breadcrumbs-0lX5b4_0.mjs";
import { t as EmptyState } from "./page-header-BgOgZloR.mjs";
import { t as Route } from "./groups._id.index-BMH3BQO_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/groups._id.index-DjYQVsGb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function ageFrom(birth) {
	const b = new Date(birth);
	const now = /* @__PURE__ */ new Date();
	let a = now.getFullYear() - b.getFullYear();
	const m = now.getMonth() - b.getMonth();
	if (m < 0 || m === 0 && now.getDate() < b.getDate()) a--;
	return a;
}
function GroupMembersPage() {
	const { id } = Route.useParams();
	const { tenantId } = useCurrentTenant();
	const qc = useQueryClient();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const info = useQuery({
		queryKey: ["group-info", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("id,name,display_name,description").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const members = useQuery({
		queryKey: ["group-members", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,group_id").eq("group_id", id).order("full_name");
			if (error) throw error;
			return data;
		}
	});
	const remove = useMutation({
		mutationFn: async (studentId) => {
			const { error } = await supabase.from("students").update({ group_id: null }).eq("id", studentId);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Participante removido do grupo");
			qc.invalidateQueries({ queryKey: ["group-members", id] });
			qc.invalidateQueries({ queryKey: ["group-stats", id] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover")
	});
	const g = info.data;
	const title = g?.display_name || g?.name || "Grupo";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { items: [{
				label: "Grupos",
				to: "/groups"
			}, { label: title }] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						asChild: true,
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/groups",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate font-display text-xl font-bold sm:text-2xl",
								children: title
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [g?.description, `${members.data?.length ?? 0} participante(s)`].filter(Boolean).join(" • ")
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/groups/$id/dashboard",
								params: { id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mr-1.5 h-4 w-4" }), " Resumo do grupo"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/quick-eval",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1.5 h-4 w-4" }), " Nova avaliação"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setAddOpen(true),
							className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), " Adicionar participantes"]
						})
					]
				})]
			}),
			members.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Carregando participantes…"
			}) : (members.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nenhum participante neste grupo",
				description: "Adicione alunos já cadastrados para compor o grupo.",
				actionLabel: "Adicionar participantes",
				onAction: () => setAddOpen(true)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold",
							children: "Participantes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"(",
								members.data.length,
								")"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
					children: members.data.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-lg border border-border bg-background p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/students/$id",
							params: { id: s.id },
							className: "min-w-0 flex-1 hover:text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-sm font-medium",
								children: s.full_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-muted-foreground",
								children: [
									s.sex === "male" ? "Masculino" : "Feminino",
									" • ",
									ageFrom(s.birth_date),
									" anos"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "min-h-9 min-w-9 text-destructive",
							"aria-label": `Remover ${s.full_name} do grupo`,
							onClick: () => remove.mutate(s.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "h-4 w-4" })
						})]
					}, s.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddMembersDialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				groupId: id,
				tenantId
			})
		]
	});
}
function AddMembersDialog({ open, onOpenChange, groupId, tenantId }) {
	const qc = useQueryClient();
	const [term, setTerm] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)([]);
	const pool = useQuery({
		queryKey: [
			"group-candidates",
			tenantId,
			groupId
		],
		enabled: open && !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,group_id").eq("tenant_id", tenantId).eq("is_active", true).order("full_name");
			if (error) throw error;
			return data.filter((s) => s.group_id !== groupId);
		}
	});
	const filtered = (0, import_react.useMemo)(() => {
		const t = term.trim().toLowerCase();
		const rows = pool.data ?? [];
		return t ? rows.filter((s) => s.full_name.toLowerCase().includes(t)) : rows;
	}, [pool.data, term]);
	const save = useMutation({
		mutationFn: async () => {
			if (selected.length === 0) throw new Error("Selecione ao menos um aluno");
			const { error } = await supabase.from("students").update({ group_id: groupId }).in("id", selected);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Participantes adicionados");
			qc.invalidateQueries({ queryKey: ["group-members", groupId] });
			qc.invalidateQueries({ queryKey: ["group-stats", groupId] });
			qc.invalidateQueries({ queryKey: ["group-candidates"] });
			setSelected([]);
			onOpenChange(false);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao adicionar")
	});
	const toggle = (sid) => setSelected((prev) => prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (b) => {
			if (!b) {
				setTerm("");
				setSelected([]);
			}
			onOpenChange(b);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Adicionar participantes" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Selecione alunos já cadastrados. Nenhum cadastro novo é criado."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Buscar aluno…",
					value: term,
					onChange: (e) => setTerm(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2",
					children: pool.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-2 text-sm text-muted-foreground",
						children: "Carregando alunos…"
					}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-2 text-sm text-muted-foreground",
						children: "Nenhum aluno disponível."
					}) : filtered.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: selected.includes(s.id),
							onCheckedChange: () => toggle(s.id)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm",
								children: s.full_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-[11px] text-muted-foreground",
								children: [
									ageFrom(s.birth_date),
									" anos",
									s.group_id ? " • já em outro grupo" : ""
								]
							})]
						})]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Cancelar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save.mutate(),
					disabled: save.isPending || selected.length === 0,
					className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
					children: save.isPending ? "Adicionando…" : `Adicionar (${selected.length})`
				})] })
			]
		})
	});
}
//#endregion
export { GroupMembersPage as component };
