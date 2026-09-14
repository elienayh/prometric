import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blog._slug-BjQ5gRD5.js
var import_jsx_runtime = require_jsx_runtime();
var SplitNotFoundComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "mx-auto max-w-3xl px-6 py-20 text-center",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display text-2xl font-bold",
		children: "Artigo não encontrado"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/blog",
		className: "mt-4 inline-block text-primary",
		children: "Voltar para o blog"
	})]
});
//#endregion
export { SplitNotFoundComponent as notFoundComponent };
