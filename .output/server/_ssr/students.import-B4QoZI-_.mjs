import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Card } from "./card-CzXpCsbD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as Upload, ft as Download, ot as FileSpreadsheet, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { t as createSsrRpc } from "./createSsrRpc-p5Uzme7Q.mjs";
import { a as objectType, n as enumType, o as stringType, r as literalType, t as arrayType } from "../_libs/zod.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader } from "./page-header-BgOgZloR.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { i as writeFileSync, n as readSync, r as utils, t as SSF } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/students.import-B4QoZI-_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RowSchema = objectType({
	full_name: stringType().trim().min(1).max(200),
	sex: enumType(["male", "female"]),
	birth_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
	cpf: stringType().trim().max(20).optional().nullable(),
	rg: stringType().trim().max(30).optional().nullable(),
	guardian_name: stringType().trim().max(200).optional().nullable(),
	phone: stringType().trim().max(40).optional().nullable(),
	email: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
	address_street: stringType().trim().max(255).optional().nullable(),
	school_name: stringType().trim().max(200).optional().nullable(),
	class_name: stringType().trim().max(200).optional().nullable(),
	group_name: stringType().trim().max(200).optional().nullable()
});
var InputSchema = objectType({
	tenantId: stringType().uuid(),
	rows: arrayType(RowSchema).min(1).max(5e3),
	duplicateStrategy: enumType([
		"update",
		"skip",
		"create"
	])
});
var importStudents = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => InputSchema.parse(d)).handler(createSsrRpc("23dc3893d484c180749a99cdc01d063fc9e0badfeef063164d66b6e23ead3307"));
var TEMPLATE_HEADERS = [
	"Nome Completo",
	"Sexo",
	"Data de Nascimento",
	"CPF",
	"RG",
	"Responsável",
	"Telefone",
	"E-mail",
	"Endereço",
	"Escola",
	"Turma",
	"Grupo"
];
var SEX_MAP = {
	m: "male",
	masc: "male",
	masculino: "male",
	male: "male",
	h: "male",
	f: "female",
	fem: "female",
	feminino: "female",
	female: "female"
};
function normalizeKey(k) {
	return k.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function parseDate(v) {
	if (v == null || v === "") return null;
	if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
	if (typeof v === "number") {
		const d = SSF.parse_date_code(v);
		if (!d) return null;
		return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
	}
	const s = String(v).trim();
	let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (m) return `${m[1]}-${m[2]}-${m[3]}`;
	m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
	if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
	return null;
}
function downloadTemplate() {
	const ws = utils.aoa_to_sheet([TEMPLATE_HEADERS, ...[[
		"João da Silva",
		"M",
		"2010-05-12",
		"",
		"",
		"Maria da Silva",
		"(11) 99999-0000",
		"joao@example.com",
		"Rua A, 123",
		"Escola Modelo",
		"6º Ano A",
		"Futebol"
	], [
		"Ana Souza",
		"F",
		"2011-08-30",
		"",
		"",
		"",
		"",
		"",
		"",
		"Escola Modelo",
		"6º Ano A",
		""
	]]]);
	ws["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "Alunos");
	writeFileSync(wb, "modelo-importacao-alunos.xlsx");
}
function ImportStudentsPage() {
	const { tenantId } = useCurrentTenant();
	const navigate = useNavigate();
	const importFn = useServerFn(importStudents);
	const fileRef = (0, import_react.useRef)(null);
	const [parsed, setParsed] = (0, import_react.useState)([]);
	const [fileName, setFileName] = (0, import_react.useState)(null);
	const [duplicateStrategy, setDuplicateStrategy] = (0, import_react.useState)("skip");
	const [result, setResult] = (0, import_react.useState)(null);
	const stats = (0, import_react.useMemo)(() => {
		const total = parsed.length;
		const valid = parsed.filter((p) => p.row && !p.error).length;
		return {
			total,
			valid,
			invalid: total - valid
		};
	}, [parsed]);
	const mutation = useMutation({
		mutationFn: async () => {
			if (!tenantId) throw new Error("Tenant não definido");
			const validRows = parsed.filter((p) => p.row && !p.error).map((p) => p.row);
			if (validRows.length === 0) throw new Error("Nenhuma linha válida para importar");
			return importFn({ data: {
				tenantId,
				rows: validRows,
				duplicateStrategy
			} });
		},
		onSuccess: (r) => {
			setResult(r);
			toast.success(`${r.inserted} inseridos · ${r.updated} atualizados · ${r.skipped} ignorados · ${r.errors.length} erros`);
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Erro na importação")
	});
	function handleFile(file) {
		setFileName(file.name);
		setResult(null);
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const wb = readSync(new Uint8Array(e.target?.result), {
					type: "array",
					cellDates: true
				});
				const ws = wb.Sheets[wb.SheetNames[0]];
				const rows = utils.sheet_to_json(ws, {
					defval: "",
					raw: true
				}).map((raw, idx) => {
					const obj = {};
					for (const k of Object.keys(raw)) obj[normalizeKey(k)] = raw[k];
					const fullName = String(obj["nome completo"] ?? obj["nome"] ?? "").trim();
					const sexRaw = String(obj["sexo"] ?? "").trim().toLowerCase();
					const sex = SEX_MAP[sexRaw] ?? (sexRaw === "1" ? "male" : sexRaw === "2" ? "female" : null);
					const birth = parseDate(obj["data de nascimento"] ?? obj["nascimento"] ?? obj["data nascimento"]);
					const errs = [];
					if (!fullName) errs.push("Nome obrigatório");
					if (!sex) errs.push("Sexo inválido (use M/F)");
					if (!birth) errs.push("Data de nascimento inválida");
					if (errs.length) return {
						row: null,
						raw,
						error: errs.join("; "),
						lineNo: idx + 2
					};
					const email = String(obj["e-mail"] ?? obj["email"] ?? "").trim();
					return {
						row: {
							full_name: fullName,
							sex,
							birth_date: birth,
							cpf: String(obj["cpf"] ?? "").trim() || null,
							rg: String(obj["rg"] ?? "").trim() || null,
							guardian_name: String(obj["responsavel"] ?? obj["responsável"] ?? "").trim() || null,
							phone: String(obj["telefone"] ?? "").trim() || null,
							email: email || null,
							address_street: String(obj["endereco"] ?? obj["endereço"] ?? "").trim() || null,
							school_name: String(obj["escola"] ?? "").trim() || null,
							class_name: String(obj["turma"] ?? "").trim() || null,
							group_name: String(obj["grupo"] ?? "").trim() || null
						},
						raw,
						lineNo: idx + 2
					};
				});
				setParsed(rows);
				if (rows.length === 0) toast.warning("Planilha vazia");
			} catch (err) {
				toast.error("Não foi possível ler a planilha");
				console.error(err);
			}
		};
		reader.readAsArrayBuffer(file);
	}
	function downloadErrors() {
		const errorRows = parsed.filter((p) => p.error);
		if (errorRows.length === 0) return;
		const data = errorRows.map((p) => ({
			...p.raw,
			_erro: p.error
		}));
		const ws = utils.json_to_sheet(data);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, "Erros");
		writeFileSync(wb, "erros-importacao-alunos.xlsx");
	}
	function downloadResultErrors() {
		if (!result || result.errors.length === 0) return;
		const ws = utils.json_to_sheet(result.errors);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, "Erros");
		writeFileSync(wb, "erros-servidor-importacao.xlsx");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Importar Alunos",
			description: "Cadastro em lote via planilha Excel ou CSV.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/students",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1.5 h-4 w-4" }), " Voltar"]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-semibold",
							children: "1. Baixe o modelo"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: [
							"Use o modelo para garantir as colunas certas. Obrigatórias: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Nome Completo, Sexo, Data de Nascimento" }),
							". Escola, Turma e Grupo serão criados automaticamente se não existirem."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: downloadTemplate,
						variant: "outline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-4 w-4" }), " Baixar Modelo Excel"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-semibold",
							children: "2. Envie a planilha"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: "Formatos aceitos: .xlsx, .xls, .csv (até 5.000 linhas)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: ".xlsx,.xls,.csv",
						className: "hidden",
						onChange: (e) => {
							const f = e.target.files?.[0];
							if (f) handleFile(f);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => fileRef.current?.click(),
							className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1.5 h-4 w-4" }), " Selecionar arquivo"]
						}), fileName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-xs text-muted-foreground",
							children: fileName
						})]
					})
				]
			})]
		}),
		parsed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "3. Prévia"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stats.total }),
						" encontrados · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-emerald-600",
							children: [stats.valid, " válidos"]
						}),
						" ·",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-destructive",
							children: [stats.invalid, " inválidos"]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Em caso de duplicados (Nome + Nascimento)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: duplicateStrategy,
								onValueChange: (v) => setDuplicateStrategy(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "w-56",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "skip",
										children: "Ignorar duplicados"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "update",
										children: "Atualizar dados existentes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "create",
										children: "Criar mesmo assim"
									})
								] })]
							})]
						}),
						stats.invalid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: downloadErrors,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-4 w-4" }), " Baixar erros"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: mutation.isPending || stats.valid === 0,
							onClick: () => mutation.mutate(),
							className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
							children: mutation.isPending ? "Importando…" : `Importar ${stats.valid} aluno(s)`
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-96 overflow-auto rounded-lg border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "sticky top-0 bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Linha"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Nome"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Sexo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Nascimento"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Escola"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Turma"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 text-left",
								children: "Status"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: parsed.slice(0, 200).map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.lineNo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.row?.full_name ?? String(p.raw["Nome Completo"] ?? "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.row?.sex ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.row?.birth_date ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.row?.school_name ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.row?.class_name ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1",
								children: p.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: p.error
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-emerald-600",
									children: "OK"
								})
							})
						]
					}, i)) })]
				}), parsed.length > 200 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border bg-muted/50 px-2 py-1 text-center text-xs text-muted-foreground",
					children: [
						"Exibindo as primeiras 200 linhas de ",
						parsed.length,
						"."
					]
				})]
			})]
		}),
		result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display font-semibold",
					children: "Relatório da importação"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Processados",
							value: result.processed
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Inseridos",
							value: result.inserted,
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Atualizados",
							value: result.updated,
							tone: "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Ignorados",
							value: result.skipped,
							tone: "muted"
						})
					]
				}),
				result.created.schools.length + result.created.classes.length + result.created.groups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Criados automaticamente: ",
						result.created.schools.length,
						" escola(s), ",
						result.created.classes.length,
						" turma(s), ",
						result.created.groups.length,
						" grupo(s)."
					]
				}),
				result.errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-destructive",
						children: [result.errors.length, " erro(s) no servidor."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: downloadResultErrors,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-4 w-4" }), " Baixar erros"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							setParsed([]);
							setResult(null);
							setFileName(null);
						},
						children: "Importar outra planilha"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => navigate({ to: "/students" }),
						className: "bg-gradient-brand text-primary-foreground hover:opacity-90",
						children: "Ir para Alunos"
					})]
				})
			]
		})
	] });
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-display text-2xl font-bold ${tone === "success" ? "text-emerald-600" : tone === "info" ? "text-primary" : tone === "muted" ? "text-muted-foreground" : "text-foreground"}`,
			children: value
		})]
	});
}
//#endregion
export { ImportStudentsPage as component };
