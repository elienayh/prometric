import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { W as MailCheck, q as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Route } from "./invite._token-CxPJTiAV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite._token-H0tGt1iR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AcceptInvite() {
	const { token } = Route.useParams();
	const navigate = useNavigate();
	const [accepting, setAccepting] = (0, import_react.useState)(false);
	const invite = useQuery({
		queryKey: ["invite", token],
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_invitations").select("id,tenant_id,email,role,status,expires_at,tenant:tenants(name,display_name)").eq("token", token).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	async function handleAccept() {
		if (!invite.data) return;
		setAccepting(true);
		try {
			const { data: userRes } = await supabase.auth.getUser();
			const user = userRes.user;
			if (!user) {
				toast.info("Entre na sua conta para aceitar o convite.");
				navigate({
					to: "/auth",
					search: { mode: "signup" }
				});
				return;
			}
			if (invite.data.email && user.email && invite.data.email.toLowerCase() !== user.email.toLowerCase()) {
				toast.error(`Este convite foi enviado para ${invite.data.email}. Faça login com esse e-mail.`);
				return;
			}
			const { error: memberErr } = await supabase.from("tenant_members").insert([{
				tenant_id: invite.data.tenant_id,
				user_id: user.id,
				role: invite.data.role
			}]);
			if (memberErr && !memberErr.message.includes("duplicate")) throw memberErr;
			const { error: updateErr } = await supabase.from("tenant_invitations").update({
				status: "accepted",
				accepted_at: (/* @__PURE__ */ new Date()).toISOString(),
				accepted_by: user.id
			}).eq("id", invite.data.id);
			if (updateErr) throw updateErr;
			toast.success("Convite aceito! Bem-vindo à equipe.");
			navigate({ to: "/dashboard" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao aceitar convite");
		} finally {
			setAccepting(false);
		}
	}
	if (invite.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center text-sm text-muted-foreground",
		children: "Validando convite…"
	});
	if (!invite.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center p-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Convite inválido"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Este link de convite não existe ou já foi utilizado."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Voltar ao início"
					})
				})
			]
		})
	});
	const expired = new Date(invite.data.expires_at).getTime() < Date.now();
	const used = invite.data.status !== "pending";
	const tenantName = invite.data.tenant?.display_name ?? invite.data.tenant?.name ?? "esta organização";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-background p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-pop",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailCheck, { className: "h-7 w-7 text-primary" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-4 font-display text-2xl font-bold",
					children: ["Convite para ", tenantName]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						"Você foi convidado(a) para entrar como ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: invite.data.role }),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: ["E-mail do convite: ", invite.data.email]
				}),
				expired ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-destructive",
					children: "Este convite expirou. Solicite um novo ao administrador."
				}) : used ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted-foreground",
					children: "Este convite já foi utilizado."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: handleAccept,
					disabled: accepting,
					className: "mt-6 w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
					children: [accepting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Aceitar convite"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					className: "mt-2 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Cancelar"
					})
				})
			]
		})
	});
}
//#endregion
export { AcceptInvite as component };
