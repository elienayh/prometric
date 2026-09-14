import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { Bt as Activity } from "../_libs/lucide-react.mjs";
import { a as prometricIndex } from "./prometric-method-BGZfQ42Z.mjs";
import { c as situationSentence, l as situationStyle, o as REFERENCE_LABEL, r as EXPECTED_INDEX_RANGE, s as scoreToSituation } from "./prometric-reference-G7AL_tS3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/development-summary-BT4-UMam.js
var import_jsx_runtime = require_jsx_runtime();
function SituationBadge({ situation, size = "sm", showIcon = true, className, ...rest }) {
	const s = situationStyle(situation);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		...rest,
		className: cn("inline-flex items-center gap-1 rounded-full border font-medium", size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs", s.className, className),
		children: [showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			children: s.icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: situation ?? "—" })]
	});
}
/**
* Seção "Desenvolvimento Geral" — bloco central da Referência ProMetric®.
* Reusada no Dashboard do Aluno, Portal, PDFs e dashboards analíticos.
*/
function DevelopmentSummary({ classifications, studentFirstName, hideSentence }) {
	const pm = prometricIndex(classifications);
	const situation = scoreToSituation(pm.score, pm.partial);
	const subject = studentFirstName ? `O desenvolvimento físico de ${studentFirstName}` : "O desenvolvimento físico";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Desenvolvimento Geral — Referência ProMetric®",
		className: "rounded-2xl border border-[#22c55e]/30 bg-gradient-to-br from-[#f0fdf4] to-card p-5 shadow-soft dark:from-[#14532d]/15 dark:to-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#16a34a]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3.5 w-3.5" }), REFERENCE_LABEL]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-lg font-bold",
					children: "Desenvolvimento Geral"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SituationBadge, {
					situation,
					size: "md"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Índice ProMetric",
						value: pm.partial ? "—" : `${pm.score}`,
						suffix: pm.partial ? "" : "/100",
						hint: pm.partial ? `${pm.filledTests}/9 testes • dados insuficientes` : `${pm.filledTests}/9 testes`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Perfil",
						value: pm.category ?? "—",
						hint: "categoria geral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Faixa esperada",
						value: `${EXPECTED_INDEX_RANGE.min}–${EXPECTED_INDEX_RANGE.max}`,
						suffix: "/100",
						hint: "para idade e sexo"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndexBar, { score: pm.partial ? null : pm.score })
			}),
			!hideSentence && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-foreground/90",
				children: situationSentence(situation, subject)
			})
		]
	});
}
function Metric({ label, value, suffix, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card/60 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-wide text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-0.5 font-display text-2xl font-bold tabular-nums",
				children: [value, suffix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-0.5 text-xs font-normal text-muted-foreground",
					children: suffix
				})]
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-muted-foreground",
				children: hint
			})
		]
	});
}
function IndexBar({ score }) {
	const pct = score == null ? null : Math.max(0, Math.min(100, score));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-3 w-full overflow-hidden rounded-full border border-border bg-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full",
						style: {
							width: "25%",
							backgroundColor: "#dc2626",
							opacity: .3
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full",
						style: {
							width: "20%",
							backgroundColor: "#f97316",
							opacity: .3
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full",
						style: {
							width: "30%",
							backgroundColor: "#22c55e",
							opacity: .35
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full",
						style: {
							width: "15%",
							backgroundColor: "#3b82f6",
							opacity: .3
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full",
						style: {
							width: "10%",
							backgroundColor: "#7c3aed",
							opacity: .3
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "absolute inset-y-0 border-x-2 border-[#22c55e]/80",
				style: {
					left: `${EXPECTED_INDEX_RANGE.min}%`,
					width: `${EXPECTED_INDEX_RANGE.max - EXPECTED_INDEX_RANGE.min}%`
				}
			}),
			pct != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
				style: { left: `${pct}%` },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-5 rounded-full border-2 border-background bg-foreground shadow" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex justify-between text-[9px] uppercase tracking-wide text-muted-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-semibold text-[#16a34a]",
				children: [
					EXPECTED_INDEX_RANGE.min,
					"–",
					EXPECTED_INDEX_RANGE.max,
					" ",
					REFERENCE_LABEL
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "100" })
		]
	})] });
}
//#endregion
export { SituationBadge as n, DevelopmentSummary as t };
