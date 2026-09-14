import { useQuery } from "@tanstack/react-query";
import { Building2, ClipboardList, DollarSign, GraduationCap, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-saas-overview"],
    queryFn: async () => {
      const [tenants, students, evaluations, users, subs, payments] = await Promise.all([
        supabase.from("tenants").select("id, created_at", { count: "exact" }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("evaluations").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("status, amount_cents, billing_cycle"),
        supabase.from("payments").select("amount_cents, paid_at, status").eq("status", "paid"),
      ]);
      const subsArr = subs.data ?? [];
      const active = subsArr.filter((s) => s.status === "active").length;
      const trial = subsArr.filter((s) => s.status === "trial").length;
      const suspended = subsArr.filter((s) => s.status === "suspended").length;
      const paying = subsArr.filter((s) => s.status === "active" && (s.amount_cents ?? 0) > 0).length;
      const free = subsArr.filter((s) => s.status === "active" && (s.amount_cents ?? 0) === 0).length;
      const overdue = subsArr.filter((s) => s.status === "past_due" || s.status === "suspended").length;
      const canceled = subsArr.filter((s) => s.status === "canceled").length;
      const mrr = subsArr
        .filter((s) => s.status === "active")
        .reduce((acc, s) => acc + (s.billing_cycle === "yearly" ? s.amount_cents / 12 : s.amount_cents), 0);
      const arr = mrr * 12;
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthRevenue = (payments.data ?? [])
        .filter((p) => p.paid_at && new Date(p.paid_at) >= startMonth)
        .reduce((a, p) => a + p.amount_cents, 0);
      return {
        totalTenants: tenants.count ?? 0,
        active, trial, suspended, paying, free, overdue, canceled,
        students: students.count ?? 0,
        evaluations: evaluations.count ?? 0,
        users: users.count ?? 0,
        mrr, arr, monthRevenue,
      };
    },
  });

  const stats = [
    { label: "Pagantes", value: data?.paying ?? 0, icon: DollarSign, accent: "text-success" },
    { label: "Trial", value: data?.trial ?? 0, icon: TrendingUp, accent: "text-warning" },
    { label: "Gratuitos", value: data?.free ?? 0, icon: Users, accent: "text-muted-foreground" },
    { label: "Inadimplentes", value: data?.overdue ?? 0, icon: Building2, accent: "text-destructive" },
    { label: "Cancelados", value: data?.canceled ?? 0, icon: Building2, accent: "text-muted-foreground" },
    { label: "Usuários", value: data?.users ?? 0, icon: Users, accent: "text-primary" },
    { label: "Alunos cadastrados", value: data?.students ?? 0, icon: GraduationCap, accent: "text-primary" },
    { label: "Avaliações", value: data?.evaluations ?? 0, icon: ClipboardList, accent: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Dashboard SaaS</h1>
        <p className="text-sm text-muted-foreground">Visão consolidada da plataforma ProMetric</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className={s.accent} />
            <div className="mt-3 text-2xl font-bold">{isLoading ? "—" : s.value.toLocaleString("pt-BR")}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> MRR
          </div>
          <div className="mt-2 text-3xl font-bold text-success">{fmtCurrency(data?.mrr ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Receita mensal recorrente</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> ARR
          </div>
          <div className="mt-2 text-3xl font-bold">{fmtCurrency(data?.arr ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Receita anual recorrente</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> Receita do mês
          </div>
          <div className="mt-2 text-3xl font-bold text-primary">{fmtCurrency(data?.monthRevenue ?? 0)}</div>
          <div className="text-xs text-muted-foreground">
            Pagamentos liquidados em {new Date().toLocaleDateString("pt-BR", { month: "long" })}
          </div>
        </Card>
      </div>
    </div>
  );
}