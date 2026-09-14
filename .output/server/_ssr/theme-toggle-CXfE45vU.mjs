import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as Sun, z as Moon } from "../_libs/lucide-react.mjs";
import { r as useTheme } from "./theme-provider-CXv-gSba.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-toggle-CXfE45vU.js
var import_jsx_runtime = require_jsx_runtime();
function ThemeToggle({ className }) {
	const { theme, toggle } = useTheme();
	const isDark = theme === "dark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		onClick: toggle,
		"aria-label": isDark ? "Mudar para tema claro" : "Mudar para tema escuro",
		title: isDark ? "Tema claro" : "Tema escuro",
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
			mode: "wait",
			initial: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				initial: {
					rotate: -90,
					opacity: 0,
					scale: .7
				},
				animate: {
					rotate: 0,
					opacity: 1,
					scale: 1
				},
				exit: {
					rotate: 90,
					opacity: 0,
					scale: .7
				},
				transition: {
					duration: .18,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: "grid place-items-center",
				children: isDark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" })
			}, isDark ? "moon" : "sun")
		})
	});
}
//#endregion
export { ThemeToggle as t };
