import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlertTriangle, Download, HeartPulse, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { TEST_META, zoneColor, type Classifications, type Zone } from "@/lib/proesp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/risk")({
  head: () => ({ meta: [{ title: "Saúde e Risco — ProMetric" }] }),
  component: RiskPage,
});

const RISK_ZONES: Zone[] = ["Muito Fraco", "Fraco"];

type EvalRow = {
  id: string; evaluated_at: string; student_id: string;
  classifications: Classifications;
  student: { full_name: string; class: { name: string | null } | null } | null;
};

const INDICATORS = [
  { key: "imc",    label: "IMC" },
  { key: "rce",    label: "RCE" },
  { key: "run6",   label: "Cardio (6min)" },
  { key: "flex",   label: "Flexibilidade" },
  { key: "abdo",   label: "Resistência (abdo)" },
  { key: "jump",   label: "Salto" },
  { key: "mball",  label: "Medicine Ball" },
  { key: "square", label: "Agilidade" },
  { key: "sprint", label: "Velocidade" },
] as const;

function RiskPage() {
  const { tenantId } = useCurrentTenant();
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const data = useQuery({
    queryKey: ["risk-evals", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      // Última avaliação por aluno
      const { data, error } = await supabase
        .from("evaluations")
        .select("id,evaluated_at,student_id,classifications,student:students(full_name,class:classes(name))")
        .eq("tenant_id", tenantId!)
        .order("evaluated_at", { ascending: false });
      if (error) throw error;
      const seen = new Set<string>();
      const latest: EvalRow[] = [];
      for (const e of (data as unknown as EvalRow[])) {
        if (seen.has(e.student_id)) continue;
        seen.add(e.student_id); latest.push(e);
      }
      return latest;
    },
    staleTime: 60_000,
  });

  const activeFilters = useMemo(() => Object.keys(filters).filter((k) => filters[k]), [filters]);

  const atRisk = useMemo(() => {
    const list = data.data ?? [];
    return list.filter((e) => {
      const c = e.classifications ?? {};
      const inRisk = activeFilters.length
        ? activeFilters.some((k) => c[k as keyof Classifications] && RISK_ZONES.includes(c[k as keyof Classifications]!))
        : Object.values(c).some((z) => z && RISK_ZONES.includes(z));
      if (!inRisk) return false;
      if (search && !e.student?.full_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data.data, activeFilters, search]);

  const total = data.data?.length ?? 0;
  const riskPct = total ? Math.round((atRisk.length / total) * 100) : 0;

  const byClass = useMemo(() => {
    const map: Record<string, { total: number; risk: number }> = {};
    for (const e of (data.data ?? [])) {
      const cn = e.student?.class?.name ?? "Sem turma";
      map[cn] ??= { total: 0, risk: 0 };
      map[cn].total++;
      if (atRisk.find((a) => a.id === e.id)) map[cn].risk++;
    }
    return Object.entries(map).map(([name, v]) => ({ name, "Em atenção": v.risk, Total: v.total })).sort((a, b) => b["Em atenção"] - a["Em atenção"]).slice(0, 10);
  }, [data.data, atRisk]);

  const exportData = () => {
    const rows = atRisk.map((e) => {
      const c = e.classifications ?? {};
      const issues = INDICATORS.filter((i) => c[i.key as keyof Classifications] && RISK_ZONES.includes(c[i.key as keyof Classifications]!))
        .map((i) => `${i.label} (${c[i.key as keyof Classifications]})`).join("; ");
      return {
        Aluno: e.student?.full_name ?? "",
        Turma: e.student?.class?.name ?? "",
        "Indicadores em atenção": issues,
        "Última avaliação": new Date(e.evaluated_at).toLocaleDateString("pt-BR"),
      };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Risco");
    XLSX.writeFile(wb, `alunos-em-risco-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCSV = () => {
    const rows = atRisk.map((e) => {
      const c = e.classifications ?? {};
      const issues = INDICATORS.filter((i) => c[i.key as keyof Classifications] && RISK_ZONES.includes(c[i.key as keyof Classifications]!))
        .map((i) => `${i.label}:${c[i.key as keyof Classifications]}`).join("|");
      return [e.student?.full_name ?? "", e.student?.class?.name ?? "", issues, new Date(e.evaluated_at).toLocaleDateString("pt-BR")];
    });
    const csv = "Aluno;Turma;Indicadores;Última\n" + rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `risco-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Saúde e Risco"
        description="Alunos com indicadores em zona Fraca ou Muito Fraca, com filtros, comparativos por turma e exportação."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-1 h-3.5 w-3.5" /> CSV</Button>
            <Button size="sm" onClick={exportData} className="bg-gradient-brand text-primary-foreground hover:opacity-90"><Download className="mr-1 h-3.5 w-3.5" /> Excel</Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={<HeartPulse className="h-4 w-4 text-primary" />} label="Alunos avaliados" value={total} />
        <Kpi icon={<AlertTriangle className="h-4 w-4 text-warning" />} label="Em atenção" value={atRisk.length} accent="warning" />
        <Kpi label="% em atenção" value={`${riskPct}%`} accent={riskPct > 30 ? "destructive" : "primary"} />
        <Kpi label="Filtros ativos" value={activeFilters.length || "—"} />
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-border bg-gradient-card p-4">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Filtros (combinar indicadores)</div>
        <div className="flex flex-wrap gap-1.5">
          {INDICATORS.map((i) => {
            const on = !!filters[i.key];
            return (
              <button
                key={i.key}
                onClick={() => setFilters((p) => ({ ...p, [i.key]: !p[i.key] }))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40",
                )}
              >
                {i.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráfico por turma */}
      {byClass.length > 0 && (
        <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
          <h2 className="mb-3 font-display text-sm font-semibold">Distribuição de risco por turma</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={byClass} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Em atenção" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Busca + Lista */}
      <div className="space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Buscar aluno</Label>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" placeholder="Nome do aluno…" />
          </div>
        </div>

        {data.isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : !atRisk.length ? (
          <EmptyState title="Nenhum aluno em atenção" description="Com os filtros atuais, todos os alunos estão fora da zona Fraco/Muito Fraco." />
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="space-y-2 md:hidden">
              {atRisk.map((e) => {
                const c = e.classifications ?? {};
                const issues = INDICATORS.filter((i) => c[i.key as keyof Classifications] && RISK_ZONES.includes(c[i.key as keyof Classifications]!));
                return (
                  <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link to="/students/$id" params={{ id: e.student_id }} className="truncate font-medium text-foreground hover:text-primary">
                        {e.student?.full_name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{new Date(e.evaluated_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{e.student?.class?.name ?? "—"}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {issues.map((i) => {
                        const z = c[i.key as keyof Classifications];
                        return (
                          <span key={i.key} className={cn("rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(z))}>
                            {TEST_META[i.key as keyof typeof TEST_META]?.label?.split(" ")[0] ?? i.label} • {z}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tablet/Desktop: table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Aluno</th>
                    <th className="px-4 py-3 text-left font-medium">Turma</th>
                    <th className="px-4 py-3 text-left font-medium">Indicadores em atenção</th>
                    <th className="px-4 py-3 text-left font-medium">Última avaliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {atRisk.map((e) => {
                    const c = e.classifications ?? {};
                    const issues = INDICATORS.filter((i) => c[i.key as keyof Classifications] && RISK_ZONES.includes(c[i.key as keyof Classifications]!));
                    return (
                      <tr key={e.id}>
                        <td className="px-4 py-3">
                          <Link to="/students/$id" params={{ id: e.student_id }} className="font-medium text-foreground hover:text-primary">
                            {e.student?.full_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{e.student?.class?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {issues.map((i) => {
                              const z = c[i.key as keyof Classifications];
                              return (
                                <span key={i.key} className={cn("rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(z))}>
                                  {TEST_META[i.key as keyof typeof TEST_META]?.label?.split(" ")[0] ?? i.label} • {z}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(e.evaluated_at).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon?: React.ReactNode; label: string; value: React.ReactNode; accent?: "warning" | "destructive" | "primary" }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className={cn("mt-1 font-display text-2xl font-bold",
        accent === "warning" && "text-warning",
        accent === "destructive" && "text-destructive",
        accent === "primary" && "text-primary",
      )}>{value}</div>
    </div>
  );
}
