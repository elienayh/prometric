import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as House, Tt as ChevronRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/breadcrumbs-0lX5b4_0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Breadcrumb navigation for analytical pages.
* Always starts with "Dashboard" linking to /dashboard.
*
* Example:
* <Breadcrumbs items={[
*   { label: "Escolas", to: "/schools" },
*   { label: "Escola Horizonte", to: "/schools/$id", params: { id } },
*   { label: "2º Ano A" },
* ]} />
*/
function Breadcrumbs({ items }) {
	const all = [{
		label: "Dashboard",
		to: "/dashboard",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-3 w-3" })
	}, ...items];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Navegação",
		className: "mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground",
		children: all.map((c, i) => {
			const isLast = i === all.length - 1;
			const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [c.icon, c.label]
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [c.to && !isLast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: c.to,
				params: c.params,
				className: "rounded px-1 py-0.5 hover:bg-muted hover:text-foreground",
				children: inner
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: isLast ? "font-medium text-foreground" : "px-1",
				children: inner
			}), !isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3 w-3 opacity-50" })] }, `${c.label}-${i}`);
		})
	});
}
//#endregion
export { Breadcrumbs as t };
