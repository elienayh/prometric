import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity, Database, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/admin/monitoring")({ component: MonitoringPage });

function MonitoringPage() {
  const { data } = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [students, evalsTotal, evals7d, users, tenants] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("evaluations").select("id", { count: "exact", head: true }),
        supabase.from("evaluations").select("id, created_at").gte("created_at", since),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tenants").select("created_at"),
      ]);
      const evalsByDay: Record<string, number> = {};
      (evals7d.data ?? []).forEach((e) => {
        const d = new Date(e.created_at).toLocaleDateString("pt-BR");
        evalsByDay[d] = (evalsByDay[d] ?? 0) + 1;
      });
      const tenantsByMonth: Record<string, number> = {};
      (tenants.data ?? []).forEach((t) => {
        const d = new Date(t.created_at);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        tenantsByMonth[k] = (tenantsByMonth[k] ?? 0) + 1;
      });
      return {
        students: students.count ?? 0,
        evaluations: evalsTotal.count ?? 0,
        users: users.count ?? 0,
        evals7d: (evals7d.data ?? []).length,
        evalsByDay,
        tenantsByMonth,
      };
    },
  });

  const cards = [
    { label: "Total de usuários", value: data?.users ?? 0, icon: Users },
    { label: "Total de alunos", value: data?.students ?? 0, icon: Users },
    { label: "Avaliações totais", value: data?.evaluations ?? 0, icon: Activity },
    { label: "Avaliações (7 dias)", value: data?.evals7d ?? 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold lg:text-3xl">Monitoramento</h1>
        <p className="text-sm text-muted-foreground">Saúde operacional e crescimento</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <c.icon className="h-4 w-4 text-primary" />
            <div className="mt-2 text-2xl font-bold">{c.value.toLocaleString("pt-BR")}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Database className="h-3.5 w-3.5" /> Avaliações por dia (7d)
          </h2>
          <div className="space-y-1.5">
            {Object.entries(data?.evalsByDay ?? {}).map(([d, n]) => (
              <div key={d} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-muted-foreground">{d}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-primary/20"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, n * 8)}%` }} /></div>
                </div>
                <span className="w-8 text-right font-semibold">{n}</span>
              </div>
            ))}
            {Object.keys(data?.evalsByDay ?? {}).length === 0 && <div className="text-sm text-muted-foreground">Sem dados.</div>}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Novos clientes por mês
          </h2>
          <div className="space-y-1.5">
            {Object.entries(data?.tenantsByMonth ?? {}).slice(-6).map(([m, n]) => (
              <div key={m} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-muted-foreground">{m}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-success/20"><div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, n * 12)}%` }} /></div>
                </div>
                <span className="w-8 text-right font-semibold">{n}</span>
              </div>
            ))}
            {Object.keys(data?.tenantsByMonth ?? {}).length === 0 && <div className="text-sm text-muted-foreground">Sem dados.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
