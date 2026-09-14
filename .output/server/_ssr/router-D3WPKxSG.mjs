import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$42 } from "./accept-admin._token-DZCxSntD.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as themeBootScript, r as useTheme, t as ThemeProvider } from "./theme-provider-CXv-gSba.mjs";
import { t as Route$43 } from "./admin.clients._id-XHrX-VJP.mjs";
import { n as Route$44 } from "./auth-DTns_0IR.mjs";
import { t as Route$45 } from "./blog._slug-BN-b1DxZ.mjs";
import { t as Route$46 } from "./classes._id.dashboard-Dtf81CHy.mjs";
import { t as Route$47 } from "./classes._id.index-NsOeYkzQ.mjs";
import { t as Route$48 } from "./groups._id.dashboard-3eJLOhsz.mjs";
import { t as Route$49 } from "./groups._id.index-BMH3BQO_.mjs";
import { t as Route$50 } from "./invite._token-CxPJTiAV.mjs";
import { t as Route$51 } from "./p._slug-CgWVaNWn.mjs";
import { r as Route$52 } from "./portal.aluno._token-C4U38pEu.mjs";
import { t as Route$53 } from "./quick-eval-BdsB-NOe.mjs";
import { t as FAQ_ITEMS } from "./routes-B1fsdnXr.mjs";
import { t as Route$54 } from "./students._id-DSLdfpat.mjs";
import { t as Route$55 } from "./schools._id-CTZv5zVS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D3WPKxSG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-edjHGgSo.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-gradient-brand",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Página não encontrada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "A rota que você tentou acessar não existe."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Voltar ao início"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	const message = error?.message || "Erro desconhecido";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Algo deu errado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Detalhes técnicos abaixo. Se o problema persistir, recarregue ou volte ao início."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-4 max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground",
					children: message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								router.invalidate();
								reset();
							},
							className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
							children: "Tentar novamente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/auth",
							className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
							children: "Ir para login"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
							children: "Início"
						})
					]
				})
			]
		})
	});
}
var Route$41 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ProMetric — Avaliação Física Inteligente" },
			{
				name: "description",
				content: "Plataforma SaaS de Avaliação Física Inteligente com IA para escolas, academias, clubes e personal trainers."
			},
			{
				name: "theme-color",
				content: "#4F46E5"
			},
			{
				property: "og:title",
				content: "ProMetric — Avaliação Física Inteligente"
			},
			{
				property: "og:description",
				content: "Plataforma SaaS de Avaliação Física Inteligente com IA para escolas, academias, clubes e personal trainers."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:site_name",
				content: "ProMetric"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "ProMetric — Avaliação Física Inteligente"
			},
			{
				name: "twitter:description",
				content: "Plataforma SaaS de Avaliação Física Inteligente com IA para escolas, academias, clubes e personal trainers."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: themeBootScript } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function ThemedToaster() {
	const { theme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme,
		position: "top-right",
		richColors: true
	});
}
function RootComponent() {
	const { queryClient } = Route$41.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => sub.subscription.unsubscribe();
	}, [router, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedToaster, {})]
	}) });
}
var BASE_URL = "https://prometric.lovable.app";
var Route$40 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
		{
			path: "/",
			changefreq: "weekly",
			priority: "1.0"
		},
		{
			path: "/auth",
			changefreq: "monthly",
			priority: "0.5"
		},
		{
			path: "/blog",
			changefreq: "weekly",
			priority: "0.8"
		},
		{
			path: "/blog/metodo-prometric",
			changefreq: "monthly",
			priority: "0.7"
		},
		{
			path: "/blog/como-aplicar-avaliacao-fisica-escola",
			changefreq: "monthly",
			priority: "0.7"
		},
		{
			path: "/blog/como-calcular-imc-escolar",
			changefreq: "monthly",
			priority: "0.7"
		},
		{
			path: "/blog/avaliacao-fisica-educacao-fisica-escolar",
			changefreq: "monthly",
			priority: "0.7"
		},
		{
			path: "/blog/beneficios-avaliacao-fisica-escolas",
			changefreq: "monthly",
			priority: "0.7"
		}
	].map((e) => `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`).join("\n")}\n</urlset>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$38 = () => import("./reset-password-KAYevPg5.mjs");
