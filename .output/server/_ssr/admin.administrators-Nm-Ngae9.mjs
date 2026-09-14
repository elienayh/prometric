import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as Plus, gt as Copy, p as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as logAudit } from "./use-admin-4ZxV4WX8.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.administrators-Nm-Ngae9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleLabel = {
	super_admin: "Super Admin",
	admin_financeiro: "Admin Financeiro",
	admin_suporte: "Admin Suporte",
	admin_operacional: "Admin Operacional"
};
function AdministratorsPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const admins = useQuery({
		queryKey: ["admin-list"],
		queryFn: async () => {
			const { data, error } = await supabase.from("admin_roles").select("id, role, user_id, created_at").order("created_at", { ascending: false });
			if (error) throw error;
			const ids = Array.from(new Set((data ?? []).map((r) => r.user_id)));
			const profs = ids.length ? (await supabase.from("profiles").select("id, full_name, email").in("id", ids)).data ?? [] : [];
			const map = new Map(profs.map((p) => [p.id, p]));
			return (data ?? []).map((r) => ({
				...r,
				profile: map.get(r.user_id) ?? null
			}));
		}
	});
	const invites = useQuery({
		queryKey: ["admin-invites"],
		queryFn: async () => {
			const { data, error } = await supabase.from("admin_invitations").select("id, email, role, status, token, expires_at, created_at").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const [form, setForm] = (0, import_react.useState)({
		email: "",
		role: "admin_suporte"
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!form.email) throw new Error("Informe o e-mail");
			const { error } = await supabase.from("admin_invitations").insert({
				email: form.email.toLowerCase(),
				role: form.role
			});
			if (error) throw error;
			await logAudit("admin_invitation.created", { metadata: {
				email: form.email,
				role: form.role
			} });
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-invites"] });
			toast.success("Convite criado. Copie o link e envie ao destinatário.");
			setOpen(false);
			setForm({
				email: "",
				role: "admin_suporte"
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const revoke = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("admin_invitations").update({ status: "revoked" }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-invites"] })
	});
	const removeRole = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("admin_roles").delete().eq("id", id);
			if (error) throw error;
			await logAudit("admin_role.removed", { entity_id: id });
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-list"] });
			toast.success("Papel removido");
		},
		onError: (e) => toast.error(e.message)
	});
	const copyLink = (token) => {
		const link = `${origin}/accept-admin/${token}`;
		navigator.clipboard.writeText(link);
		toast.success("Link copiado");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold lg:text-3xl",
					children: "Administradores"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Quem tem acesso ao painel da plataforma"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Novo administrador"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Convidar administrador" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "E-mail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: form.email,
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Função" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.role,
								onValueChange: (v) => setForm({
									...form,
									role: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "super_admin",
										children: "Super Admin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "admin_financeiro",
										children: "Admin Financeiro"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "admin_suporte",
										children: "Admin Suporte"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "admin_operacional",
										children: "Admin Operacional"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => create.mutate(),
								disabled: create.isPending,
								children: "Gerar convite"
							})
						]
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Administradores ativos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						admins.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground",
							children: "Carregando..."
						}),
						!admins.isLoading && (admins.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground",
							children: "Nenhum administrador."
						}),
						(admins.data ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border/40 pb-2 last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: a.profile?.full_name ?? a.profile?.email ?? "Usuário"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: a.profile?.email
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: roleLabel[a.role]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => {
										if (confirm("Remover este papel?")) removeRole.mutate(a.id);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
								})]
							})]
						}, a.id))
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Convites"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [(invites.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground",
						children: "Nenhum convite emitido."
					}), (invites.data ?? []).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: i.email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								roleLabel[i.role],
								" • expira ",
								new Date(i.expires_at).toLocaleDateString("pt-BR")
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: i.status === "pending" ? "default" : "outline",
								children: i.status
							}), i.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => copyLink(i.token),
								title: "Copiar link",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => revoke.mutate(i.id),
								children: "Revogar"
							})] })]
						})]
					}, i.id))]
				})]
			})
		]
	});
}
//#endregion
export { AdministratorsPage as component };
