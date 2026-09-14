import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Activity, C as Share2, Ct as CircleAlert, Lt as Award, M as QrCode, U as Mail, V as MessageCircle, a as User, d as TrendingUp, ft as Download, gt as Copy, h as Target, jt as Calendar, q as LoaderCircle, y as Sparkles } from "../_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as overallScore, r as ageFromBirth, t as TEST_META, u as zoneScore } from "./proesp-DU2T_E5l.mjs";
import { a as prometricIndex, r as categoryColor } from "./prometric-method-BGZfQ42Z.mjs";
import { c as situationSentence, o as REFERENCE_LABEL, r as EXPECTED_INDEX_RANGE, s as scoreToSituation } from "./prometric-reference-G7AL_tS3.mjs";
import { _ as ResponsiveContainer, a as YAxis, c as CartesianGrid, d as Radar, h as PolarGrid, i as LineChart, l as ReferenceArea, m as PolarRadiusAxis, o as XAxis, p as PolarAngleAxis, s as Line, t as RadarChart, v as Tooltip, y as Legend } from "../_libs/recharts+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as currentEvaluation, r as withConsolidatedView, t as consolidatedClassifications } from "./student-metrics-BReO5ZgL.mjs";
import { a as resolveLogoUrl, i as resolveBrandingChain } from "./branding-B47KYsR4.mjs";
import { n as SituationBadge, t as DevelopmentSummary } from "./development-summary-BT4-UMam.mjs";
import { t as generateEvaluationPDF } from "./pdf-report-Dv2aqzFY.mjs";
import { t as QRCodeCanvas } from "../_libs/qrcode.react.mjs";
import { i as generatePortalReport, n as ReferenceBar, r as Route } from "./portal.aluno._token-C4U38pEu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.aluno._token-LOZbm6hs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PortalAlunoRoute() {
	const { token } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalAluno, { lookupKey: token });
}
var INDICATORS = [
	{
		key: "imc",
		label: "IMC",
		valueField: "imc"
	},
	{
		key: "rce",
		label: "RCE",
		valueField: "rce"
	},
	{
		key: "flex",
		label: "Flexibilidade",
		valueField: "sit_and_reach_cm"
	},
	{
		key: "abdo",
		label: "Resistência abdominal",
		valueField: "abdominal_reps"
	},
	{
		key: "run6",
		label: "Corrida 6min",
		valueField: "run_6min_m"
	},
	{
		key: "jump",
		label: "Salto horizontal",
		valueField: "horizontal_jump_cm"
	},
	{
		key: "mball",
		label: "Potência (medicine ball)",
		valueField: "medicine_ball_m"
	},
	{
		key: "square",
		label: "Agilidade",
		valueField: "square_test_s"
	},
	{
		key: "sprint",
		label: "Velocidade 20m",
		valueField: "sprint_20m_s"
	}
];
function avgScore(rows, key) {
	const xs = rows.map((c) => c?.[key]).filter(Boolean);
	if (!xs.length) return 0;
	return xs.reduce((a, z) => a + zoneScore(z), 0) / xs.length;
}
function familyRecommendations(situation, weak) {
	const base = [];
	if (situation === "Muito abaixo" || situation === "Abaixo") {
		base.push("Estabeleça uma rotina diária de 30–60 min de movimento ativo (caminhar, correr, brincar).");
		base.push("Reduza o tempo sentado e em telas; faça pausas ativas a cada 1 hora.");
		base.push("Procure atividades em grupo ou esportivas que o aluno goste — prazer é o motor da constância.");
	} else if (situation === "Dentro do esperado") {
		base.push("Mantenha a frequência atual de atividade física e estimule novas modalidades.");
		base.push("Inclua alongamentos diários para preservar a flexibilidade.");
		base.push("Valorize cada pequeno progresso — reconhecimento sustenta motivação.");
	} else {
		base.push("Continue incentivando a prática esportiva — o aluno está em ótimo nível.");
		base.push("Estimule desafios novos e variados para evolução contínua.");
		base.push("Atenção ao descanso e à hidratação para sustentar o desempenho.");
	}
	if (weak.includes("Flexibilidade")) base.push("Inclua 10 min de alongamento diário (após acordar ou antes de dormir).");
	if (weak.includes("Corrida 6min")) base.push("Caminhadas e corridas leves 3×/semana melhoram a resistência cardiorrespiratória.");
	if (weak.includes("IMC")) base.push("Reforce hábitos alimentares equilibrados — frutas, legumes e refeições caseiras.");
	return base.slice(0, 6);
}
function PortalAluno({ lookupKey }) {
	const token = lookupKey;
	const [showQR, setShowQR] = (0, import_react.useState)(false);
	const q = useQuery({
		queryKey: ["portal", token],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("portal_get_data", { _token: token });
			if (error) throw error;
			return data;
		}
	});
	const [resolvedLogo, setResolvedLogo] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		supabase.rpc("portal_log_access", {
			_token: token,
			_ua: navigator.userAgent
		}).then(() => {});
	}, [token]);
	const brandSources = q.data?.branding;
	const brand = (0, import_react.useMemo)(() => resolveBrandingChain(brandSources?.group, brandSources?.school, brandSources?.tenant), [brandSources]);
	(0, import_react.useEffect)(() => {
		let alive = true;
		resolveLogoUrl(brand.logoUrl).then((u) => {
			if (alive) setResolvedLogo(u);
		});
		return () => {
			alive = false;
		};
	}, [brand.logoUrl]);
	const portalReportFn = useServerFn(generatePortalReport);
	const aiReport = useMutation({
		mutationFn: () => portalReportFn({ data: { token } }),
		onError: (e) => toast.error(e.message || "Não foi possível gerar o relatório.")
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center text-sm text-muted-foreground",
		children: "Carregando portal…"
	});
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center p-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-display font-bold",
			children: "Link inválido"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "Este portal não está disponível. Solicite ao professor um novo link."
		})] })
	});
	const { student, evaluations: rawEvaluations, class_latest, school_latest } = q.data;
	const evaluations = withConsolidatedView(rawEvaluations);
	const clinicalEvaluations = evaluations.filter((e) => Object.values(e.classifications ?? {}).some(Boolean));
	const first = clinicalEvaluations[0] ?? null;
	const last = currentEvaluation(clinicalEvaluations);
	const currentClassifications = consolidatedClassifications(rawEvaluations);
	last && overallScore(currentClassifications);
	const pm = last ? prometricIndex(currentClassifications) : null;
	const pmFirst = first ? prometricIndex(first.classifications ?? {}) : null;
	const age = ageFromBirth(student.birth_date);
	const portalUrl = typeof window !== "undefined" ? window.location.href : "";
	const firstName = student.full_name.split(" ")[0];
	const situation = pm ? scoreToSituation(pm.score, pm.partial) : null;
	const headerGradient = `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`;
	const evolution = clinicalEvaluations.map((e) => ({
		date: new Date(e.evaluated_at).toLocaleDateString("pt-BR", {
			month: "short",
			year: "2-digit"
		}),
		score: prometricIndex(e.classifications ?? {}).score
	}));
	const diff = pm && pmFirst ? pm.score - pmFirst.score : 0;
	const insights = (() => {
		if (!last) return {
			strong: [],
			weak: []
		};
		const strong = [];
		const weak = [];
		for (const i of INDICATORS) {
			const z = last.classifications?.[i.key];
			if (!z) continue;
			if (z === "Excelente" || z === "Muito Bom") strong.push(i.label);
			if (z === "Fraco" || z === "Muito Fraco") weak.push(i.label);
		}
		return {
			strong,
			weak
		};
	})();
	const highlight = (() => {
		if (!pm) return null;
		const dims = pm.dimensions.filter((d) => d.category !== null);
		if (dims.length === 0) return null;
		const firstDims = pmFirst?.dimensions ?? [];
		return {
			evoluiu: dims.map((d, i) => ({
				d,
				delta: d.score - (firstDims[i]?.score ?? d.score)
			})).sort((a, b) => b.delta - a.delta)[0],
			potencial: [...dims].sort((a, b) => b.score - a.score)[0],
			atencao: [...dims].sort((a, b) => a.score - b.score)[0],
			perfil: pm.category
		};
	})();
	const radarData = INDICATORS.map((i) => ({
		metric: i.label.split(" ")[0],
		Referência: 4,
		Aluno: last ? zoneScore(last.classifications?.[i.key]) : 0,
		Turma: avgScore(class_latest ?? [], i.key),
		Escola: avgScore(school_latest ?? [], i.key)
	}));
	const share = (kind) => {
		const msg = `Acompanhe a evolução de ${student.full_name} no ProMetric: ${portalUrl}`;
		if (kind === "copy") {
			navigator.clipboard.writeText(portalUrl);
			toast.success("Link copiado");
		} else if (kind === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
		else window.open(`mailto:?subject=${encodeURIComponent("Evolução " + student.full_name)}&body=${encodeURIComponent(msg)}`);
	};
	const recomendacoes = familyRecommendations(situation, insights.weak);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "text-primary-foreground",
			style: { background: headerGradient },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-4 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [resolvedLogo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: resolvedLogo,
							alt: brand.displayName,
							className: "h-9 w-9 rounded-lg bg-white/10 object-contain p-1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs opacity-90",
							children: brand.displayName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/15 sm:h-20 sm:w-20",
							children: student.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: student.photo_url,
								alt: "",
								className: "h-full w-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-9 w-9" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate font-display text-xl font-black sm:text-2xl",
									children: student.full_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-xs opacity-90",
									children: [
										age,
										" anos • ",
										student.sex === "male" ? "Masculino" : "Feminino",
										student.school_name && ` • ${student.school_name}`,
										student.class_name && ` • ${student.class_name}`
									]
								}),
								last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 flex items-center gap-1 text-[11px] opacity-80",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }),
										"Última avaliação: ",
										new Date(last.evaluated_at).toLocaleDateString("pt-BR")
									]
								})
							]
						})]
					}),
					pm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-wider opacity-80",
								children: "Índice ProMetric®"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-0.5 flex items-baseline gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-4xl font-black sm:text-5xl",
									children: pm.partial ? "—" : pm.score
								}), !pm.partial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm opacity-80",
									children: "/100"
								})]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SituationBadge, {
								situation,
								size: "md",
								className: "bg-white/95 !text-foreground"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed",
							children: situationSentence(situation, `O desenvolvimento físico de ${firstName}`)
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-3xl space-y-5 px-4 pt-5",
			children: [
				!last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground",
					children: "Nenhuma avaliação registrada ainda."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevelopmentSummary, {
						classifications: currentClassifications,
						studentFirstName: firstName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendBar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border bg-card p-5 shadow-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mb-1 flex items-center gap-2 font-display text-lg font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5 text-primary" }), " Evolução"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-4 text-xs text-muted-foreground",
								children: [
									"Como o Índice ProMetric® de ",
									firstName,
									" se transformou ao longo do tempo."
								]
							}),
							evolution.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground",
								children: "A evolução será apresentada automaticamente após a próxima avaliação."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
										label: "Primeira",
										value: pmFirst?.score ?? 0,
										suffix: "/100",
										hint: new Date(first.evaluated_at).toLocaleDateString("pt-BR")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
										label: "Atual",
										value: pm?.score ?? 0,
										suffix: "/100",
										hint: new Date(last.evaluated_at).toLocaleDateString("pt-BR")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
										label: "Diferença",
										value: `${diff > 0 ? "+" : ""}${diff}`,
										suffix: "pts",
										tone: diff > 0 ? "success" : diff < 0 ? "destructive" : "default",
										hint: diff > 0 ? "Evolução consistente" : diff < 0 ? "Atenção" : "Estável"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 h-56",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
										data: evolution,
										margin: {
											top: 8,
											right: 16,
											left: 0,
											bottom: 0
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												strokeDasharray: "3 3",
												stroke: "hsl(var(--border))"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "date",
												fontSize: 11,
												stroke: "hsl(var(--muted-foreground))"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												domain: [0, 100],
												fontSize: 11,
												stroke: "hsl(var(--muted-foreground))"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceArea, {
												y1: EXPECTED_INDEX_RANGE.min,
												y2: EXPECTED_INDEX_RANGE.max,
												fill: "#22c55e",
												fillOpacity: .08
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
												borderRadius: 8,
												border: "1px solid hsl(var(--border))",
												fontSize: 12
											} }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
												type: "monotone",
												dataKey: "score",
												stroke: "var(--primary)",
												strokeWidth: 3,
												dot: {
													r: 4,
													fill: "var(--primary)",
													strokeWidth: 2,
													stroke: "#fff"
												},
												activeDot: { r: 6 },
												connectNulls: true,
												isAnimationActive: false
											})
										]
									})
								})
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border bg-card p-5 shadow-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-1 font-display text-lg font-bold",
								children: "Perfil por dimensão"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-4 text-xs text-muted-foreground",
								children: [
									"Como ",
									firstName,
									" está em cada uma das 5 grandes dimensões do método ProMetric®."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: pm?.dimensions.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-card/60 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-semibold",
											children: d.dimension
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground",
											children: [
												"Faixa esperada: ",
												EXPECTED_INDEX_RANGE.min,
												"–",
												EXPECTED_INDEX_RANGE.max,
												"/100"
											]
										})] }), d.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("rounded-full border px-2 py-0.5 text-[10px]", categoryColor(d.category)),
											children: d.category
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-2 flex-1 overflow-hidden rounded-full bg-muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-gradient-brand",
												style: { width: `${d.score}%` }
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-sm font-bold tabular-nums",
											children: d.score
										})]
									})]
								}, d.dimension))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold",
									children: "Capacidades individuais"
								}), INDICATORS.map((i) => {
									const z = last.classifications?.[i.key];
									if (!z) return null;
									const raw = last[i.valueField];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mb-1 text-xs font-medium",
										children: i.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceBar, {
										zone: z,
										value: raw,
										unit: TEST_META[i.key].unit
									})] }, i.key);
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border bg-card p-5 shadow-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-1 font-display text-lg font-bold",
								children: "Comparativo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-4 text-xs text-muted-foreground",
								children: [
									firstName,
									" comparado à ",
									REFERENCE_LABEL,
									" (referência principal), à turma e à escola."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-80",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
										data: radarData,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "hsl(var(--border))" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
												dataKey: "metric",
												fontSize: 10
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
												domain: [0, 6],
												tick: false,
												axisLine: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
												name: REFERENCE_LABEL,
												dataKey: "Referência",
												stroke: "#22c55e",
												strokeDasharray: "4 4",
												fill: "#22c55e",
												fillOpacity: .12
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
												name: "Aluno",
												dataKey: "Aluno",
												stroke: "hsl(var(--primary))",
												fill: "hsl(var(--primary))",
												fillOpacity: .45
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
												name: "Turma",
												dataKey: "Turma",
												stroke: "#a855f7",
												fill: "#a855f7",
												fillOpacity: .12
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
												name: "Escola",
												dataKey: "Escola",
												stroke: "#0ea5e9",
												fill: "#0ea5e9",
												fillOpacity: .08
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } })
										]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: "Comparação anônima — colegas não são identificados."
							})
						]
					}),
					highlight && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border bg-gradient-card p-5 shadow-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mb-4 flex items-center gap-2 font-display text-lg font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-5 w-5 text-primary" }), " Destaques"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HighlightCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }),
									title: "Maior evolução",
									value: highlight.evoluiu.d.dimension,
									detail: `${highlight.evoluiu.delta > 0 ? "+" : ""}${highlight.evoluiu.delta} pts`,
									tone: "success"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HighlightCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-4 w-4" }),
									title: "Maior potencial",
									value: highlight.potencial.dimension,
									detail: `${highlight.potencial.score}/100`,
									tone: "primary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HighlightCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
									title: "Principal atenção",
									value: highlight.atencao.dimension,
									detail: `${highlight.atencao.score}/100`,
									tone: "warning"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HighlightCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" }),
									title: "Perfil predominante",
									value: highlight.perfil ?? "—",
									detail: "categoria geral",
									tone: "default"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border bg-card p-5 shadow-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-1 font-display text-lg font-bold",
								children: "Recomendações para a família"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-4 text-xs text-muted-foreground",
								children: [
									"Sugestões baseadas na situação atual de ",
									firstName,
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-sm",
								children: recomendacoes.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 text-success",
										children: "✓"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r })]
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 rounded-xl border bg-gradient-card p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mt-0.5 h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold",
												children: "Parecer personalizado com IA"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-xs text-muted-foreground",
												children: "Análise completa com plano de evolução e atividades sugeridas, gerada pela IA configurada pela sua escola."
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => aiReport.mutate(),
										disabled: aiReport.isPending,
										className: "mt-3 bg-gradient-brand text-primary-foreground hover:opacity-90",
										size: "sm",
										children: aiReport.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }), " Gerando…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1.5 h-3.5 w-3.5" }),
											" ",
											aiReport.data ? "Atualizar parecer" : "Gerar parecer com IA"
										] })
									}),
									aiReport.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 space-y-4 rounded-xl border bg-background/60 p-4 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Parecer"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "whitespace-pre-line leading-relaxed",
												children: aiReport.data.parecer
											})] }),
											aiReport.data.evolucao && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Evolução"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "whitespace-pre-line leading-relaxed",
												children: aiReport.data.evolucao
											})] }),
											aiReport.data.plano_evolucao?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Plano de evolução"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
												className: "ml-4 list-decimal space-y-1",
												children: aiReport.data.plano_evolucao.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: p }, i))
											})] }),
											aiReport.data.atividades_sugeridas?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Atividades sugeridas"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "ml-4 list-disc space-y-1",
												children: aiReport.data.atividades_sugeridas.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: a }, i))
											})] }),
											aiReport.data.recomendacoes_familia?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Recomendações personalizadas"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "ml-4 list-disc space-y-1",
												children: aiReport.data.recomendacoes_familia.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground",
												children: [
													"Gerado em ",
													new Date(aiReport.data.generatedAt).toLocaleString("pt-BR"),
													" • IA: ",
													aiReport.data.provider
												]
											})
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border bg-card p-5 shadow-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-1 font-display text-lg font-bold",
								children: "Histórico de avaliações"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-xs text-muted-foreground",
								children: "Linha do tempo com todas as avaliações realizadas."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "relative ml-3 space-y-4 border-l border-border pl-5",
								children: [...clinicalEvaluations].reverse().map((e) => {
									const epm = prometricIndex(e.classifications ?? {});
									const esit = scoreToSituation(epm.score, epm.partial);
									const eo = overallScore(e.classifications ?? {});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm font-semibold",
													children: new Date(e.evaluated_at).toLocaleDateString("pt-BR", {
														day: "2-digit",
														month: "long",
														year: "numeric"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-mono font-semibold tabular-nums text-foreground",
															children: [epm.score, "/100"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SituationBadge, { situation: esit }),
														eo.label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px]",
															children: eo.label
														})
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => generateEvaluationPDF(brand.displayName, {
													...e,
													waist_cm: null,
													hip_cm: null,
													wingspan_cm: null,
													ai_diagnosis: null,
													notes: null,
													student: {
														full_name: student.full_name,
														sex: student.sex,
														birth_date: student.birth_date
													}
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-3.5 w-3.5" }), " Ver"]
											})]
										})]
									}, e.id);
								})
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border bg-card p-4 shadow-soft",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mb-3 flex items-center gap-2 font-display font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }), " Compartilhar este portal"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => share("copy"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-1.5 h-3.5 w-3.5" }), " Copiar"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => share("whatsapp"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mr-1.5 h-3.5 w-3.5" }), " WhatsApp"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => share("email"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mr-1.5 h-3.5 w-3.5" }), " E-mail"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => setShowQR((v) => !v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "mr-1.5 h-3.5 w-3.5" }), " QR Code"]
								})
							]
						}),
						showQR && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid place-items-center rounded-xl bg-white p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeCanvas, {
								value: portalUrl,
								size: 180
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "pt-4 text-center text-[11px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								evaluations.length,
								" avaliação",
								evaluations.length === 1 ? "" : "ões"
							] }), last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Atualizado em ", new Date(last.evaluated_at).toLocaleDateString("pt-BR")] })] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 font-display font-semibold",
							children: "ProMetric®"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5",
							children: "Acompanhamento contínuo da evolução física"
						})
					]
				})
			]
		})]
	});
}
function StatBox({ label, value, suffix, hint, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border bg-card/60 p-3 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-wide text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-0.5 font-display text-xl font-bold tabular-nums", tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground"),
				children: [value, suffix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-0.5 text-xs font-normal text-muted-foreground",
					children: suffix
				})]
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-muted-foreground",
				children: hint
			})
		]
	});
}
function HighlightCard({ icon, title, value, detail, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl border p-3", {
			success: "border-success/30 bg-success/5",
			primary: "border-primary/30 bg-primary/5",
			warning: "border-warning/30 bg-warning/5",
			default: "border-border bg-card/60"
		}[tone]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
				children: [icon, title]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-display text-base font-bold leading-tight",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted-foreground",
				children: detail
			})
		]
	});
}
function LegendBar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap items-center justify-center gap-2 rounded-xl border bg-card/60 px-3 py-2 text-[10px] text-muted-foreground",
		children: [
			{
				label: "Muito abaixo",
				color: "#dc2626"
			},
			{
				label: "Abaixo",
				color: "#f97316"
			},
			{
				label: "Dentro do esperado",
				color: "#22c55e"
			},
			{
				label: "Acima",
				color: "#3b82f6"
			},
			{
				label: "Muito acima",
				color: "#7c3aed"
			}
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-2 w-3 rounded-sm",
				style: {
					backgroundColor: i.color,
					opacity: .7
				}
			}), i.label]
		}, i.label))
	});
}
//#endregion
export { PortalAluno, PortalAlunoRoute as component };