var Route$39 = createFileRoute("/reset-password")({
	ssr: false,
	head: () => ({ meta: [{ title: "Redefinir senha — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$38, "component")
});
var $$splitComponentImporter$37 = () => import("./register-CH9g6FwJ.mjs");
var Route$38 = createFileRoute("/register")({
	head: () => ({ meta: [{ title: "Criar Conta — ProMetric" }] }),
	beforeLoad: async () => {
		if (typeof window === "undefined") return;
		const { data } = await supabase.auth.getSession();
		const userId = data.session?.user.id;
		if (!userId) return;
		const { data: roles } = await supabase.from("admin_roles").select("role").eq("user_id", userId).limit(1);
		throw redirect({ to: roles && roles.length > 0 ? "/admin" : "/dashboard" });
	},
	component: lazyRouteComponent($$splitComponentImporter$37, "component")
});
var $$splitComponentImporter$36 = () => import("./login-Bpyij99-.mjs");
var Route$37 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Entrar — ProMetric" }] }),
	beforeLoad: async () => {
		if (typeof window === "undefined") return;
		const { data } = await supabase.auth.getSession();
		const userId = data.session?.user.id;
		if (!userId) return;
		const { data: roles } = await supabase.from("admin_roles").select("role").eq("user_id", userId).limit(1);
		throw redirect({ to: roles && roles.length > 0 ? "/admin" : "/dashboard" });
	},
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var $$splitComponentImporter$35 = () => import("./blog-GHsbigBI.mjs");
var Route$36 = createFileRoute("/blog")({ component: lazyRouteComponent($$splitComponentImporter$35, "component") });
var $$splitComponentImporter$34 = () => import("./admin-DUFpIDms.mjs");
var Route$35 = createFileRoute("/admin")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		const { data: roles } = await supabase.from("admin_roles").select("role").eq("user_id", data.user.id);
		if (!roles || roles.length === 0) throw redirect({ to: "/dashboard" });
		return {
			user: data.user,
			adminRoles: roles.map((r) => r.role)
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$34, "component")
});
var $$splitComponentImporter$33 = () => import("./route-DSUnwV78.mjs");
var Route$34 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var $$splitComponentImporter$32 = () => import("./routes-YYsOdpKB.mjs");
var SITE_URL = "https://prometric.lovable.app";
var OG_IMAGE = `${SITE_URL}/__l5e/assets-v1/197375d2-484d-475e-820d-6c6d29a369b2/og-cover.jpg`;
var STRUCTURED_DATA = [
	{
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "ProMetric",
		url: SITE_URL,
		logo: `${SITE_URL}/favicon.ico`,
		description: "Plataforma de Avaliação Física Integrada baseada no Método ProMetric®."
	},
	{
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "ProMetric",
		url: SITE_URL,
		inLanguage: "pt-BR",
		potentialAction: {
			"@type": "SearchAction",
			target: `${SITE_URL}/blog?q={search_term_string}`,
			"query-input": "required name=search_term_string"
		}
	},
	{
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "ProMetric",
		applicationCategory: "EducationalApplication",
		operatingSystem: "Web Browser",
		description: "Sistema de Avaliação Física Inteligente com IA. Método ProMetric®, Índice 0–100, relatórios automáticos e diagnóstico por IA.",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "BRL"
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.9",
			ratingCount: "120"
		}
	},
	{
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: FAQ_ITEMS.map((it) => ({
			"@type": "Question",
			name: it.q,
			acceptedAnswer: {
				"@type": "Answer",
				text: it.a
			}
		}))
	}
];
var Route$33 = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "ProMetric | Avaliação Física Inteligente com IA" },
			{
				name: "description",
				content: "Método ProMetric® de Avaliação Física: Índice 0–100, 5 dimensões, relatórios automáticos e IA diagnóstica para escolas, academias e clubes."
			},
			{
				property: "og:title",
				content: "ProMetric | Avaliação Física Inteligente com IA"
			},
			{
				property: "og:description",
				content: "Método ProMetric® de Avaliação Física Integrada. Índice 0–100, relatórios automáticos e diagnóstico por IA."
			},
			{
				property: "og:url",
				content: SITE_URL
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:image",
				content: OG_IMAGE
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "ProMetric | Avaliação Física Inteligente com IA"
			},
			{
				name: "twitter:description",
				content: "Método ProMetric® — Avaliação Física Integrada com Índice 0–100 e IA diagnóstica."
			},
			{
				name: "twitter:image",
				content: OG_IMAGE
			}
		],
		links: [{
			rel: "canonical",
			href: SITE_URL
		}],
		scripts: STRUCTURED_DATA.map((d) => ({
			type: "application/ld+json",
			children: JSON.stringify(d)
		}))
	}),
	beforeLoad: async () => {
		if (typeof window === "undefined") return;
		const { data } = await supabase.auth.getSession();
		const userId = data.session?.user.id;
		if (!userId) return;
		const { data: roles } = await supabase.from("admin_roles").select("role").eq("user_id", userId).limit(1);
		throw redirect({ to: roles && roles.length > 0 ? "/admin" : "/dashboard" });
	},
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("./blog.index-CittKYnD.mjs");
var Route$32 = createFileRoute("/blog/")({
	head: () => ({
		meta: [
			{ title: "Blog ProMetric — Avaliação Física, IA e Educação Física" },
			{
				name: "description",
				content: "Conteúdo especializado para professores de Educação Física: Método ProMetric®, avaliação física integrada, indicadores de saúde e gestão pedagógica."
			},
			{
				property: "og:title",
				content: "Blog ProMetric — Avaliação Física Inteligente"
			},
			{
				property: "og:description",
				content: "Guias, tutoriais e referências sobre o Método ProMetric® e avaliação física escolar."
			}
		],
		links: [{
			rel: "canonical",
			href: "https://prometric.lovable.app/blog"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("./auth.index-DNlr68uw.mjs");
var Route$31 = createFileRoute("/auth/")({ component: lazyRouteComponent($$splitComponentImporter$30, "component") });
var $$splitComponentImporter$29 = () => import("./auth.register-CtHfbZCb.mjs");
var Route$30 = createFileRoute("/auth/register")({
	head: () => ({ meta: [{ title: "Criar Conta — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var Route$29 = createFileRoute("/auth/login")({ beforeLoad: () => {
	throw redirect({ to: "/login" });
} });
var $$splitComponentImporter$28 = () => import("./admin.support-DiwT-VHg.mjs");
var Route$28 = createFileRoute("/admin/support")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./admin.monitoring-CksHsDy8.mjs");
var Route$27 = createFileRoute("/admin/monitoring")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = () => import("./admin.logs-Cc3mFEOc.mjs");
var Route$26 = createFileRoute("/admin/logs")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./admin.financial-BazOuP8A.mjs");
var Route$25 = createFileRoute("/admin/financial")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./admin.demo-5qTfObZY.mjs");
var Route$24 = createFileRoute("/admin/demo")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./admin.dashboard-BudYec1O.mjs");
var Route$23 = createFileRoute("/admin/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./admin.clients-n1Wv6CP3.mjs");
var Route$22 = createFileRoute("/admin/clients")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./admin.administrators-Nm-Ngae9.mjs");
var Route$21 = createFileRoute("/admin/administrators")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./team-CzwvkaSR.mjs");
var Route$20 = createFileRoute("/_authenticated/team")({
	head: () => ({ meta: [{ title: "Equipe — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./students-CHgCoVnr.mjs");
var Route$19 = createFileRoute("/_authenticated/students")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./settings-tcdZSIh0.mjs");
var Route$18 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Configurações — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./schools-C8wQ0Kxh.mjs");
var Route$17 = createFileRoute("/_authenticated/schools")({
	head: () => ({ meta: [{ title: "Escolas — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./risk-BE489Syb.mjs");
var Route$16 = createFileRoute("/_authenticated/risk")({
	head: () => ({ meta: [{ title: "Saúde e Risco — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./reports-CRsGc-l5.mjs");
var Route$15 = createFileRoute("/_authenticated/reports")({
	head: () => ({ meta: [{ title: "Relatórios — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./knowledge-DQg_gPLx.mjs");
var Route$14 = createFileRoute("/_authenticated/knowledge")({
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	head: () => ({ meta: [{ title: "Central de Conhecimento — ProMetric" }, {
		name: "description",
		content: "Metodologia ProMetric: cálculos, indicadores, Índice ProMetric e interpretação dos resultados."
	}] })
});
var $$splitComponentImporter$13 = () => import("./groups-DcEJe4yf.mjs");
/**
* Layout de Grupos. Necessário para que as rotas filhas
* (`/groups/$id` e `/groups/$id/dashboard`) sejam renderizadas.
*/
var Route$13 = createFileRoute("/_authenticated/groups")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./executive-CqFVCzw8.mjs");
var Route$12 = createFileRoute("/_authenticated/executive")({
	head: () => ({ meta: [{ title: "Dashboard Executivo — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./evaluations-Bsaig2ab.mjs");
var Route$11 = createFileRoute("/_authenticated/evaluations")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./dashboard-5C_y_zdL.mjs");
var Route$10 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard — ProMetric" }] }),
	beforeLoad: async () => {
		const { data: u } = await supabase.auth.getUser();
		if (u.user) {
			const { data: profile } = await supabase.from("profiles").select("impersonating_tenant_id").eq("id", u.user.id).maybeSingle();
			if (profile?.impersonating_tenant_id) return;
			const { data: roles } = await supabase.from("admin_roles").select("role").eq("user_id", u.user.id).limit(1);
			if (roles && roles.length > 0) throw redirect({ to: "/admin" });
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./classes-BkqHtmBN.mjs");
/**
* Layout de Turmas. Necessário para que as rotas filhas
* (`/classes/$id` e `/classes/$id/dashboard`) sejam renderizadas.
*/
var Route$9 = createFileRoute("/_authenticated/classes")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./admin.clients.index-CoUy7We9.mjs");
var Route$8 = createFileRoute("/admin/clients/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./students.index-D0jQEo9D.mjs");
var Route$7 = createFileRoute("/_authenticated/students/")({
	head: () => ({ meta: [{ title: "Alunos — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./groups.index-ChlSyK_M.mjs");
var Route$6 = createFileRoute("/_authenticated/groups/")({
	head: () => ({ meta: [{ title: "Grupos — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./evaluations.index-rAHWSNoC.mjs");
var Route$5 = createFileRoute("/_authenticated/evaluations/")({
	head: () => ({ meta: [{ title: "Avaliações — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./classes.index-DgXiWkyC.mjs");
var Route$4 = createFileRoute("/_authenticated/classes/")({
	head: () => ({ meta: [{ title: "Turmas — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./students.import-B4QoZI-_.mjs");
var Route$3 = createFileRoute("/_authenticated/students/import")({
	head: () => ({ meta: [{ title: "Importar Alunos — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitNotFoundComponentImporter$1 = () => import("./groups._id-DCyQGqZ1.mjs");
var $$splitErrorComponentImporter$1 = () => import("./groups._id-DMoFdjL5.mjs");
var $$splitComponentImporter$2 = () => import("./groups._id-BDE8rWab.mjs");
/**
* Layout do grupo. As telas filhas são:
*  - `/groups/$id`            → participantes do grupo (abrir grupo)
*  - `/groups/$id/dashboard`  → resumo/dashboard com indicadores do grupo
*/
var Route$2 = createFileRoute("/_authenticated/groups/$id")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
var $$splitComponentImporter$1 = () => import("./evaluations.import-DUBzxMoD.mjs");
var Route$1 = createFileRoute("/_authenticated/evaluations/import")({
	head: () => ({ meta: [{ title: "Importar Fichas — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitNotFoundComponentImporter = () => import("./classes._id-GpEBi6mg.mjs");
var $$splitErrorComponentImporter = () => import("./classes._id-Bk3YhGHM.mjs");
var $$splitComponentImporter = () => import("./classes._id-DSVudBYr.mjs");
/**
* Layout da turma. As telas filhas são:
*  - `/classes/$id`            → lista de alunos da turma (abrir turma)
*  - `/classes/$id/dashboard`  → resumo/dashboard com indicadores da turma
*/
var Route = createFileRoute("/_authenticated/classes/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var SitemapDotxmlRoute = Route$40.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$41
});
var ResetPasswordRoute = Route$39.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$41
});
var RegisterRoute = Route$38.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$41
});
var LoginRoute = Route$37.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$41
});
var BlogRoute = Route$36.update({
	id: "/blog",
	path: "/blog",
	getParentRoute: () => Route$41
});
var AuthRoute = Route$44.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$41
});
var AdminRoute = Route$35.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$41
});
var AuthenticatedRouteRoute = Route$34.update({
	id: "/_authenticated",
	getParentRoute: () => Route$41
});
var IndexRoute = Route$33.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$41
});
var BlogIndexRoute = Route$32.update({
	id: "/",
	path: "/",
	getParentRoute: () => BlogRoute
});
var AuthIndexRoute = Route$31.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthRoute
});
var PSlugRoute = Route$51.update({
	id: "/p/$slug",
	path: "/p/$slug",
	getParentRoute: () => Route$41
});
var InviteTokenRoute = Route$50.update({
	id: "/invite/$token",
	path: "/invite/$token",
	getParentRoute: () => Route$41
});
var BlogSlugRoute = Route$45.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => BlogRoute
});
var AuthRegisterRoute = Route$30.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => AuthRoute
});
var AuthLoginRoute = Route$29.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => AuthRoute
});
var AdminSupportRoute = Route$28.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => AdminRoute
});
var AdminMonitoringRoute = Route$27.update({
	id: "/monitoring",
	path: "/monitoring",
	getParentRoute: () => AdminRoute
});
var AdminLogsRoute = Route$26.update({
	id: "/logs",
	path: "/logs",
	getParentRoute: () => AdminRoute
});
var AdminFinancialRoute = Route$25.update({
	id: "/financial",
	path: "/financial",
	getParentRoute: () => AdminRoute
});
var AdminDemoRoute = Route$24.update({
	id: "/demo",
	path: "/demo",
	getParentRoute: () => AdminRoute
});
var AdminDashboardRoute = Route$23.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AdminRoute
});
var AdminClientsRoute = Route$22.update({
	id: "/clients",
	path: "/clients",
	getParentRoute: () => AdminRoute
});
var AdminAdministratorsRoute = Route$21.update({
	id: "/administrators",
	path: "/administrators",
	getParentRoute: () => AdminRoute
});
var AcceptAdminTokenRoute = Route$42.update({
	id: "/accept-admin/$token",
	path: "/accept-admin/$token",
	getParentRoute: () => Route$41
});
var AuthenticatedTeamRoute = Route$20.update({
	id: "/team",
	path: "/team",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentsRoute = Route$19.update({
	id: "/students",
	path: "/students",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$18.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSchoolsRoute = Route$17.update({
	id: "/schools",
	path: "/schools",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRiskRoute = Route$16.update({
	id: "/risk",
	path: "/risk",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReportsRoute = Route$15.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedQuickEvalRoute = Route$53.update({
	id: "/quick-eval",
	path: "/quick-eval",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedKnowledgeRoute = Route$14.update({
	id: "/knowledge",
	path: "/knowledge",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGroupsRoute = Route$13.update({
	id: "/groups",
	path: "/groups",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedExecutiveRoute = Route$12.update({
	id: "/executive",
	path: "/executive",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedEvaluationsRoute = Route$11.update({
	id: "/evaluations",
	path: "/evaluations",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$10.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedClassesRoute = Route$9.update({
	id: "/classes",
	path: "/classes",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AdminClientsIndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminClientsRoute
});
var AuthenticatedStudentsIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedStudentsRoute
});
var AuthenticatedGroupsIndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedGroupsRoute
});
var AuthenticatedEvaluationsIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedEvaluationsRoute
});
var AuthenticatedClassesIndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedClassesRoute
});
var PortalAlunoTokenRoute = Route$52.update({
	id: "/portal/aluno/$token",
	path: "/portal/aluno/$token",
	getParentRoute: () => Route$41
});
var AdminClientsIdRoute = Route$43.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AdminClientsRoute
});
var AuthenticatedStudentsImportRoute = Route$3.update({
	id: "/import",
	path: "/import",
	getParentRoute: () => AuthenticatedStudentsRoute
});
var AuthenticatedStudentsIdRoute = Route$54.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AuthenticatedStudentsRoute
});
var AuthenticatedSchoolsIdRoute = Route$55.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AuthenticatedSchoolsRoute
});
var AuthenticatedGroupsIdRoute = Route$2.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AuthenticatedGroupsRoute
});
var AuthenticatedEvaluationsImportRoute = Route$1.update({
	id: "/import",
	path: "/import",
	getParentRoute: () => AuthenticatedEvaluationsRoute
});
var AuthenticatedClassesIdRoute = Route.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AuthenticatedClassesRoute
});
var AuthenticatedGroupsIdIndexRoute = Route$49.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedGroupsIdRoute
});
var AuthenticatedClassesIdIndexRoute = Route$47.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedClassesIdRoute
});
var AuthenticatedGroupsIdDashboardRoute = Route$48.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedGroupsIdRoute
});
var AuthenticatedClassesIdRouteChildren = {
	AuthenticatedClassesIdDashboardRoute: Route$46.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedClassesIdRoute
	}),
	AuthenticatedClassesIdIndexRoute
};
var AuthenticatedClassesRouteChildren = {
	AuthenticatedClassesIdRoute: AuthenticatedClassesIdRoute._addFileChildren(AuthenticatedClassesIdRouteChildren),
	AuthenticatedClassesIndexRoute
};
var AuthenticatedClassesRouteWithChildren = AuthenticatedClassesRoute._addFileChildren(AuthenticatedClassesRouteChildren);
var AuthenticatedEvaluationsRouteChildren = {
	AuthenticatedEvaluationsImportRoute,
	AuthenticatedEvaluationsIndexRoute
};
var AuthenticatedEvaluationsRouteWithChildren = AuthenticatedEvaluationsRoute._addFileChildren(AuthenticatedEvaluationsRouteChildren);
var AuthenticatedGroupsIdRouteChildren = {
	AuthenticatedGroupsIdDashboardRoute,
	AuthenticatedGroupsIdIndexRoute
};
var AuthenticatedGroupsRouteChildren = {
	AuthenticatedGroupsIdRoute: AuthenticatedGroupsIdRoute._addFileChildren(AuthenticatedGroupsIdRouteChildren),
	AuthenticatedGroupsIndexRoute
};
var AuthenticatedGroupsRouteWithChildren = AuthenticatedGroupsRoute._addFileChildren(AuthenticatedGroupsRouteChildren);
var AuthenticatedSchoolsRouteChildren = { AuthenticatedSchoolsIdRoute };
var AuthenticatedSchoolsRouteWithChildren = AuthenticatedSchoolsRoute._addFileChildren(AuthenticatedSchoolsRouteChildren);
var AuthenticatedStudentsRouteChildren = {
	AuthenticatedStudentsIdRoute,
	AuthenticatedStudentsImportRoute,
	AuthenticatedStudentsIndexRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedClassesRoute: AuthenticatedClassesRouteWithChildren,
	AuthenticatedDashboardRoute,
	AuthenticatedEvaluationsRoute: AuthenticatedEvaluationsRouteWithChildren,
	AuthenticatedExecutiveRoute,
	AuthenticatedGroupsRoute: AuthenticatedGroupsRouteWithChildren,
	AuthenticatedKnowledgeRoute,
	AuthenticatedQuickEvalRoute,
	AuthenticatedReportsRoute,
	AuthenticatedRiskRoute,
	AuthenticatedSchoolsRoute: AuthenticatedSchoolsRouteWithChildren,
	AuthenticatedSettingsRoute,
	AuthenticatedStudentsRoute: AuthenticatedStudentsRoute._addFileChildren(AuthenticatedStudentsRouteChildren),
	AuthenticatedTeamRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var AdminClientsRouteChildren = {
	AdminClientsIdRoute,
	AdminClientsIndexRoute
};
var AdminRouteChildren = {
	AdminAdministratorsRoute,
	AdminClientsRoute: AdminClientsRoute._addFileChildren(AdminClientsRouteChildren),
	AdminDashboardRoute,
	AdminDemoRoute,
	AdminFinancialRoute,
	AdminLogsRoute,
	AdminMonitoringRoute,
	AdminSupportRoute
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var AuthRouteChildren = {
	AuthLoginRoute,
	AuthRegisterRoute,
	AuthIndexRoute
};
var AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
var BlogRouteChildren = {
	BlogSlugRoute,
	BlogIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	AdminRoute: AdminRouteWithChildren,
	AuthRoute: AuthRouteWithChildren,
	BlogRoute: BlogRoute._addFileChildren(BlogRouteChildren),
	LoginRoute,
	RegisterRoute,
	ResetPasswordRoute,
	SitemapDotxmlRoute,
	AcceptAdminTokenRoute,
	InviteTokenRoute,
	PSlugRoute,
	PortalAlunoTokenRoute
};
var routeTree = Route$41._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
