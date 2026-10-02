import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { ArrowLeft, Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { importStudents, type ImportRow, type ImportResult } from "@/lib/students-import.functions";

export const Route = createFileRoute("/_authenticated/students/import")({
  head: () => ({ meta: [{ title: "Importar Alunos — ProMetric" }] }),
  component: ImportStudentsPage,
});

type ParsedRow = { row: ImportRow | null; raw: Record<string, unknown>; error?: string; lineNo: number };

const TEMPLATE_HEADERS = [
  "Nome Completo", "Sexo", "Data de Nascimento",
  "CPF", "RG", "Responsável", "Telefone", "E-mail", "Endereço",
  "Escola", "Turma", "Grupo",
] as const;

const SEX_MAP: Record<string, "male" | "female"> = {
  m: "male", masc: "male", masculino: "male", male: "male", h: "male",
  f: "female", fem: "female", feminino: "female", female: "female",
};

function normalizeKey(k: string) {
  return k.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    const y = v.getFullYear(), m = String(v.getMonth() + 1).padStart(2, "0"), d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function downloadTemplate() {
  const example = [
    ["João da Silva", "M", "2010-05-12", "", "", "Maria da Silva", "(11) 99999-0000", "joao@example.com", "Rua A, 123", "Escola Modelo", "6º Ano A", "Futebol"],
    ["Ana Souza", "F", "2011-08-30", "", "", "", "", "", "", "Escola Modelo", "6º Ano A", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS as unknown as string[], ...example]);
  ws["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alunos");
  XLSX.writeFile(wb, "modelo-importacao-alunos.xlsx");
}

function ImportStudentsPage() {
  const { tenantId } = useCurrentTenant();
  const navigate = useNavigate();
  const importFn = useServerFn(importStudents);
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"update" | "skip" | "create">("skip");
  const [result, setResult] = useState<ImportResult | null>(null);

  const stats = useMemo(() => {
    const total = parsed.length;
    const valid = parsed.filter((p) => p.row && !p.error).length;
    return { total, valid, invalid: total - valid };
  }, [parsed]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Tenant não definido");
      const validRows = parsed.filter((p) => p.row && !p.error).map((p) => p.row!) as ImportRow[];
      if (validRows.length === 0) throw new Error("Nenhuma linha válida para importar");
      return importFn({ data: { tenantId, rows: validRows, duplicateStrategy } });
    },
    onSuccess: (r) => {
      setResult(r);
      toast.success(`${r.inserted} inseridos · ${r.updated} atualizados · ${r.skipped} ignorados · ${r.errors.length} erros`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro na importação"),
  });

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: true });

        const rows: ParsedRow[] = json.map((raw, idx) => {
          // Normalize keys
          const obj: Record<string, unknown> = {};
          for (const k of Object.keys(raw)) obj[normalizeKey(k)] = raw[k];

          const fullName = String(obj["nome completo"] ?? obj["nome"] ?? "").trim();
          const sexRaw = String(obj["sexo"] ?? "").trim().toLowerCase();
          const sex = SEX_MAP[sexRaw] ?? (sexRaw === "1" ? "male" : sexRaw === "2" ? "female" : null);
          const birth = parseDate(obj["data de nascimento"] ?? obj["nascimento"] ?? obj["data nascimento"]);

          const errs: string[] = [];
          if (!fullName) errs.push("Nome obrigatório");
          if (!sex) errs.push("Sexo inválido (use M/F)");
          if (!birth) errs.push("Data de nascimento inválida");

          if (errs.length) {
            return { row: null, raw, error: errs.join("; "), lineNo: idx + 2 };
          }

          const email = String(obj["e-mail"] ?? obj["email"] ?? "").trim();
          const row: ImportRow = {
            full_name: fullName,
            sex: sex as "male" | "female",
            birth_date: birth!,
            cpf: String(obj["cpf"] ?? "").trim() || null,
            rg: String(obj["rg"] ?? "").trim() || null,
            guardian_name: String(obj["responsavel"] ?? obj["responsável"] ?? "").trim() || null,
            phone: String(obj["telefone"] ?? "").trim() || null,
            email: email || null,
            address_street: String(obj["endereco"] ?? obj["endereço"] ?? "").trim() || null,
            school_name: String(obj["escola"] ?? "").trim() || null,
            class_name: String(obj["turma"] ?? "").trim() || null,
            group_name: String(obj["grupo"] ?? "").trim() || null,
          };
          return { row, raw, lineNo: idx + 2 };
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
    const data = errorRows.map((p) => ({ ...p.raw, _erro: p.error }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Erros");
    XLSX.writeFile(wb, "erros-importacao-alunos.xlsx");
  }

  function downloadResultErrors() {
    if (!result || result.errors.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(result.errors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Erros");
    XLSX.writeFile(wb, "erros-servidor-importacao.xlsx");
  }

  return (
    <div>
      <PageHeader
        title="Importar Alunos"
        description="Cadastro em lote via planilha Excel ou CSV."
        action={
          <Button variant="outline" asChild>
            <Link to="/students"><ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">1. Baixe o modelo</h2>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Use o modelo para garantir as colunas certas. Obrigatórias: <strong>Nome Completo, Sexo, Data de Nascimento</strong>.
            Escola, Turma e Grupo serão criados automaticamente se não existirem.
          </p>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-1.5 h-4 w-4" /> Baixar Modelo Excel
          </Button>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">2. Envie a planilha</h2>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">Formatos aceitos: .xlsx, .xls, .csv (até 5.000 linhas).</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => fileRef.current?.click()} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              <Upload className="mr-1.5 h-4 w-4" /> Selecionar arquivo
            </Button>
            {fileName && <span className="truncate text-xs text-muted-foreground">{fileName}</span>}
          </div>
        </Card>
      </div>

      {parsed.length > 0 && (
        <Card className="mt-4 p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold">3. Prévia</h2>
              <p className="text-sm text-muted-foreground">
                <strong>{stats.total}</strong> encontrados · <span className="text-emerald-600">{stats.valid} válidos</span> ·{" "}
                <span className="text-destructive">{stats.invalid} inválidos</span>
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Em caso de duplicados (Nome + Nascimento)</Label>
                <Select value={duplicateStrategy} onValueChange={(v) => setDuplicateStrategy(v as typeof duplicateStrategy)}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Ignorar duplicados</SelectItem>
                    <SelectItem value="update">Atualizar dados existentes</SelectItem>
                    <SelectItem value="create">Criar mesmo assim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {stats.invalid > 0 && (
                <Button variant="outline" onClick={downloadErrors}>
                  <Download className="mr-1.5 h-4 w-4" /> Baixar erros
                </Button>
              )}
              <Button
                disabled={mutation.isPending || stats.valid === 0}
                onClick={() => mutation.mutate()}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              >
                {mutation.isPending ? "Importando…" : `Importar ${stats.valid} aluno(s)`}
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-secondary">
                <tr>
                  <th className="px-2 py-1.5 text-left">Linha</th>
                  <th className="px-2 py-1.5 text-left">Nome</th>
                  <th className="px-2 py-1.5 text-left">Sexo</th>
                  <th className="px-2 py-1.5 text-left">Nascimento</th>
                  <th className="px-2 py-1.5 text-left">Escola</th>
                  <th className="px-2 py-1.5 text-left">Turma</th>
                  <th className="px-2 py-1.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 200).map((p, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1">{p.lineNo}</td>
                    <td className="px-2 py-1">{p.row?.full_name ?? String(p.raw["Nome Completo"] ?? "")}</td>
                    <td className="px-2 py-1">{p.row?.sex ?? "—"}</td>
                    <td className="px-2 py-1">{p.row?.birth_date ?? "—"}</td>
                    <td className="px-2 py-1">{p.row?.school_name ?? "—"}</td>
                    <td className="px-2 py-1">{p.row?.class_name ?? "—"}</td>
                    <td className="px-2 py-1">
                      {p.error
                        ? <span className="text-destructive">{p.error}</span>
                        : <span className="text-emerald-600">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 200 && (
              <div className="border-t border-border bg-muted/50 px-2 py-1 text-center text-xs text-muted-foreground">
                Exibindo as primeiras 200 linhas de {parsed.length}.
              </div>
            )}
          </div>
        </Card>
      )}

      {result && (
        <Card className="mt-4 p-5">
          <h2 className="mb-3 font-display font-semibold">Relatório da importação</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Processados" value={result.processed} />
            <Stat label="Inseridos" value={result.inserted} tone="success" />
            <Stat label="Atualizados" value={result.updated} tone="info" />
            <Stat label="Ignorados" value={result.skipped} tone="muted" />
          </div>
          {(result.created.schools.length + result.created.classes.length + result.created.groups.length) > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Criados automaticamente: {result.created.schools.length} escola(s), {result.created.classes.length} turma(s), {result.created.groups.length} grupo(s).
            </p>
          )}
          {result.errors.length > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <span className="text-sm text-destructive">{result.errors.length} erro(s) no servidor.</span>
              <Button size="sm" variant="outline" onClick={downloadResultErrors}>
                <Download className="mr-1.5 h-4 w-4" /> Baixar erros
              </Button>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => { setParsed([]); setResult(null); setFileName(null); }}>
              Importar outra planilha
            </Button>
            <Button onClick={() => navigate({ to: "/students" })} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              Ir para Alunos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "info" | "muted" }) {
  const color =
    tone === "success" ? "text-emerald-600"
    : tone === "info" ? "text-primary"
    : tone === "muted" ? "text-muted-foreground"
    : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
