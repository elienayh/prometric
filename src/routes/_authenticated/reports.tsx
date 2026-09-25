import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader } from "@/components/layout/page-header";
import { TEST_META, ZONES, type Classifications, type Zone, zoneColor, overallScore } from "@/lib/proesp";
import { downloadStudentEvolutionPDF } from "@/lib/pdf-evolution-report";
import { cn } from "@/lib/utils";

function buildExportRows(evals: { evaluated_at: string; age_years: number | null; weight_kg: number | null; height_cm: number | null; classifications: Classifications; student: { full_name: string; sex: "male" | "female" } }[]) {
  return evals.map((e) => {
    const overall = overallScore(e.classifications ?? {});
    const row: Record<string, any> = {
      Aluno: e.student.full_name,
      Sexo: e.student.sex === "male" ? "M" : "F",
      Idade: e.age_years ?? "",
      Data: new Date(e.evaluated_at).toLocaleDateString("pt-BR"),
      Peso: e.weight_kg ?? "",
      Altura: e.height_cm ?? "",
    };
    for (const [k, m] of Object.entries(TEST_META)) {
      row[m.label] = e.classifications?.[k as keyof Classifications] ?? "";
    }
    row["Perfil geral"] = overall.label ?? "";
    row["Score"] = overall.score;
    return row;
  });
}

function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadXLSX(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Avaliações");
  XLSX.writeFile(wb, filename);
}

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Relatórios — ProMetric" }] }),
  component: ReportsPage,
});

type EvalRow = {
  id: string; evaluated_at: string; age_years: number | null;
  weight_kg: number | null; height_cm: number | null;
  classifications: Classifications;
  student: { full_name: string; sex: "male" | "female"; birth_date: string };
};

function ReportsPage() {
  const { tenantId, tenant } = useCurrentTenant();
  const [classId, setClassId] = useState<string>("all");

  const classes = useQuery({
    queryKey: ["classes-lite", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id,name").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const evals = useQuery({
    queryKey: ["evals-report", tenantId, classId], enabled: !!tenantId,
    queryFn: async () => {
      let q = supabase
        .from("evaluations")
        .select("id,evaluated_at,age_years,weight_kg,height_cm,classifications,student:students!inner(full_name,sex,birth_date,class_id)")
        .eq("tenant_id", tenantId!);
      if (classId !== "all") q = q.eq("student.class_id", classId);
      const { data, error } = await q.order("evaluated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as EvalRow[];
    },
  });

  // Distribuição por zona (todas as classificações agregadas)
  const dist = useMemo(() => {
    const counts: Record<Zone, number> = { "Muito Fraco": 0, "Fraco": 0, "Razoável": 0, "Bom": 0, "Muito Bom": 0, "Excelente": 0 };
    let total = 0;
    for (const e of evals.data ?? []) {
      for (const z of Object.values(e.classifications ?? {})) {
        if (z) { counts[z as Zone]++; total++; }
      }
    }
    return { counts, total };
  }, [evals.data]);

  // Médias por teste
  const avgByTest = useMemo(() => {
    const rows = Object.entries(TEST_META).map(([k, m]) => {
      const scores = (evals.data ?? [])
        .map((e) => e.classifications?.[k as keyof Classifications])
        .filter(Boolean) as Zone[];
      const idx = scores.length ? scores.reduce((a, z) => a + ZONES.indexOf(z), 0) / scores.length : -1;
      return { key: k, label: m.label, count: scores.length, zone: idx >= 0 ? ZONES[Math.round(idx)] : null };
    });
    return rows;
  }, [evals.data]);

  async function downloadOne(id: string) {
    const { data, error } = await supabase
      .from("evaluations").select("student_id, tenant_id").eq("id", id).single();
    if (error || !data) return;
    const name = tenant?.name ?? "ProMetric";
    await downloadStudentEvolutionPDF((data as any).student_id, (data as any).tenant_id, name);
  }


  const exportRows = useMemo(() => buildExportRows(evals.data ?? []), [evals.data]);
  const suffix = classId === "all" ? "todas-turmas" : (classes.data?.find((c) => c.id === classId)?.name ?? "turma").replace(/\s+/g, "_");

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Distribuição da turma, médias por teste e exportação em PDF/CSV/Excel." />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {classes.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{evals.data?.length ?? 0} avaliação(ões)</span>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" variant="outline" disabled={!exportRows.length}
            onClick={() => downloadCSV(`prometric-${suffix}.csv`, exportRows)}>
            <FileText className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" disabled={!exportRows.length}
            onClick={() => downloadXLSX(`prometric-${suffix}.xlsx`, exportRows)}>
            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Excel
          </Button>
        </div>
      </div>


      {!evals.data?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-gradient-card p-10 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Sem dados para gerar relatório.</p>
          <p className="mt-1 text-xs text-muted-foreground">Comece cadastrando turmas e alunos, depois registre uma avaliação.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/quick-eval">Realizar avaliação</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/students">Cadastrar aluno</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/classes">Cadastrar turma</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
            <h2 className="mb-3 font-display text-sm font-semibold">Distribuição por zona</h2>
            <div className="space-y-2">
              {ZONES.map((z) => {
                const c = dist.counts[z];
                const pct = dist.total ? (c / dist.total) * 100 : 0;
                return (
                  <div key={z} className="flex items-center gap-3 text-xs">
                    <span className={cn("w-28 rounded-full border px-2 py-0.5 text-center", zoneColor(z))}>{z}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-brand transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-right text-muted-foreground">{c} ({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
            <h2 className="mb-3 font-display text-sm font-semibold">Zona média por teste</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {avgByTest.map((r) => (
                <div key={r.key} className="flex items-center justify-between rounded-lg border border-border bg-card p-2">
                  <div>
                    <div className="text-xs font-medium">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground">{r.count} amostra(s)</div>
                  </div>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", zoneColor(r.zone))}>{r.zone ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
            <h2 className="mb-3 font-display text-sm font-semibold">Avaliações individuais</h2>
            <div className="divide-y divide-border">
              {evals.data.map((e) => {
                const ov = overallScore(e.classifications ?? {});
                return (
                  <div key={e.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{e.student.full_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(e.evaluated_at).toLocaleDateString("pt-BR")} • {e.age_years} anos
                      </div>
                    </div>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", zoneColor(ov.label))}>{ov.label ?? "—"}</span>
                    <Button size="sm" onClick={() => downloadOne(e.id)} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                      <Download className="mr-1 h-3.5 w-3.5" /> Gerar Relatório
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
