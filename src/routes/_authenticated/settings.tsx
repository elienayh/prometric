import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader } from "@/components/layout/page-header";
import { BrandingTab } from "@/components/settings/branding-tab";
import { AiTab } from "@/components/settings/ai-tab";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — ProMetric" }] }),
  component: SettingsPage,
});

type Plan = { id: string; slug: string; name: string; max_students: number; max_users: number; price_monthly: number; features: string[]; sort_order: number };

function SettingsPage() {
  const { tenant, tenantId } = useCurrentTenant();
  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  const usage = useQuery({
    queryKey: ["usage", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const [students, members] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!).eq("is_active", true),
        supabase.from("tenant_members").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId!),
      ]);
      return { students: students.count ?? 0, members: members.count ?? 0 };
    },
  });

  const currentPlan = plans.data?.find((p) => p.id === tenant?.plan_id);

  return (
    <div className="space-y-8">
      <PageHeader title="Configurações" description="Plano, uso e ajustes do seu espaço." />

      {currentPlan && (
        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Crown className="h-3.5 w-3.5 text-accent" /> Plano atual
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold">{currentPlan.name}</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Alunos utilizados</div>
              <div className="font-display text-2xl font-bold">
                {usage.data?.students ?? 0}<span className="text-sm text-muted-foreground"> / {currentPlan.max_students}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-brand transition-all"
              style={{ width: `${Math.min(100, ((usage.data?.students ?? 0) / currentPlan.max_students) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <BrandingTab tenant={tenant as any} />

      <AiTab tenantId={tenantId} />





      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Planos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.data?.map((p) => {
            const isCurrent = p.id === tenant?.plan_id;
            return (
              <div
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5 shadow-soft transition",
                  isCurrent ? "border-primary bg-gradient-card shadow-glow" : "border-border bg-card hover:border-primary/40",
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-2 right-4 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">Atual</div>
                )}
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <div className="mt-2 font-display text-3xl font-bold">
                  {p.price_monthly > 0 ? `R$ ${p.price_monthly.toFixed(2).replace(".", ",")}` : "Grátis"}
                  {p.price_monthly > 0 && <span className="text-xs font-normal text-muted-foreground">/mês</span>}
                </div>
                <ul className="mt-4 flex-1 space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> Até {p.max_students.toLocaleString("pt-BR")} alunos</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> {p.max_users} usuário(s)</li>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> {f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Pagamentos integrados estarão disponíveis em breve.</p>
      </div>
    </div>
  );
}
