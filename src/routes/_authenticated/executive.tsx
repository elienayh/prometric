import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Activity, Building2, ClipboardList, GraduationCap, Info, TrendingUp, Trophy, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader } from "@/components/layout/page-header";
import { Label } from "@/components/ui/label";
import { ZONES, type Zone, type Classifications } from "@/lib/proesp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/executive")({
  head: () => ({ meta: [{ title: "Dashboard Executivo — ProMetric" }] }),
  component: ExecutivePage,
});

const ZONE_COLORS: Record<Zone, string> = {
  "Muito Fraco": "#ef4444", "Fraco": "#f97316", "Razoável": "#f59e0b",
  "Bom": "#6366f1", "Muito Bom": "#10b981", "Excelente": "#22c55e",
};

type EvalRow = {
  id: string; evaluated_at: string; student_id: string;
  classifications: Classifications;
  student: { sex: string; birth_date: string; class: { name: string | null; school_id: string | null } | null } | null;
};

function ExecutivePage() {
  const { tenantId } = useCurrentTenant();
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>("");

  const schools = useQuery({
    queryKey: ["exec-schools", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase.from("schools").select("id,name").eq("tenant_id", tenantId!).order("name");
      return data ?? [];
    },
  });
  const classes = useQuery({
    queryKey: ["exec-classes", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id,name,school_id").eq("tenant_id", tenantId!).order("name");
      return data ?? [];
    },
  });

  const evals = useQuery({
    queryKey: ["exec-evals", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("id,evaluated_at,student_id,classifications,student:students(sex,birth_date,class:classes(name,school_id))")
        .eq("tenant_id", tenantId!)
        .order("evaluated_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data as unknown as EvalRow[];
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const list = evals.data ?? [];
    return list.filter((e) => {
      if (schoolFilter && e.student?.class?.school_id !== schoolFilter) return false;
      if (classFilter && e.student?.class?.name !== classFilter) return false;
      return true;
    });
  }, [evals.data, schoolFilter, classFilter]);

  // Última avaliação por aluno
  const latestByStudent = useMemo(() => {
    const seen = new Set<string>(); const out: EvalRow[] = [];
    for (const e of filtered) { if (seen.has(e.student_id)) continue; seen.add(e.student_id); out.push(e); }
    return out;
  }, [filtered]);

  const zoneCounts: Record<Zone, number> = { "Muito Fraco": 0, "Fraco": 0, "Razoável": 0, "Bom": 0, "Muito Bom": 0, "Excelente": 0 };
  for (const e of latestByStudent) for (const z of Object.values(e.classifications ?? {})) if (z) zoneCounts[z as Zone]++;
  const total = Object.values(zoneCounts).reduce((a, b) => a + b, 0);
  const healthy = zoneCounts["Bom"] + zoneCounts["Muito Bom"] + zoneCounts["Excelente"];
  const atRisk = zoneCounts["Muito Fraco"] + zoneCounts["Fraco"];

  // Evolução por ano
  const yearly = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filtered) {
      const y = new Date(e.evaluated_at).getFullYear().toString();
      map[y] = (map[y] ?? 0) + 1;
    }
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([year, total]) => ({ year, total }));
  }, [filtered]);

  // Distribuição por idade
  const byAge = useMemo(() => {
    const map: Record<number, number> = {};
    for (const e of latestByStudent) {
      if (!e.student?.birth_date) continue;
      const age = Math.floor((Date.now() - new Date(e.student.birth_date).getTime()) / (365.25 * 86400_000));
      map[age] = (map[age] ?? 0) + 1;
    }
    return Object.entries(map).sort(([a],[b]) => +a - +b).map(([age, total]) => ({ age: `${age}a`, total }));
  }, [latestByStudent]);

  // Ranking de turmas (por % saudável)
  const ranking = useMemo(() => {
    const map: Record<string, { healthy: number; total: number }> = {};
    for (const e of latestByStudent) {
      const c = e.student?.class?.name ?? "Sem turma";
      map[c] ??= { healthy: 0, total: 0 };
      const vals = Object.values(e.classifications ?? {}).filter(Boolean) as Zone[];
      if (!vals.length) continue;
      map[c].total++;
      const h = vals.filter((z) => z === "Bom" || z === "Muito Bom" || z === "Excelente").length / vals.length;
      if (h >= 0.6) map[c].healthy++;
    }
    return Object.entries(map)
      .map(([name, v]) => ({ name, pct: v.total ? Math.round((v.healthy / v.total) * 100) : 0, total: v.total }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8);
  }, [latestByStudent]);

  const zoneData = ZONES.map((z) => ({ zone: z, total: zoneCounts[z], color: ZONE_COLORS[z] }));
  const sexAgg = { male: 0, female: 0 };
  for (const e of latestByStudent) { if (e.student?.sex === "male") sexAgg.male++; else if (e.student?.sex === "female") sexAgg.female++; }

  const filteredClasses = (classes.data ?? []).filter((c) => !schoolFilter || c.school_id === schoolFilter);

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard Executivo" description="Visão estratégica consolidada por escola, turma e período." />

      {/* Filtros */}
      <div className="grid gap-3 rounded-2xl border border-border bg-gradient-card p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Escola</Label>
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={schoolFilter} onChange={(e) => { setSchoolFilter(e.target.value); setClassFilter(""); }}>
            <option value="">Todas as escolas</option>
            {(schools.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Turma</Label>
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">Todas as turmas</option>
            {filteredClasses.map((c) => <option key={c.id} value={c.name ?? ""}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icon={<Users className="h-4 w-4 text-primary" />} label="Alunos avaliados" value={latestByStudent.length} helpHash="metodo" />
        <Kpi icon={<ClipboardList className="h-4 w-4 text-primary" />} label="Avaliações" value={filtered.length} helpHash="metodo" />
        <Kpi icon={<Activity className="h-4 w-4 text-success" />} label="% perfil saudável" value={total ? `${Math.round((healthy / total) * 100)}%` : "—"} accent="success" helpHash="interpretacao" />
        <Kpi icon={<TrendingUp className="h-4 w-4 text-destructive" />} label="% em atenção" value={total ? `${Math.round((atRisk / total) * 100)}%` : "—"} accent="destructive" helpHash="interpretacao" />
        <Kpi icon={<Building2 className="h-4 w-4 text-primary" />} label="Escolas ativas" value={schools.data?.length ?? 0} helpHash="metodo" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Evolução anual de avaliações" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribuição por sexo">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ name: "Masc.", value: sexAgg.male, c: "#6366f1" }, { name: "Fem.", value: sexAgg.female, c: "#ec4899" }]}
                  dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  <Cell fill="#6366f1" /><Cell fill="#ec4899" />
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Distribuição por idade" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byAge}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="age" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Classificações agregadas">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={zoneData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="zone" width={80} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>{zoneData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Ranking de turmas — % alunos em perfil saudável" icon={<Trophy className="h-4 w-4 text-warning" />}>
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados para o filtro atual.</p>
        ) : (
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="font-mono">{r.pct}% • {r.total} alunos</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, accent, helpHash }: { icon?: React.ReactNode; label: string; value: React.ReactNode; accent?: "success" | "destructive"; helpHash?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <div className="flex items-center gap-1.5">{icon} {label}</div>
        {helpHash && (
          <Link to="/knowledge" hash={helpHash} className="text-muted-foreground/70 hover:text-primary" title="Saiba mais na Central de Conhecimento">
            <Info className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className={cn("mt-1 font-display text-2xl font-bold", accent === "success" && "text-success", accent === "destructive" && "text-destructive")}>{value}</div>
    </div>
  );
}

function Card({ title, icon, className, children }: { title: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-gradient-card p-5 shadow-soft", className)}>
      <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">{icon}{title}</h2>
      {children}
    </div>
  );
}
