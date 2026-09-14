import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { kt as ChartColumn, nt as GraduationCap, o as UserPlus, r as Users, t as Zap, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Breadcrumbs } from "./breadcrumbs-0lX5b4_0.mjs";
import { t as Route } from "./classes._id.index-NsOeYkzQ.mjs";
import { t as EmptyState } from "./page-header-BgOgZloR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classes._id.index-B4YsKcRJ.js
var import_jsx_runtime = require_jsx_runtime();
function ageFrom(birth) {
	const b = new Date(birth);
	const now = /* @__PURE__ */ new Date();
	let a = now.getFullYear() - b.getFullYear();
	const m = now.getMonth() - b.getMonth();
	if (m < 0 || m === 0 && now.getDate() < b.getDate()) a--;
	return a;
}
function ClassStudentsPage() {
	const { id } = Route.useParams();
	const info = useQuery({
		queryKey: ["class-info", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("classes").select("id,name,grade,school_year,school:schools(name)").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const students = useQuery({
		queryKey: ["class-students", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id,full_name,sex,birth_date,is_active").eq("class_id", id).order("full_name");
			if (error) throw error;
			return data;
		}
	});
	const c = info.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { items: [{
				label: "Turmas",
				to: "/classes"
			}, { label: c?.name ?? "Turma" }] }),
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
							to: "/classes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate font-display text-xl font-bold sm:text-2xl",
								children: c?.name ?? "Turma"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								c?.grade,
								c?.school?.name,
								`${students.data?.length ?? 0} aluno(s)`
							].filter(Boolean).join(" • ")
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/classes/$id/dashboard",
							params: { id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mr-1.5 h-4 w-4" }), " Resumo da turma"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						asChild: true,
						className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/quick-eval",
							search: { class: id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1.5 h-4 w-4" }), " Nova avaliação"]
						})
					})]
				})]
			}),
			students.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Carregando alunos…"
			}) : (students.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nenhum aluno nesta turma",
				description: "Vincule alunos existentes a esta turma na tela de Alunos."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm font-semibold",
								children: "Alunos cadastrados"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									students.data.length,
									")"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
						children: students.data.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/students/$id",
							params: { id: s.id },
							className: "flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium",
									children: s.full_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground",
									children: [
										s.sex === "male" ? "Masculino" : "Feminino",
										" • ",
										ageFrom(s.birth_date),
										" anos",
										!s.is_active && " • inativo"
									]
								})]
							})
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/students",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1.5 h-4 w-4" }), " Gerenciar alunos"]
							})
						})
					})
				]
			})
		]
	});
}
//#endregion
export { ClassStudentsPage as component };
