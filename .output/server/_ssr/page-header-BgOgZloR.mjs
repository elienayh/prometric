import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { P as Plus, y as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-header-BgOgZloR.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, description, action, icon, eyebrow, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-3 sm:gap-4",
			children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 sm:grid",
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
						children: eyebrow
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate font-display text-2xl font-bold tracking-tight sm:text-[28px]",
						children: title
					}),
					description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: description
					})
				]
			})]
		}), action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children: action
		})]
	});
}
function EmptyState({ title, description, actionLabel, onAction, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-3xl border border-dashed border-border bg-gradient-card p-10 text-center shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 opacity-50 bg-gradient-mesh",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25",
					children: icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground",
					children: description
				}),
				actionLabel && onAction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onAction,
					className: "mt-5 bg-gradient-brand text-primary-foreground shadow-glow transition-opacity hover:opacity-90",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }),
						" ",
						actionLabel
					]
				})
			]
		})]
	});
}
//#endregion
export { PageHeader as n, EmptyState as t };
