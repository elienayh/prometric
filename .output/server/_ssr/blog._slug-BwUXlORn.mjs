import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as Route } from "./blog._slug-BN-b1DxZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blog._slug-BwUXlORn.js
var import_jsx_runtime = require_jsx_runtime();
function BlogPost() {
	const { post } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "mx-auto max-w-3xl px-6 py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/blog",
					className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Todos os artigos"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 font-display text-3xl font-bold tracking-tight md:text-4xl",
					children: post.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-lg text-muted-foreground",
					children: post.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 space-y-5",
					children: post.body.map((b, i) => b.h ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold pt-4",
						children: b.h
					}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "leading-relaxed text-foreground/90",
						children: b.p
					}, i))
				})
			]
		})
	});
}
//#endregion
export { BlogPost as component };
