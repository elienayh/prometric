import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { Bt as Activity, Ft as BookOpen, Mt as Calculator, dt as Dumbbell, et as HeartPulse, kt as ChartColumn, rt as Gauge, t as Zap, v as StretchHorizontal, x as ShieldCheck, xt as CircleQuestionMark, y as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/knowledge-DQg_gPLx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SECTIONS = [
	{
		id: "metodo",
		label: "O Método",
		icon: BookOpen,
		render: MethodPage
	},
	{
		id: "indice",
		label: "Índice ProMetric",
		icon: Activity,
		render: IndexPage
	},
	{
		id: "calculos",
		label: "Cálculos",
		icon: Calculator,
		render: CalcPage
	},
	{
		id: "interpretacao",
		label: "Interpretação",
		icon: Sparkles,
		render: InterpPage
	},
	{
		id: "graficos",
		label: "Gráficos",
		icon: ChartColumn,
		render: ChartsPage
	},
	{
		id: "faq",
		label: "FAQ",
		icon: CircleQuestionMark,
		render: FaqPage
	},
	{
		id: "transparencia",
		label: "Transparência",
		icon: ShieldCheck,
		render: TranspPage
	}
];
function KnowledgePage() {
	const [active, setActive] = (0, import_react.useState)(SECTIONS[0].id);
	(0, import_react.useEffect)(() => {
		const applyHash = () => {
			const h = window.location.hash.replace(/^#/, "");
			if (h && SECTIONS.some((s) => s.id === h)) setActive(h);
		};
		applyHash();
		window.addEventListener("hashchange", applyHash);
		return () => window.removeEventListener("hashchange", applyHash);
	}, []);
	const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero shadow-glow",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-6 w-6 text-white" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Central de Conhecimento"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Entenda a metodologia, os cálculos e como interpretar os indicadores do ProMetric."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[220px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "space-y-1",
				children: SECTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					onClick: () => setActive(s.id),
					className: cn("w-full justify-start gap-2", active === s.id && "bg-accent/50 text-accent-foreground font-semibold"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-4 w-4" }), s.label]
				}, s.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				id: current.id,
				className: "p-6 sm:p-8 scroll-mt-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(current.render, {})
			})]
		})]
	});
}
function MethodPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "O que é o Método ProMetric",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [
				"O ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Método ProMetric®" }),
				" é um protocolo de avaliação física escolar e esportiva que combina antropometria, testes de aptidão e inteligência artificial para acompanhar a evolução de crianças, adolescentes e atletas ao longo do tempo."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					icon: HeartPulse,
					title: "Aplicação escolar",
					text: "Mapeamento de saúde, postura e aptidão de turmas inteiras, com priorização de alunos em atenção."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					icon: Dumbbell,
					title: "Aplicação esportiva",
					text: "Detecção de talentos, controle de carga e direcionamento por modalidade."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					icon: Gauge,
					title: "Acompanhamento evolutivo",
					text: "Histórico individual, comparação com a turma e com a escola, evolução anual."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [
				"O ambiente ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "demonstrativo" }),
				" e o ambiente ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "real" }),
				" compartilham exatamente os mesmos cálculos, dashboards e relatórios. A diferença é apenas a presença de dados fictícios no ambiente demo — no ambiente real, os indicadores se preenchem automaticamente conforme professores cadastram alunos e avaliações."
			] })
		]
	});
}
function IndexPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Como funciona o Índice ProMetric",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [
				"O ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Índice ProMetric" }),
				" é um score de ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "0 a 100" }),
				" que resume o desempenho do aluno em cinco dimensões. Cada teste é convertido em uma zona de referência por sexo e idade, e essas zonas são agregadas em uma média ponderada das dimensões."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: [
				{
					icon: HeartPulse,
					name: "Saúde Corporal",
					tests: "Peso, Altura, IMC, RCE"
				},
				{
					icon: Dumbbell,
					name: "Resistência",
					tests: "Corrida 6 min, Abdominal 1 min"
				},
				{
					icon: StretchHorizontal,
					name: "Mobilidade",
					tests: "Flexibilidade (Sit & Reach)"
				},
				{
					icon: Zap,
					name: "Potência",
					tests: "Salto horizontal, Medicine Ball"
				},
				{
					icon: Gauge,
					name: "Velocidade e Agilidade",
					tests: "Corrida 20 m, Teste do Quadrado"
				}
			].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				icon: d.icon,
				title: d.name,
				text: d.tests
			}, d.name)) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "Índice = média(Saúde, Resistência, Mobilidade, Potência, Velocidade) → escala 0–100" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Classificação do índice:" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "ml-5 list-disc space-y-1 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "0–20" }), " · Crítico"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "21–40" }), " · Atenção"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "41–60" }), " · Em Desenvolvimento"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "61–80" }), " · Bom"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "81–100" }), " · Excelente"] })
				]
			})
		]
	});
}
function CalcPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Como os indicadores são calculados",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sub, {
				title: "IMC — Índice de Massa Corporal",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "IMC = Peso (kg) ÷ Altura² (m)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Example, { children: ["Aluno com 45 kg e 1,50 m → 45 ÷ (1,50 × 1,50) = ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "20,0" })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sub, {
				title: "RCE — Relação Cintura/Estatura",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "RCE = Cintura (cm) ÷ Estatura (cm)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Example, { children: [
					"Cintura 62 cm, altura 150 cm → 62 ÷ 150 = ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "0,41" }),
					" (referência saudável < 0,50)"
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sub, {
				title: "Conversão para categoria geral",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Cada teste é classificado por tabelas de referência por sexo e idade, gerando uma zona (Muito Fraco a Excelente). As zonas viram um score numérico (1–6), agregado em escala 0–100 e mapeado para a categoria final:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "ml-5 list-disc space-y-1 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Excelente" }), " — desempenho muito acima da média"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Bom" }), " — acima da média"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Em Desenvolvimento" }), " — dentro da média esperada"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Atenção" }), " — abaixo do esperado, requer acompanhamento"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Prioritário" }), " — intervenção pedagógica imediata"] })
					]
				})]
			})
		]
	});
}
function InterpPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Interpretação dos resultados",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: [
				{
					label: "Excelente",
					color: "bg-success/20 text-success border-success/30",
					desc: "Desempenho muito acima da média. Manter rotina e considerar treino orientado."
				},
				{
					label: "Bom",
					color: "bg-primary/15 text-primary border-primary/30",
					desc: "Acima da média. Boa base, espaço para evolução em dimensões específicas."
				},
				{
					label: "Em Desenvolvimento",
					color: "bg-accent/20 text-accent-foreground border-accent/30",
					desc: "Dentro do esperado para idade. Continuar trabalho regular."
				},
				{
					label: "Atenção",
					color: "bg-warning/20 text-warning border-warning/30",
					desc: "Abaixo do esperado em uma ou mais dimensões. Planejar intervenção."
				},
				{
					label: "Prioritário",
					color: "bg-destructive/15 text-destructive border-destructive/30",
					desc: "Necessita acompanhamento próximo e plano individual de evolução."
				}
			].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("rounded-lg border p-4", t.color),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: t.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-sm opacity-90",
					children: t.desc
				})]
			}, t.label))
		})
	});
}
function ChartsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Como interpretar os gráficos",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sub, {
				title: "Radar ProMetric",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Mostra o desempenho do aluno nas 5 dimensões. Quanto maior a área, melhor o perfil geral." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sub, {
				title: "Evolução temporal",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Linha do tempo com os índices das avaliações. Inclinação positiva indica progresso real." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sub, {
				title: "Comparação com a turma e com a escola",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "As barras claras representam a média da turma/escola; as escuras, o aluno. Permite identificar se o resultado é individual ou um padrão coletivo." })
			})
		]
	});
}
function FaqPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Perguntas frequentes",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: [
				{
					q: "Como calcular o IMC?",
					a: "IMC = peso em kg dividido pela altura em metros ao quadrado."
				},
				{
					q: "O que significa RCE?",
					a: "Relação Cintura/Estatura — indicador de risco cardiometabólico. Valores abaixo de 0,50 são considerados saudáveis."
				},
				{
					q: "Como interpretar o radar?",
					a: "Cada eixo é uma dimensão (Saúde, Resistência, Mobilidade, Potência, Velocidade). Áreas maiores indicam melhor desempenho geral."
				},
				{
					q: "Como melhorar o Índice ProMetric?",
					a: "Atuando nas dimensões mais baixas: combinar treino de força, resistência e mobilidade ao longo do tempo."
				},
				{
					q: "Como funciona a evolução do aluno?",
					a: "Cada avaliação gera um novo ponto histórico. A progressão é medida pela variação do índice e dos testes individuais."
				},
				{
					q: "Como são calculados os rankings?",
					a: "Por delta percentual entre a primeira e a última avaliação do aluno em cada dimensão."
				}
			].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-muted/30 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: f.q
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-sm text-muted-foreground",
					children: f.a
				})]
			}, f.q))
		})
	});
}
function TranspPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Como os dados são processados",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [
			"Todos os cálculos do ProMetric são ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "automáticos e determinísticos" }),
			": os mesmos dados produzem sempre os mesmos resultados."
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "ml-5 list-disc space-y-1 text-sm text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "As classificações usam tabelas técnicas de referência por sexo e idade." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "O Índice ProMetric é uma média das 5 dimensões, em escala 0–100." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"A ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "IA auxilia" }),
					" na interpretação, sugerindo pontos de atenção e potencialidades."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"A ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "decisão pedagógica final é sempre do professor" }),
					"."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Nenhum dado de aluno é compartilhado entre tenants — RLS isola cada escola." })
			]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-xl font-bold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children
		})]
	});
}
function Sub({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold",
			children: title
		}), children]
	});
}
function P({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm leading-relaxed text-muted-foreground",
		children
	});
}
function Grid({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
		children
	});
}
function Pill({ icon: Icon, title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-muted/30 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 font-semibold",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-primary" }),
				" ",
				title
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xs text-muted-foreground",
			children: text
		})]
	});
}
function Formula({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 font-mono text-sm",
		children
	});
}
function Example({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
			children: "Exemplo"
		}), children]
	});
}
//#endregion
export { KnowledgePage as component };
