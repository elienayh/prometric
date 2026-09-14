import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blog.index-CittKYnD.js
var import_jsx_runtime = require_jsx_runtime();
var POSTS = [
	{
		slug: "metodo-prometric",
		title: "Método ProMetric®: como funciona a Avaliação Física Integrada",
		excerpt: "Entenda as 5 dimensões, o Índice ProMetric® de 0 a 100 e como a metodologia proprietária do ProMetric padroniza diagnósticos físicos."
	},
	{
		slug: "como-aplicar-avaliacao-fisica-escola",
		title: "Como aplicar uma Avaliação Física Integrada na escola, passo a passo",
		excerpt: "Roteiro prático para professores de Educação Física aplicarem a bateria do Método ProMetric® com a turma toda em até 2 aulas."
	},
	{
		slug: "como-calcular-imc-escolar",
		title: "Como calcular o IMC escolar e interpretar resultados",
		excerpt: "Fórmula, faixas de classificação por idade e sexo, e como comunicar os indicadores de saúde para famílias e direção escolar."
	},
	{
		slug: "avaliacao-fisica-educacao-fisica-escolar",
		title: "Avaliação física na Educação Física Escolar: por onde começar",
		excerpt: "Como estruturar um plano anual de avaliações físicas alinhado à BNCC e à realidade da quadra."
	},
	{
		slug: "beneficios-avaliacao-fisica-escolas",
		title: "Benefícios da avaliação física para escolas e gestores",
		excerpt: "Como dados de aptidão física viram decisões pedagógicas, projetos de saúde e diferencial competitivo para a escola."
	}
];
function BlogIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-4xl px-6 py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
							children: "Blog"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl font-bold tracking-tight md:text-5xl",
							children: "Avaliação Física, Educação Física Escolar e Método ProMetric®"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-base text-muted-foreground",
							children: "Guias, tutoriais e referências para o professor moderno."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-5",
					children: POSTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:bg-secondary/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/blog/$slug",
							params: { slug: p.slug },
							className: "block",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl font-semibold",
									children: p.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted-foreground",
									children: p.excerpt
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-3 inline-block text-xs font-medium text-primary",
									children: "Ler artigo →"
								})
							]
						})
					}, p.slug))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-sm text-muted-foreground hover:text-foreground",
						children: "← Voltar ao site"
					})
				})
			]
		})
	});
}
//#endregion
export { BlogIndex as component };
