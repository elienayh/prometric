import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Activity, q as LoaderCircle, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { n as Route, r as lovable } from "./auth-DTns_0IR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CFG8fG9O.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var accountTypes = [
	{
		value: "teacher",
		label: "Professor"
	},
	{
		value: "school",
		label: "Escola"
	},
	{
		value: "gym",
		label: "Academia"
	},
	{
		value: "club",
		label: "Clube"
	}
];
function AuthLayout() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const search = Route.useSearch();
	if (pathname === "/auth" || pathname === "/auth/") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreen, { initialMode: search.mode === "signup" ? "signup" : "signin" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
function AuthScreen({ initialMode = "signin" }) {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)(initialMode);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [accountType, setAccountType] = (0, import_react.useState)("teacher");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [googleLoading, setGoogleLoading] = (0, import_react.useState)(false);
	const [forgotOpen, setForgotOpen] = (0, import_react.useState)(false);
	const [forgotEmail, setForgotEmail] = (0, import_react.useState)("");
	const [forgotLoading, setForgotLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMode(initialMode);
	}, [initialMode]);
	async function handleForgotPassword(e) {
		e.preventDefault();
		if (!forgotEmail) return;
		setForgotLoading(true);
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin + "/reset-password" });
			if (error) throw error;
			toast.success("Enviamos um link de redefinição para seu e-mail.");
			setForgotOpen(false);
			setForgotEmail("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao enviar link");
		} finally {
			setForgotLoading(false);
		}
	}
	async function redirectAfterAuth() {
		try {
			const { data: u } = await supabase.auth.getUser();
			if (u.user) {
				const { data: roles } = await supabase.from("admin_roles").select("role").eq("user_id", u.user.id).limit(1);
				if (roles && roles.length > 0) {
					navigate({ to: "/admin" });
					return;
				}
			}
		} catch {}
		navigate({ to: "/dashboard" });
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "signup") {
				if (password !== confirmPassword) {
					toast.error("As senhas não conferem");
					return;
				}
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							full_name: fullName,
							account_type: accountType
						},
						emailRedirectTo: window.location.origin + "/dashboard"
					}
				});
				if (error) throw error;
				toast.success("Conta criada. Vamos começar 👋");
				await redirectAfterAuth();
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				toast.success("Que bom te ver de novo!");
				await redirectAfterAuth();
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erro ao autenticar";
			toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos" : msg);
		} finally {
			setLoading(false);
		}
	}
	async function handleGoogle() {
		setGoogleLoading(true);
		try {
			const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
			if (result.error) {
				toast.error("Não foi possível entrar com Google");
				setGoogleLoading(false);
				return;
			}
			if (result.redirected) return;
			await redirectAfterAuth();
		} catch {
			toast.error("Erro inesperado no login com Google");
			setGoogleLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 bg-gradient-mesh opacity-80",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-6 lg:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 lg:pr-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Voltar"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden h-full flex-col justify-center lg:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 inline-flex items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-11 w-11 place-items-center rounded-2xl bg-gradient-hero shadow-glow",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
										className: "h-5 w-5 text-white",
										strokeWidth: 2.5
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-2xl font-bold",
									children: ["Pro", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-brand",
										children: "Metric"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display text-5xl font-bold leading-[1.05] tracking-tight",
								children: [
									"A avaliação física ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									" que ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-brand",
										children: "cabe na sua aula"
									}),
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-md text-base leading-relaxed text-muted-foreground",
								children: "Método ProMetric® completo no celular, relatórios em PDF e diagnósticos por IA. Sua próxima turma pode ser avaliada hoje."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-8 space-y-2.5 text-sm text-muted-foreground",
								children: [
									"Avalie a turma em quadra, sem prancheta",
									"Classificação Método ProMetric® automática por idade e sexo",
									"Relatórios prontos para família, escola e gestão"
								].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											viewBox: "0 0 20 20",
											className: "h-3 w-3",
											fill: "currentColor",
											"aria-hidden": true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" })
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
								}, f))
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .45,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					className: "mx-auto mt-8 w-full max-w-md lg:mt-0 lg:flex lg:items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full rounded-3xl border border-border/80 bg-card/85 p-8 shadow-pop backdrop-blur-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl font-bold tracking-tight",
								children: mode === "signin" ? "Entrar no ProMetric" : "Criar sua conta grátis"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: mode === "signin" ? "Acesse seu painel e suas turmas" : "Até 50 alunos grátis, sem cartão. Cancele quando quiser."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: handleGoogle,
								disabled: googleLoading,
								variant: "outline",
								className: "mt-6 h-11 w-full",
								type: "button",
								children: [googleLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, { className: "mr-2 h-4 w-4" }), "Continuar com Google"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" }),
									" ou e-mail ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleSubmit,
								className: "space-y-4",
								children: [
									mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "name",
											children: "Nome"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "name",
											value: fullName,
											onChange: (e) => setFullName(e.target.value),
											required: true,
											placeholder: "Seu nome",
											className: "h-11"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "account-type",
											children: "Tipo"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: accountType,
											onValueChange: (value) => setAccountType(value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: "account-type",
												className: "h-11",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione o tipo de conta" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accountTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: type.value,
												children: type.label
											}, type.value)) })]
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											type: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											required: true,
											placeholder: "voce@exemplo.com",
											className: "h-11"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "password",
											children: "Senha"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "password",
											type: "password",
											value: password,
											onChange: (e) => setPassword(e.target.value),
											required: true,
											minLength: 6,
											placeholder: "Mínimo 6 caracteres",
											className: "h-11"
										})]
									}),
									mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "confirm-password",
											children: "Confirmar senha"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "confirm-password",
											type: "password",
											value: confirmPassword,
											onChange: (e) => setConfirmPassword(e.target.value),
											required: true,
											minLength: 6,
											placeholder: "Repita sua senha",
											className: "h-11"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										disabled: loading,
										className: "h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow transition-opacity hover:opacity-90",
										children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), mode === "signin" ? "Entrar" : "Criar Conta"]
									})
								]
							}),
							mode === "signin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setForgotEmail(email);
									setForgotOpen(true);
								},
								className: "mt-4 w-full text-center text-sm font-medium text-primary transition-colors hover:underline",
								children: "Esqueci minha senha"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
								open: forgotOpen,
								onOpenChange: setForgotOpen,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
									className: "sm:max-w-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Redefinir senha" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										onSubmit: handleForgotPassword,
										className: "space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted-foreground",
												children: "Informe seu e-mail e enviaremos um link para redefinir sua senha."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "forgot-email",
													children: "E-mail"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "forgot-email",
													type: "email",
													required: true,
													value: forgotEmail,
													onChange: (e) => setForgotEmail(e.target.value),
													placeholder: "voce@exemplo.com"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "submit",
												disabled: forgotLoading,
												className: "w-full bg-gradient-brand text-primary-foreground hover:opacity-90",
												children: [forgotLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Enviar link"]
											})
										]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-6 text-center text-sm text-muted-foreground",
								children: [
									mode === "signin" ? "Ainda não tem conta?" : "Já tem conta?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
										className: "font-medium text-primary transition-colors hover:underline",
										children: mode === "signin" ? "Criar grátis" : "Entrar"
									})
								]
							})
						]
					})
				})]
			})
		]
	});
}
function GoogleIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FFC107",
				d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FF3D00",
				d: "M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4CAF50",
				d: "M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2.1 1.6-4.7 2.6-7.4 2.6-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.4 16.2 44 24 44z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#1976D2",
				d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3c-.4.4 6.7-4.9 6.7-15 0-1.3-.1-2.4-.4-3.5z"
			})
		]
	});
}
//#endregion
export { AuthScreen, AuthLayout as component };
