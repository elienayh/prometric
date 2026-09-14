import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/run6min-input-DW7X2MHz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LAP_METERS = 40;
var ADDITIONALS = [
	0,
	10,
	20,
	30
];
/** Decompose total meters into laps × 40 + additional (0/10/20/30). */
function decompose(totalStr) {
	const total = parseFloat((totalStr ?? "").replace(",", "."));
	if (!isFinite(total) || total <= 0) return {
		laps: "",
		extra: 0
	};
	const laps = Math.floor(total / LAP_METERS);
	const rem = Math.round(total - laps * LAP_METERS);
	const extra = ADDITIONALS.reduce((best, v) => Math.abs(v - rem) < Math.abs(best - rem) ? v : best, 0);
	return {
		laps: String(laps),
		extra
	};
}
function compose(laps, extra) {
	const n = parseInt(laps, 10);
	if (!isFinite(n) || n < 0) return "";
	return String(n * LAP_METERS + extra);
}
/**
* Entrada assistida para Corrida 6min:
*  - Voltas completas (× 40 m)
*  - Distância adicional (0, 10, 20 ou 30 m)
* Grava sempre o total em metros no `onChange` — nenhum cálculo do sistema é alterado.
*/
function Run6MinInput({ value, onChange, className, compact, autoFocus }) {
	const initial = (0, import_react.useMemo)(() => decompose(value), [value]);
	const [laps, setLaps] = (0, import_react.useState)(initial.laps);
	const [extra, setExtra] = (0, import_react.useState)(initial.extra);
	(0, import_react.useEffect)(() => {
		const p = decompose(value);
		setLaps(p.laps);
		setExtra(p.extra);
	}, [value]);
	const total = (0, import_react.useMemo)(() => {
		const t = compose(laps, extra);
		return t ? Number(t) : null;
	}, [laps, extra]);
	const emit = (l, e) => {
		const composed = compose(l, e);
		if (composed !== value) onChange(composed);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-[11px] text-muted-foreground",
					children: "Voltas completas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					inputMode: "numeric",
					min: 0,
					step: 1,
					autoFocus,
					value: laps,
					placeholder: "Ex.: 34",
					onChange: (ev) => {
						const v = ev.target.value.replace(/[^\d]/g, "");
						setLaps(v);
						emit(v, extra);
					},
					className: compact ? "h-9 text-base" : "h-11 text-base"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-[11px] text-muted-foreground",
					children: "Distância adicional"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: String(extra),
					onValueChange: (v) => {
						const e = Number(v);
						setExtra(e);
						emit(laps, e);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: compact ? "h-9" : "h-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ADDITIONALS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: String(m),
						children: [m, " m"]
					}, m)) })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Distância total: "
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground",
					children: total != null ? `${total.toLocaleString("pt-BR")} m` : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-1 text-muted-foreground",
					children: [
						"(",
						laps || 0,
						" × ",
						LAP_METERS,
						" m + ",
						extra,
						" m)"
					]
				})
			]
		})]
	});
}
//#endregion
export { Run6MinInput as t };
