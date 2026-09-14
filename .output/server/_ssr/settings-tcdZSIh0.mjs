import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Ct as CircleAlert, Dt as Check, St as CircleCheck, ht as Crown, p as Trash2, q as LoaderCircle, y as Sparkles } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as PROMETRIC_PROMPT_VERSION } from "./prometric-system-prompt-8Pa-OU4j.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { t as createSsrRpc } from "./createSsrRpc-p5Uzme7Q.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader } from "./page-header-BgOgZloR.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as BrandingForm } from "./branding-form-DHLCxdw7.mjs";
import { n as HOMOLOGATED_MODELS, t as DEFAULT_MODELS } from "./providers-catalog-7OxrGM4p.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-tcdZSIh0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BrandingTab({ tenant }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingForm, {
		entity: tenant,
		scope: "tenant",
		table: "tenants",
		storageFolder: tenant?.id ?? "tenant",
		hint: "Identidade visual padrão da conta. Aplicada quando Escolas ou Grupos não possuem branding próprio."
	});
}
var VALID_PROVIDERS = [
	"openai",
	"google",
	"anthropic",
	"xai",
	"lovable"
];
var getTenantAiConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	return data;
}).handler(createSsrRpc("98b53d8be3413f2d94862ceef79532dbb094c189f799ab1200e4d24fabdaa39b"));
var saveTenantAiCredential = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	if (!VALID_PROVIDERS.includes(data.provider)) throw new Error("Provedor inválido");
	if (!data.model || data.model.length < 2) throw new Error("Modelo obrigatório");
	if (data.apiKey !== void 0 && data.apiKey.length > 0 && data.apiKey.length < 8) throw new Error("Chave de API muito curta");
	return data;
}).handler(createSsrRpc("b4282c780f58a50d3891ee42d34e0df33731eed352a703b1d9f4574d9cd61d70"));
var testTenantAiCredential = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	return data;
}).handler(createSsrRpc("ab9ec8f8669caeed4094314d4cc7bfdba8f861bee25f77a24dc2442632ee7375"));
var deleteTenantAiCredential = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.tenantId) throw new Error("tenantId obrigatório");
	return data;
}).handler(createSsrRpc("45a68347b1966b9632093fee6cc58a5222ce18870212bdeffd7fea35139ed06e"));
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var PROVIDER_LABELS = {
	lovable: "ProMetric AI (padrão — sem chave necessária)",
	openai: "OpenAI (GPT)",
	google: "Google (Gemini)",
	anthropic: "Anthropic (Claude)",
	xai: "xAI (Grok)"
};
var PROVIDER_HELP = {
	lovable: "Use a IA integrada do ProMetric. O custo é pago pelo seu plano.",
	openai: "Obtenha sua chave em platform.openai.com/api-keys",
	google: "Obtenha sua chave em aistudio.google.com/app/apikey",
	anthropic: "Obtenha sua chave em console.anthropic.com/settings/keys",
	xai: "Obtenha sua chave em console.x.ai"
};
function AiTab({ tenantId }) {
	const qc = useQueryClient();
	const getConfig = useServerFn(getTenantAiConfig);
	const saveCred = useServerFn(saveTenantAiCredential);
	const testCred = useServerFn(testTenantAiCredential);
	const delCred = useServerFn(deleteTenantAiCredential);
	const cfgQuery = useQuery({
		queryKey: ["tenant-ai-config", tenantId],
		enabled: !!tenantId,
		queryFn: () => getConfig({ data: { tenantId } })
	});
	const [provider, setProvider] = (0, import_react.useState)("lovable");
	const [model, setModel] = (0, import_react.useState)(DEFAULT_MODELS.lovable);
	const [apiKey, setApiKey] = (0, import_react.useState)("");
	const [isActive, setIsActive] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const cfg = cfgQuery.data;
		if (cfg) {
			setProvider(cfg.provider);
			setModel(cfg.model);
			setIsActive(cfg.is_active);
		}
	}, [cfgQuery.data]);
	function handleProviderChange(p) {
		setProvider(p);
		setModel(DEFAULT_MODELS[p]);
		setApiKey("");
	}
	const saveMut = useMutation({
		mutationFn: async () => {
			return saveCred({ data: {
				tenantId,
				provider,
				model,
				apiKey: apiKey.length > 0 ? apiKey : void 0,
				isActive
			} });
		},
		onSuccess: () => {
			toast.success("Configuração de IA salva");
			setApiKey("");
			qc.invalidateQueries({ queryKey: ["tenant-ai-config", tenantId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const testMut = useMutation({
		mutationFn: async () => testCred({ data: { tenantId } }),
		onSuccess: (r) => {
			if (r.ok) toast.success(`Conexão OK em ${r.latencyMs}ms`);
			else toast.error(`Falhou: ${r.error}`);
			qc.invalidateQueries({ queryKey: ["tenant-ai-config", tenantId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteMut = useMutation({
		mutationFn: async () => delCred({ data: { tenantId } }),
		onSuccess: () => {
			toast.success("Configuração removida");
			setApiKey("");
			qc.invalidateQueries({ queryKey: ["tenant-ai-config", tenantId] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (!tenantId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground",
		children: "Selecione um espaço para configurar a IA."
	});
	const cfg = cfgQuery.data;
	const needsKey = provider !== "lovable";
	const hasStoredKey = cfg?.has_key && cfg?.provider === provider;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl bg-primary/10 p-2.5 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-bold",
					children: "Inteligência Artificial"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Configure o provedor de IA do seu espaço. Todas as respostas seguem o",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["Modelo ProMetric® ", PROMETRIC_PROMPT_VERSION] }),
						" independente do provedor escolhido."
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-provider",
							children: "Provedor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: provider,
							onValueChange: (v) => handleProviderChange(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "ai-provider",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(PROVIDER_LABELS).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p,
								children: PROVIDER_LABELS[p]
							}, p)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: PROVIDER_HELP[provider]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ai-model",
							children: "Modelo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: model,
							onValueChange: setModel,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "ai-model",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: HOMOLOGATED_MODELS[provider].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: m.id,
								children: m.label
							}, m.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "Apenas modelos homologados pelo ProMetric."
						})
					]
				})]
			}),
			needsKey && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ai-key",
						children: "Chave de API"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ai-key",
						type: "password",
						autoComplete: "off",
						placeholder: hasStoredKey ? `Chave salva (••••${cfg?.fingerprint ?? ""}). Deixe em branco para manter.` : "Cole sua chave aqui",
						value: apiKey,
						onChange: (e) => setApiKey(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: "Armazenada criptografada (AES-256-GCM). Nunca é exibida após salvar."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-xl border border-border bg-background/50 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ai-active",
					className: "text-sm font-medium",
					children: "Ativar esta configuração"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Quando desativada, o sistema usa a IA padrão do ProMetric."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					id: "ai-active",
					checked: isActive,
					onCheckedChange: setIsActive
				})]
			}),
			cfg?.last_tested_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex items-start gap-2 rounded-xl border p-3 text-xs ${cfg.last_test_ok ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"}`,
				children: [cfg.last_test_ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-4 w-4 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-medium",
						children: [
							"Último teste:",
							" ",
							cfg.last_test_ok ? `OK (${cfg.last_test_latency_ms}ms)` : `Falhou — ${cfg.last_test_error ?? "erro desconhecido"}`
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "opacity-70",
						children: new Date(cfg.last_tested_at).toLocaleString("pt-BR")
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => saveMut.mutate(),
						disabled: saveMut.isPending,
						children: [saveMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Salvar"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => testMut.mutate(),
						disabled: testMut.isPending || !hasStoredKey && needsKey && apiKey.length === 0,
						children: [testMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Testar conexão"]
					}),
					cfg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						className: "ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive",
						onClick: () => {
							if (confirm("Remover configuração de IA? O sistema voltará a usar a IA padrão.")) deleteMut.mutate();
						},
						disabled: deleteMut.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-4 w-4" }), "Remover"]
					})
				]
			})
		]
	});
}
function SettingsPage() {
	const { tenant, tenantId } = useCurrentTenant();
	const plans = useQuery({
		queryKey: ["plans"],
		queryFn: async () => {
			const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("sort_order");
			if (error) throw error;
			return data;
		}
	});
	const usage = useQuery({
		queryKey: ["usage", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const [students, members] = await Promise.all([supabase.from("students").select("id", {
				count: "exact",
				head: true
			}).eq("tenant_id", tenantId).eq("is_active", true), supabase.from("tenant_members").select("id", {
				count: "exact",
				head: true
			}).eq("tenant_id", tenantId)]);
			return {
				students: students.count ?? 0,
				members: members.count ?? 0
			};
		}
	});
	const currentPlan = plans.data?.find((p) => p.id === tenant?.plan_id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Configurações",
				description: "Plano, uso e ajustes do seu espaço."
			}),
			currentPlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-card p-6 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3.5 w-3.5 text-accent" }), " Plano atual"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-2xl font-bold",
						children: currentPlan.name
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Alunos utilizados"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-display text-2xl font-bold",
							children: [usage.data?.students ?? 0, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted-foreground",
								children: [" / ", currentPlan.max_students]
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 h-2 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-gradient-brand transition-all",
						style: { width: `${Math.min(100, (usage.data?.students ?? 0) / currentPlan.max_students * 100)}%` }
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingTab, { tenant }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiTab, { tenantId }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-lg font-semibold",
					children: "Planos"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
					children: plans.data?.map((p) => {
						const isCurrent = p.id === tenant?.plan_id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("relative flex flex-col rounded-2xl border p-5 shadow-soft transition", isCurrent ? "border-primary bg-gradient-card shadow-glow" : "border-border bg-card hover:border-primary/40"),
							children: [
								isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute -top-2 right-4 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground",
									children: "Atual"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg font-bold",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 font-display text-3xl font-bold",
									children: [p.price_monthly > 0 ? `R$ ${p.price_monthly.toFixed(2).replace(".", ",")}` : "Grátis", p.price_monthly > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-normal text-muted-foreground",
										children: "/mês"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-4 flex-1 space-y-1.5 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-success" }),
												" Até ",
												p.max_students.toLocaleString("pt-BR"),
												" alunos"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-success" }),
												" ",
												p.max_users,
												" usuário(s)"
											]
										}),
										p.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-success" }),
												" ",
												f
											]
										}, f))
									]
								})
							]
						}, p.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Pagamentos integrados estarão disponíveis em breve."
				})
			] })
		]
	});
}
//#endregion
export { SettingsPage as component };
