import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-provider-CXv-gSba.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "prometric-theme";
var Ctx = (0, import_react.createContext)(null);
function readInitial() {
	if (typeof window === "undefined") return "light";
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === "light" || saved === "dark") return saved;
	} catch {}
	return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(t) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.classList.toggle("dark", t === "dark");
	root.style.colorScheme = t;
}
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)(() => readInitial());
	(0, import_react.useEffect)(() => {
		applyTheme(theme);
	}, [theme]);
	(0, import_react.useEffect)(() => {
		const onStorage = (e) => {
			if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) setThemeState(e.newValue);
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);
	const setTheme = (t) => {
		try {
			localStorage.setItem(STORAGE_KEY, t);
		} catch {}
		setThemeState(t);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			theme,
			setTheme,
			toggle: () => setTheme(theme === "dark" ? "light" : "dark")
		},
		children
	});
}
function useTheme() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("useTheme must be used inside <ThemeProvider />");
	return v;
}
var themeBootScript = `
(function(){try{
  var k='${STORAGE_KEY}';
  var s=localStorage.getItem(k);
  var t=(s==='light'||s==='dark')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  var r=document.documentElement;
  if(t==='dark')r.classList.add('dark');else r.classList.remove('dark');
  r.style.colorScheme=t;
}catch(e){}})();
`;
//#endregion
export { themeBootScript as n, useTheme as r, ThemeProvider as t };
