import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity, Building2, ClipboardList, GraduationCap, TrendingUp, Users, UsersRound, Zap, ArrowRight,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { cn } from "@/lib/utils";
import { ZONES, type Zone, type Classifications } from "@/lib/proesp";
import { dimensionScores, PM_DIMENSIONS } from "@/lib/prometric-method";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ProMetric" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      // Skip admin redirect when impersonating a client tenant
      const { data: profile } = await supabase
        .from("profiles")
        .select("impersonating_tenant_id")
        .eq("id", u.user.id)
        .maybeSingle();
      if (profile?.impersonating_tenant_id) return;

      const { data: roles } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .limit(1);
      if (roles && roles.length > 0) {
        throw redirect({ to: "/admin" });
      }
    }
  },
  component: Dashboard,
});

const ZONE_COLORS: Record<Zone, string> = {
  "Muito Fraco": "#ef4444",
  "Fraco": "#f97316",
  "Razoável": "#f59e0b",
  "Bom": "#6366f1",
  "Muito Bom": "#10b981",
  "Excelente": "#22c55e",
};

function Dashboard() {
  const { tenantId, tenant, isLoading: tLoading } = useCurrentTenant();

  const stats = useQuery({
    queryKey: ["dash-stats", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const [students, classes, schools, groups, evalsCount] = await Promise.all([
        supabase.from("students").select("id, sex", { count: "exact" }).eq("tenant_id", tenantId!).eq("is_active", true),
        supabase.from("classes").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
        supabase.from("schools").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
        supabase.from("groups").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
        supabase.from("evaluations").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
      ]);
      const male = (students.data ?? []).filter((s: any) => s.sex === "male").length;
      const female = (students.data ?? []).filter((s: any) => s.sex === "female").length;
      return {
        students: students.count ?? 0, classes: classes.count ?? 0,
        schools: schools.count ?? 0, groups: groups.count ?? 0,
        evaluations: evalsCount.count ?? 0, male, female,
      };
    },
  });

  const evals = useQuery({
    queryKey: ["dash-evals", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("id,evaluated_at,classifications,student:students(id,full_name)")
        .eq("tenant_id", tenantId!)
        .order("evaluated_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as unknown as { id: string; evaluated_at: string; classifications: Classifications; student: { id: string; full_name: string } }[];
    },
  });

  if (tLoading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  const cards: { label: string; value: number; icon: typeof Users; to: "/students" | "/evaluations" | "/classes" | "/schools" | "/groups" }[] = [
    { label: "Alunos ativos", value: stats.data?.students ?? 0, icon: Users, to: "/students" },
    { label: "Avaliações", value: stats.data?.evaluations ?? 0, icon: ClipboardList, to: "/evaluations" },
    { label: "Turmas", value: stats.data?.classes ?? 0, icon: GraduationCap, to: "/classes" },
    { label: "Escolas", value: stats.data?.schools ?? 0, icon: Building2, to: "/schools" },
    { label: "Grupos", value: stats.data?.groups ?? 0, icon: UsersRound, to: "/groups" },
  ];

  // Distribuição agregada por zona
  const zoneCounts: Record<Zone, number> = { "Muito Fraco": 0, "Fraco": 0, "Razoável": 0, "Bom": 0, "Muito Bom": 0, "Excelente": 0 };
  for (const e of evals.data ?? []) {
    for (const z of Object.values(e.classifications ?? {})) if (z) zoneCounts[z as Zone]++;
  }
  const zoneData = ZONES.map((z) => ({ zone: z, total: zoneCounts[z], color: ZONE_COLORS[z] }));

  // Avaliações por mês (últimos 6)
  const months: Record<string, number> = {};
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months[d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })] = 0;
  }
  for (const e of evals.data ?? []) {
    const d = new Date(e.evaluated_at);
    const k = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (k in months) months[k]++;
  }
  const timeline = Object.entries(months).map(([month, total]) => ({ month, total }));

  // Sexo
  const sexData = [
    { name: "Masculino", value: stats.data?.male ?? 0, color: "#6366f1" },
    { name: "Feminino", value: stats.data?.female ?? 0, color: "#ec4899" },
  ];

  // Alunos em atenção (qualquer teste em Muito Fraco/Fraco na última avaliação)
  const atRisk: { id: string; name: string; date: string }[] = [];
  const seen = new Set<string>();
  for (const e of evals.data ?? []) {
    const sid = e.student?.id;
    if (!sid || seen.has(sid)) continue;
    seen.add(sid);
    const has = Object.values(e.classifications ?? {}).some((z) => z === "Muito Fraco" || z === "Fraco");
    if (has) atRisk.push({ id: sid, name: e.student?.full_name ?? "—", date: new Date(e.evaluated_at).toLocaleDateString("pt-BR") });
    if (atRisk.length >= 6) break;
  }

  // Radar ProMetric® — média das 5 dimensões em todas as avaliações
  const dimAgg: Record<string, { sum: number; count: number }> = {};
  for (const d of PM_DIMENSIONS) dimAgg[d] = { sum: 0, count: 0 };
  for (const e of evals.data ?? []) {
    const ds = dimensionScores(e.classifications ?? {});
    for (const r of ds) {
      if (r.category !== null) {
        dimAgg[r.dimension].sum += r.score;
        dimAgg[r.dimension].count += 1;
      }
    }
  }
  const radarData = PM_DIMENSIONS.map((d) => ({
    dimension: d,
    score: dimAgg[d].count ? Math.round(dimAgg[d].sum / dimAgg[d].count) : 0,
  }));
  const radarHasData = radarData.some((r) => r.score > 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Olá 👋</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Bem-vindo ao <span className="text-gradient-brand">{tenant?.name ?? "ProMetric"}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Indicadores agregados do seu espaço.</p>
      </header>

      {/* Modo Quadra — destaque */}
      <Link
        to="/quick-eval"
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-hero p-5 shadow-glow transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
          <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1 text-white">
          <div className="font-display text-base font-bold">Modo Quadra</div>
          <div className="text-xs text-white/85">Avaliação rápida de alunos em campo. Otimizado para celular.</div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur sm:inline-flex">
          Iniciar Avaliação <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
        <ArrowRight className="h-5 w-5 text-white sm:hidden" />
      </Link>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to={c.to}
              className="relative block overflow-hidden rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="mb-2 inline-grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="font-display text-2xl font-bold">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h2 className="font-display text-sm font-semibold">Avaliações por mês (últimos 6)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={timeline} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
          <h2 className="mb-3 font-display text-sm font-semibold">Distribuição por sexo</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sexData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {sexData.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-3 font-display text-sm font-semibold">Distribuição agregada de classificações</h2>
          {(evals.data?.length ?? 0) === 0 ? (
            <div className="grid h-48 place-items-center text-xs text-muted-foreground">Sem avaliações</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={zoneData} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis type="category" dataKey="zone" width={90} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {zoneData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-warning" />
            <h2 className="font-display text-sm font-semibold">Alunos em atenção</h2>
          </div>
          {atRisk.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum aluno em perfil de atenção.</p>
          ) : (
            <ul className="space-y-1.5">
              {atRisk.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/students/$id"
                    params={{ id: r.id }}
                    className={cn("flex items-center justify-between rounded-lg border border-border bg-card p-2 text-xs transition-colors hover:border-primary hover:bg-primary/5")}
                  >
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="text-muted-foreground">{r.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
        <div className="mb-1 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">Radar ProMetric®</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Média do Índice ProMetric® (0–100) por dimensão entre todas as avaliações.
        </p>
        {!radarHasData ? (
          <div className="grid h-48 place-items-center text-xs text-muted-foreground">Sem avaliações</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(var(--border))" />
                <Radar name="Índice" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
