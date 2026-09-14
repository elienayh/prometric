import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./accept-admin._token-DZCxSntD.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { q as LoaderCircle, x as ShieldCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accept-admin._token-CRc3w_66.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminInvitePage() {
	const { token } = Route.useParams();
	const navigate = useNavigate();
	const [state, setState] = (0, import_react.useState)("loading");
	const [error, setError] = (0, import_react.useState)("");
	const [invite, setInvite] = (0, import_react.useState)(null);
	const [authed, setAuthed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: u } = await supabase.auth.getUser();
			setAuthed(!!u.user);
			const { data, error } = await supabase.from("admin_invitations").select("email, role, status, expires_at").eq("token", token).maybeSingle();
			if (error || !data) {
				setState("error");
				setError("Convite não encontrado");
				return;
			}
			setInvite(data);
			if (data.status !== "pending") {
				setState("error");
				setError(`Convite ${data.status}`);
				return;
			}
			if (new Date(data.expires_at) < /* @__PURE__ */ new Date()) {
				setState("error");
				setError("Convite expirado");
				return;
			}
			setState(u.user ? "ready" : "needs_auth");
		})();
	}, [token]);
	const accept = async () => {
		setState("accepting");
		const { data, error } = await supabase.rpc("accept_admin_invitation", { _token: token });
		if (error) {
			setError(error.message);
			setState("error");
			toast.error(error.message);
			return;
		}
		toast.success(`Acesso concedido como ${data}`);
		setState("done");
		setTimeout(() => navigate({ to: "/admin/dashboard" }), 1200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-background flex items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero shadow-glow",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-7 w-7 text-white" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-xl font-bold",
					children: "Convite de administrador"
				}),
				state === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "inline h-4 w-4 animate-spin" }), " Validando..."]
				}),
				state === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-destructive",
					children: error
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "mt-4",
						children: "Voltar"
					})
				})] }),
				invite && (state === "needs_auth" || state === "ready" || state === "accepting") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: [
							"Você foi convidado(a) como ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: invite.role
							}),
							" da plataforma ProMetric."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: ["Convite para: ", invite.email]
					}),
					state === "needs_auth" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm",
						children: [
							"Faça login com ",
							invite.email,
							" para aceitar."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { redirect: `/accept-admin/${token}` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							children: "Entrar"
						})
					})] }),
					state === "ready" && authed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-6 w-full",
						onClick: accept,
						children: "Aceitar convite"
					}),
					state === "accepting" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-6 w-full",
						disabled: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), " Aceitando..."]
					})
				] }),
				state === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-success",
					children: "Pronto! Redirecionando..."
				})
			]
		})
	});
}
//#endregion
export { AdminInvitePage as component };
