import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { q as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-KAYevPg5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
		});
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) setReady(true);
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	async function handleSubmit(e) {
		e.preventDefault();
		if (password.length < 6) return toast.error("Mínimo 6 caracteres");
		if (password !== confirm) return toast.error("As senhas não conferem");
		setLoading(true);
		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			toast.success("Senha redefinida com sucesso");
			navigate({ to: "/dashboard" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao redefinir senha");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-background p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-pop",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Redefinir senha"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Defina sua nova senha de acesso."
				}),
				!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted-foreground",
					children: "Validando link…"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "new-password",
								children: "Nova senha"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "new-password",
								type: "password",
								minLength: 6,
								required: true,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "h-11"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "confirm-password",
								children: "Confirmar senha"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "confirm-password",
								type: "password",
								minLength: 6,
								required: true,
								value: confirm,
								onChange: (e) => setConfirm(e.target.value),
								className: "h-11"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: loading,
							className: "h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
							children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Redefinir senha"]
						})
					]
				})
			]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
