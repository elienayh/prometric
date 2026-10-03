import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader } from "@/components/layout/page-header";
import { BrandingTab } from "@/components/settings/branding-tab";
import { AiTab } from "@/components/settings/ai-tab";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/stripe.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — ProMetric" }] }),
  component: SettingsPage,
});

type Plan = {
  id: string;
  slug: string;
  name: string;
  max_students: number | null;
  max_users: number;
  price_monthly: number;
  amount_yearly_cents?: number;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
  features: string[];
  sort_order: number;
};

function SettingsPage() {
  const { tenant, tenantId } = useCurrentTenant();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "success") {
        toast.success("Assinatura processada com sucesso! Seu plano Pro está ativo.");
      } else if (params.get("checkout") === "canceled") {
        toast.info("Processo de assinatura cancelado. Nenhuma cobrança foi realizada.");
      }
    }
  }, []);

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  const usage = useQuery({
    queryKey: ["usage", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const [students, members] = await Promise.all([
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId!)
          .eq("is_active", true),
        supabase
          .from("tenant_members")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId!),
      ]);
      return { students: students.count ?? 0, members: members.count ?? 0 };
    },
  });

  const currentPlan = plans.data?.find((p) => p.id === tenant?.plan_id);

  const handleCheckout = async (planSlug: string) => {
    if (!tenantId) {
      toast.error("Nenhuma organização selecionada.");
      return;
    }
    setIsCheckingOut(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await createCheckoutSession({
        data: {
          tenantId,
          planSlug,
          interval: billingInterval,
          origin,
        },
      });

      if (res?.url) {
        window.location.href = res.url;
      } else {
        toast.error("Não foi possível gerar a página de checkout.");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      toast.error(err.message || "Erro ao iniciar pagamento. Verifique as configurações da Stripe.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Garante a ordenação dos dois planos principais: Gratuito e Pro
  const activePlans = (plans.data || [])
    .filter((p) => p.slug === "free" || p.slug === "professor" || p.slug === "pro")
    .sort((a, b) => (a.slug === "free" ? -1 : 1));

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
                {usage.data?.students ?? 0}
                <span className="text-sm text-muted-foreground">
                  {" "}
                  / {currentPlan.max_students ? currentPlan.max_students.toLocaleString("pt-BR") : "Ilimitado"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-brand transition-all"
              style={{
                width: currentPlan.max_students
                  ? `${Math.min(100, ((usage.data?.students ?? 0) / currentPlan.max_students) * 100)}%`
                  : "100%",
              }}
            />
          </div>
        </div>
      )}

      <BrandingTab tenant={tenant as any} />

      <AiTab tenantId={tenantId} />

      {/* Planos & Assinatura */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold">Planos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escolha a opção ideal para gerenciar suas avaliações físicas e relatórios.
            </p>
          </div>

          {/* Toggle Mensal / Anual */}
          <div className="inline-flex items-center rounded-xl border border-border bg-muted/60 p-1 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingInterval("monthly")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 font-medium transition cursor-pointer",
                billingInterval === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("yearly")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition cursor-pointer",
                billingInterval === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Anual</span>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Economize 2 meses
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          {/* Plano Gratuito */}
          {(() => {
            const freePlan = activePlans.find((p) => p.slug === "free") || {
              id: "free",
              slug: "free",
              name: "Gratuito",
              max_students: 30,
              max_users: 1,
              price_monthly: 0,
              features: ["Até 30 alunos", "1 usuário", "Relatórios básicos"],
            };
            const isCurrent = tenant?.plan_id === freePlan.id || (!tenant?.plan_id && freePlan.slug === "free");

            return (
              <div
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl border p-6 transition shadow-soft",
                  isCurrent
                    ? "border-primary/50 bg-gradient-card shadow-glow"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-3 right-6 rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                    Atual
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Gratuito — até 30 alunos / usuários
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold">{freePlan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-extrabold tracking-tight">R$ 0</span>
                    <span className="text-xs text-muted-foreground font-normal">/ sempre gratuito</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Perfeito para professores individuais ou início de avaliações em turmas pequenas.
                  </p>

                  <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Até 30 alunos ativos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>1 usuário administrador</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Relatórios básicos e ficha do aluno</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button variant="outline" disabled className="w-full text-xs">
                    {isCurrent ? "Seu plano atual" : "Plano gratuito padrão"}
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* Plano Pro */}
          {(() => {
            const proPlan = activePlans.find((p) => p.slug === "professor" || p.slug === "pro") || {
              id: "pro",
              slug: "professor",
              name: "Pro",
              max_students: null,
              max_users: 10,
              price_monthly: 189.9,
              amount_yearly_cents: 179990,
              features: [
                "Alunos ilimitados",
                "10 usuários",
                "Relatórios PDF",
                "Parecer com IA",
                "Cobrança mensal ou anual",
              ],
            };
            const isCurrent = tenant?.plan_id === proPlan.id;

            return (
              <div
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl border-2 p-6 transition shadow-soft",
                  isCurrent
                    ? "border-primary bg-gradient-card shadow-glow"
                    : "border-primary/70 bg-gradient-card hover:border-primary shadow-glow"
                )}
              >
                <div className="absolute -top-3 right-6 rounded-full bg-gradient-brand px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                  {isCurrent ? "Atual" : "Recomendado"}
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 text-accent" /> Pro — a partir de 30 alunos (ilimitado)
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold">{proPlan.name}</h3>

                  <div className="mt-4">
                    {billingInterval === "monthly" ? (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl font-extrabold tracking-tight">R$ 189,90</span>
                          <span className="text-xs text-muted-foreground font-normal">/mês</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Cobrança mensal com cancelamento flexível a qualquer momento.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl font-extrabold tracking-tight">R$ 1.799,90</span>
                          <span className="text-xs text-muted-foreground font-normal">/ano</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          Equivale a ~R$ 149,99/mês (economize 2 meses no plano anual).
                        </p>
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Alunos ilimitados (sem trava de limite)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Até 10 usuários / avaliadores na equipe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Relatórios PDF completos para impressão e envio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Parecer pedagógico completo com IA integrado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Faturamento flexível (mensal ou anual com desconto)</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full text-xs">
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      Seu plano atual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout("pro")}
                      disabled={isCheckingOut}
                      className="w-full bg-gradient-brand text-xs font-semibold shadow-glow cursor-pointer"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Iniciando checkout Stripe...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          {billingInterval === "monthly" ? "Assinar Pro (R$ 189,90/mês)" : "Assinar Pro (R$ 1.799,90/ano)"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground">
          Pagamentos processados de forma 100% segura através do Stripe. Seus dados cadastrais e fiscais permanecem protegidos.
        </p>
      </div>
    </div>
  );
}
