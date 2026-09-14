import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bt as Activity, Dt as Check, Et as ChevronDown, Nt as Building2, Ot as ChartLine, Pt as Brain, Rt as ArrowRight, at as FileText, dt as Dumbbell, et as HeartPulse, kt as ChartColumn, m as Timer, nt as GraduationCap, r as Users, t as Zap, x as ShieldCheck, y as Sparkles, yt as ClipboardCheck } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { t as ThemeToggle } from "./theme-toggle-CXfE45vU.mjs";
import { t as FAQ_ITEMS } from "./routes-B1fsdnXr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-YYsOdpKB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Benefits, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatIsProMetric, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Methodology, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForSchools, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForTeachers, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pricing, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Faq, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function SiteHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2.5",
					"aria-label": "ProMetric — página inicial",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
							className: "h-5 w-5 text-primary-foreground",
							strokeWidth: 2.5
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-lg font-bold tracking-tight",
						children: ["Pro", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gradient-brand",
							children: "Metric"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Principal",
					className: "hidden items-center gap-7 text-sm text-muted-foreground md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#o-que-e",
							className: "transition-colors hover:text-foreground",
							children: "O que é"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#metodo",
							className: "transition-colors hover:text-foreground",
							children: "Método"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#como-funciona",
							className: "transition-colors hover:text-foreground",
							children: "Como funciona"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#planos",
							className: "transition-colors hover:text-foreground",
							children: "Planos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/blog",
							className: "transition-colors hover:text-foreground",
							children: "Blog"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#faq",
							className: "transition-colors hover:text-foreground",
							children: "FAQ"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "hidden sm:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Entrar"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/register",
								children: "Criar conta"
							})
						})
					]
				})
			]
		})
	});
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-0 bg-gradient-mesh opacity-90"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 16
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .5 },
				className: "mx-auto max-w-3xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "Método ProMetric® · IA diagnóstica · LGPD"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gradient-brand",
							children: "Avaliação Física Inteligente"
						}), " com IA"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
						children: "O ProMetric é a plataforma de Avaliação Física Integrada para escolas, academias e clubes. Aplique o Método ProMetric®, gere relatórios automáticos com o Índice ProMetric® de 0 a 100 e acompanhe a evolução dos alunos em 5 dimensões físicas."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-9 flex flex-wrap items-center justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							className: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/register",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-2 h-4 w-4" }), " Avaliar minha turma grátis"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							className: "border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#como-funciona",
								children: ["Ver em 60 segundos ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-muted-foreground",
						children: "Grátis até 50 alunos · Sem cartão · Pronto para usar na próxima aula"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: 24
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .6,
					delay: .15
				},
				className: "mx-auto mt-16 max-w-5xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-2xl border border-border bg-card shadow-pop",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 divide-x divide-border",
						children: [
							{
								kpi: "−92%",
								label: "Tempo de tabulação"
							},
							{
								kpi: "0–100",
								label: "Índice ProMetric® por aluno"
							},
							{
								kpi: "<5 min",
								label: "Para gerar um relatório"
							}
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-7 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-2xl font-bold text-foreground md:text-3xl",
								children: s.kpi
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs uppercase tracking-wider text-muted-foreground",
								children: s.label
							})]
						}, s.label))
					})
				})
			})]
		})]
	});
}
function Benefits() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "beneficios",
		className: "border-t border-border bg-secondary/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-20 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Por que ProMetric",
				title: "Menos planilha. Mais aula. Mais resultado.",
				description: "O professor de Educação Física merece uma ferramenta feita para a rotina real da quadra — não um Excel adaptado."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						icon: ClipboardCheck,
						title: "Avaliação Física Integrada",
						desc: "Bateria completa com classificação automática por idade e sexo. Zero cálculo manual, zero planilha."
					},
					{
						icon: FileText,
						title: "Relatórios prontos para entregar",
						desc: "PDFs profissionais por aluno, turma e escola — gerados em segundos, com a sua identidade visual."
					},
					{
						icon: Brain,
						title: "Diagnóstico por IA",
						desc: "Parecer técnico, mensagem para a família e metas de 30/60/90 dias personalizadas para cada aluno."
					},
					{
						icon: ChartColumn,
						title: "Visão de gestão",
						desc: "Indicadores de saúde e desempenho por turma, escola ou rede. Decisões pedagógicas com dado, não com achismo."
					}
				].map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-50px"
					},
					transition: {
						duration: .4,
						delay: i * .06
					},
					className: "card-interactive rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: b.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
							children: b.desc
						})
					]
				}, b.title))
			})]
		})
	});
}
function WhatIsProMetric() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "o-que-e",
		className: "border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-4xl px-6 py-20 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "O que é o ProMetric",
				title: "A plataforma de avaliação física do professor moderno",
				description: "Tecnologia, ciência do esporte e gestão pedagógica em um só lugar."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "prose-custom mt-10 space-y-5 text-foreground/90 leading-relaxed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"O ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "ProMetric" }),
						" é uma plataforma SaaS de Avaliação Física Integrada desenvolvida para professores de Educação Física, escolas, academias, clubes esportivos e personal trainers que precisam padronizar avaliações, gerar relatórios profissionais e acompanhar a evolução de alunos com base em dados objetivos."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Diferente de planilhas de Excel adaptadas, o ProMetric foi desenhado a partir da rotina real da quadra: o professor coleta os dados pelo celular, o sistema aplica o",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: " Método ProMetric®" }),
						", calcula o ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Índice ProMetric®" }),
						" de 0 a 100 e entrega relatórios prontos para a família e a direção no mesmo dia."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-semibold pt-2",
						children: "Quem utiliza o ProMetric"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Escolas" }),
						" usam o ProMetric para padronizar a avaliação física de todas as turmas, gerar indicadores de saúde da comunidade escolar e diferenciar seu projeto pedagógico no mercado. ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Professores de Educação Física" }),
						" ganham horas por semana ao automatizar tabulação, classificação e geração de PDF. ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Academias e clubes esportivos" }),
						" usam para triagem, controle de cargas e relatórios profissionais aos alunos. ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Personal trainers" }),
						" entregam relatórios premium para diferenciar seu serviço."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-semibold pt-2",
						children: "Principais benefícios"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "list-disc space-y-2 pl-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Avaliação Física Integrada ProMetric" }), " com bateria completa e protocolos padronizados."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Índice ProMetric® de 0 a 100" }), " e Perfil de Desenvolvimento Físico por aluno."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Relatórios em PDF" }), " individuais, por turma e institucionais, gerados em segundos."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Classificação automática" }), " por idade e sexo, sem cálculo manual nem risco de erro."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Histórico do aluno" }), " com evolução cronológica e Radar ProMetric® comparativo."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Inteligência artificial" }), " diagnóstica com parecer técnico e metas personalizadas."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Dashboard executivo" }), " com indicadores agregados por turma e escola."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Conformidade LGPD" }), " com dados isolados por instituição e criptografados em repouso."] })
						]
					})
				]
			})]
		})
	});
}
function Methodology() {
	const dims = [
		{
			icon: HeartPulse,
			title: "Saúde Corporal",
			desc: "Composição corporal, IMC e indicadores antropométricos por idade e sexo."
		},
		{
			icon: Activity,
			title: "Resistência",
			desc: "Capacidade cardiorrespiratória e resistência muscular localizada."
		},
		{
			icon: Sparkles,
			title: "Mobilidade",
			desc: "Flexibilidade e amplitude de movimento das principais cadeias musculares."
		},
		{
			icon: Dumbbell,
			title: "Potência",
			desc: "Força explosiva de membros inferiores e superiores em testes padronizados."
		},
		{
			icon: Timer,
			title: "Velocidade e Agilidade",
			desc: "Capacidade de aceleração, deslocamento e mudança de direção."
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "metodo",
		className: "border-t border-border bg-secondary/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl px-6 py-20 md:py-28",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					eyebrow: "Metodologia",
					title: "Método ProMetric® de Avaliação Física",
					description: "Um sistema próprio que une ciência, tecnologia e inteligência artificial para entregar um diagnóstico claro e acionável em cada avaliação."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 grid gap-5 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-6 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-primary",
								children: "Índice ProMetric®"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-2xl font-bold",
								children: "Score de 0 a 100 por aluno"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: "Um único número, fácil de comunicar, que resume o estado físico do aluno e permite acompanhar evolução real ao longo do tempo."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 space-y-2",
								children: [
									{
										label: "Crítico",
										range: "0–24",
										tone: "bg-destructive/15 text-destructive border-destructive/30"
									},
									{
										label: "Atenção",
										range: "25–44",
										tone: "bg-warning/20 text-warning border-warning/30"
									},
									{
										label: "Em Desenvolvimento",
										range: "45–64",
										tone: "bg-accent/20 text-accent-foreground border-accent/30"
									},
									{
										label: "Bom",
										range: "65–84",
										tone: "bg-primary/15 text-primary border-primary/30"
									},
									{
										label: "Excelente",
										range: "85–100",
										tone: "bg-success/20 text-success border-success/30"
									}
								].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-full border px-2 py-0.5 font-medium", c.tone),
										children: c.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-muted-foreground",
										children: c.range
									})]
								}, c.label))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-6 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-primary",
								children: "5 Dimensões"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-2xl font-bold",
								children: "Perfil de Desenvolvimento Físico"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: [
									"A avaliação é decomposta em 5 dimensões, exibidas no ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Radar ProMetric®" }),
									", para identificar com precisão pontos fortes e oportunidades de desenvolvimento."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-5 space-y-3",
								children: dims.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(d.icon, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold",
										children: d.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: d.desc
									})] })]
								}, d.title))
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 rounded-2xl border border-border bg-card p-6 shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "mt-0.5 h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-foreground/90",
							children: "Cada avaliação gera, além do Índice ProMetric®, um parecer técnico produzido por inteligência artificial: pontos de atenção, recomendações pedagógicas, mensagem para a família e metas personalizadas de 30, 60 e 90 dias."
						})]
					})
				})
			]
		})
	});
}
function HowItWorks() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "como-funciona",
		className: "border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-20 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Como funciona",
				title: "Do cadastro ao relatório final em quatro passos",
				description: "Fluxo desenhado a partir da rotina real do professor — testado em escolas, clubes e academias."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						icon: Users,
						title: "1. Cadastre os alunos",
						desc: "Importe uma planilha ou cadastre manualmente. Leva menos de 2 minutos para uma sala inteira."
					},
					{
						icon: ClipboardCheck,
						title: "2. Realize as avaliações",
						desc: "Modo Quadra otimizado para mobile: digitou, salvou, próximo aluno. Sem prancheta, sem retrabalho."
					},
					{
						icon: FileText,
						title: "3. Gere os relatórios",
						desc: "PDFs por aluno e turma com Índice ProMetric®, Radar e parecer da IA — prontos para enviar."
					},
					{
						icon: ChartLine,
						title: "4. Acompanhe a evolução",
						desc: "Compare avaliações ao longo do ano, identifique alunos em atenção e prove o impacto do seu trabalho."
					}
				].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
					initial: {
						opacity: 0,
						y: 16
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-50px"
					},
					transition: {
						duration: .4,
						delay: i * .06
					},
					className: "relative rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute -top-3 left-6 grid h-7 w-7 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground shadow-glow",
							children: i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "mb-4 h-6 w-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
							children: s.desc
						})
					]
				}, s.title))
			})]
		})
	});
}
function ForSchools() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-t border-border bg-secondary/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-20 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Para escolas",
				title: "Benefícios para escolas e coordenação",
				description: "Avaliação física como ativo estratégico: gestão, saúde e diferencial pedagógico."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						icon: Building2,
						title: "Gestão centralizada",
						desc: "Visão multi-turma e multi-escola para coordenação e direção em um único painel."
					},
					{
						icon: HeartPulse,
						title: "Indicadores de saúde",
						desc: "Identifique prevalência de sobrepeso, obesidade e baixa aptidão na comunidade escolar."
					},
					{
						icon: FileText,
						title: "Relatórios institucionais",
						desc: "PDFs por turma, série ou escola, prontos para reuniões pedagógicas e prestação de contas."
					},
					{
						icon: ChartLine,
						title: "Acompanhamento contínuo",
						desc: "Compare diagnósticos semestrais e meça o impacto pedagógico real do seu programa."
					}
				].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-interactive rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: b.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
							children: b.desc
						})
					]
				}, b.title))
			})]
		})
	});
}
function ForTeachers() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-20 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Para professores",
				title: "Benefícios para o professor de Educação Física",
				description: "Feito a partir da sua rotina: ganhe tempo, padronize e eleve o nível do seu trabalho."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3",
				children: [
					{
						icon: Timer,
						title: "Economia de tempo",
						desc: "Reduza em até 92% o tempo gasto com tabulação e geração de relatórios."
					},
					{
						icon: ClipboardCheck,
						title: "Correção automática",
						desc: "Classificação ProMetric® por idade e sexo aplicada na hora — sem planilhas, sem erro."
					},
					{
						icon: FileText,
						title: "Relatórios profissionais",
						desc: "Entregue PDFs prontos para a família e a direção no mesmo dia da avaliação."
					},
					{
						icon: Brain,
						title: "Inteligência artificial",
						desc: "Parecer técnico, mensagem para a família e metas de 30/60/90 dias por aluno."
					},
					{
						icon: ChartLine,
						title: "Histórico do aluno",
						desc: "Acompanhe a evolução cronológica de cada aluno com Radar ProMetric® comparativo."
					},
					{
						icon: Dumbbell,
						title: "Modo Quadra",
						desc: "Fluxo mobile otimizado para coletar com a turma toda em uma única aula."
					}
				].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-interactive rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: b.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
							children: b.desc
						})
					]
				}, b.title))
			})]
		})
	});
}
function Pricing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "planos",
		className: "border-t border-border bg-secondary/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-20 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Planos",
				title: "Comece grátis hoje. Faça upgrade quando crescer.",
				description: "Preço previsível, sem surpresa. Cancele quando quiser — seus dados são seus."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-6 md:grid-cols-3",
				children: [
					{
						name: "Gratuito",
						price: "R$ 0",
						period: "/ para sempre",
						features: [
							"Até 50 alunos",
							"Método ProMetric® completo",
							"Relatórios PDF individuais",
							"1 professor"
						],
						cta: "Começar grátis agora",
						highlight: false
					},
					{
						name: "Pro",
						price: "R$ 79",
						period: "/ mês",
						features: [
							"Até 500 alunos",
							"IA diagnóstica ilimitada",
							"Relatórios institucionais",
							"Dashboard executivo",
							"Suporte prioritário em até 4h"
						],
						cta: "Quero o Pro",
						highlight: true
					},
					{
						name: "Instituição",
						price: "Sob medida",
						period: "",
						features: [
							"Alunos ilimitados",
							"Multi-escola e multi-rede",
							"SSO e API de integração",
							"Onboarding e treinamento dedicados"
						],
						cta: "Falar com especialista",
						highlight: false
					}
				].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("relative flex flex-col rounded-2xl border bg-card p-6 shadow-card", p.highlight ? "border-primary/40 ring-1 ring-primary/30 shadow-pop" : "border-border"),
					children: [
						p.highlight && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute -top-3 right-6 rounded-full bg-gradient-brand px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-glow",
							children: "Mais popular"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-base font-semibold",
							children: p.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-baseline gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-3xl font-bold",
								children: p.price
							}), p.period && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: p.period
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-6 flex-1 space-y-2.5 text-sm",
							children: p.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2 text-foreground/90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
							}, f))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: cn("mt-6 w-full", p.highlight ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" : ""),
							variant: p.highlight ? "default" : "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/register",
								children: p.cta
							})
						})
					]
				}, p.name))
			})]
		})
	});
}
function Faq() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "faq",
		className: "border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-6 py-20 md:py-28",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					eyebrow: "FAQ",
					title: "Perguntas frequentes sobre o ProMetric",
					description: "Tire suas dúvidas sobre o Método ProMetric®, Avaliação Física Integrada e o uso da plataforma.",
					align: "center"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 divide-y divide-border rounded-2xl border border-border bg-card shadow-card",
					children: FAQ_ITEMS.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaqItem, {
						q: it.q,
						a: it.a
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: "Conformidade LGPD e dados criptografados em repouso."
					})]
				})
			]
		})
	});
}
function FaqItem({ q, a }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => setOpen((v) => !v),
		className: "flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/60",
		"aria-expanded": open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-medium text-foreground",
				children: q
			}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: a
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180") })]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border bg-secondary/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-between gap-3 md:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 text-primary" }), "ProMetric — Avaliação Física Inteligente com IA."]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Rodapé",
					className: "flex items-center gap-5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/blog",
							className: "hover:text-foreground",
							children: "Blog"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "hover:text-foreground",
							children: "Entrar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#faq",
							className: "hover:text-foreground",
							children: "FAQ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" ProMetric"
						] })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-6 max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground/80",
				children: "O Método ProMetric® foi desenvolvido com base em referências científicas e protocolos reconhecidos de avaliação física, ampliados com tecnologia, automação e inteligência artificial."
			})]
		})
	});
}
function SectionHeader({ eyebrow, title, description, align = "left" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("max-w-2xl", align === "center" && "mx-auto text-center"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl font-bold tracking-tight md:text-4xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base leading-relaxed text-muted-foreground",
				children: description
			})
		]
	});
}
//#endregion
export { Landing as component };
