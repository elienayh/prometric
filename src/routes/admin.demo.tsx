import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FlaskConical, LogIn, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIsPlatformAdmin } from "@/hooks/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/demo")({ component: DemoEnvironmentPage });

type DemoStats = {
  tenantId: string | null;
  tenantName: string | null;
  schools: number;
  classes: number;
  groups: number;
  students: number;
  evaluations: number;
  team: number;
  createdAt: string | null;
};

function DemoEnvironmentPage() {
  const { isSuperAdmin, isLoading } = useIsPlatformAdmin();
  const qc = useQueryClient();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statsQ = useQuery<DemoStats>({
    queryKey: ["admin-demo-stats"],
    enabled: !isLoading && isSuperAdmin,
    queryFn: async () => {
      const t = await supabase
        .from("tenants")
        .select("id, name, created_at")
        .eq("demo_data", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (t.error) throw t.error;
      if (!t.data) {
        return {
          tenantId: null, tenantName: null,
          schools: 0, classes: 0, groups: 0, students: 0, evaluations: 0, team: 0,
          createdAt: null,
        };
      }
      const tid = t.data.id;
      const count = (q: ReturnType<typeof supabase.from>) =>
        q.select("id", { count: "exact", head: true }).eq("tenant_id", tid);
      const [sc, cl, gr, st, ev, tc] = await Promise.all([
        count(supabase.from("schools")),
        count(supabase.from("classes")),
        count(supabase.from("groups")),
        count(supabase.from("students")),
        count(supabase.from("evaluations")),
        count(supabase.from("team_contacts")),
      ]);
      return {
        tenantId: tid,
        tenantName: t.data.name,
        schools: sc.count ?? 0,
        classes: cl.count ?? 0,
        groups: gr.count ?? 0,
        students: st.count ?? 0,
        evaluations: ev.count ?? 0,
        team: tc.count ?? 0,
        createdAt: t.data.created_at,
      };
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_demo_environment");
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast.success("Ambiente demonstrativo criado");
      qc.invalidateQueries({ queryKey: ["admin-demo-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restore = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("restore_demo_environment");
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast.success("Ambiente demonstrativo recriado");
      qc.invalidateQueries({ queryKey: ["admin-demo-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_demo_environment");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ambiente demonstrativo removido");
      setConfirmDelete(false);
      qc.invalidateQueries({ queryKey: ["admin-demo-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enter = useMutation({
    mutationFn: async (tenantId: string) => {
      const { error } = await supabase.rpc("impersonate_tenant", { _tenant: tenantId });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.cancelQueries();
      qc.clear();
      router.navigate({ to: "/dashboard", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isLoading && !isSuperAdmin) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Apenas Super Admins podem gerenciar o ambiente demonstrativo.
      </Card>
    );
  }

  const stats = statsQ.data;
  const exists = !!stats?.tenantId;
  const busy = create.isPending || restore.isPending || remove.isPending || enter.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero shadow-glow">
          <FlaskConical className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold">Ambiente de Demonstração</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gere um tenant completo com escolas, turmas, grupos, alunos e avaliações para apresentações comerciais,
            treinamentos e produção de material — sem misturar com dados reais de clientes.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Status atual</h2>
        </div>

        {statsQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !exists ? (
          <p className="text-sm text-muted-foreground">Nenhum ambiente demonstrativo ativo.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Tenant" value={stats!.tenantName ?? "—"} />
            <Stat label="Escolas" value={stats!.schools} />
            <Stat label="Turmas" value={stats!.classes} />
            <Stat label="Grupos" value={stats!.groups} />
            <Stat label="Alunos" value={stats!.students} />
            <Stat label="Avaliações" value={stats!.evaluations} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {!exists && (
            <Button onClick={() => create.mutate()} disabled={busy} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {create.isPending ? "Gerando…" : "Criar ambiente demonstrativo"}
            </Button>
          )}
          {exists && (
            <>
              <Button
                onClick={() => enter.mutate(stats!.tenantId!)}
                disabled={busy}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Entrar no ambiente demonstrativo
              </Button>
              <Button variant="outline" onClick={() => restore.mutate()} disabled={busy} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${restore.isPending ? "animate-spin" : ""}`} />
                {restore.isPending ? "Recriando…" : "Restaurar / Recriar"}
              </Button>
              {!confirmDelete ? (
                <Button variant="outline" onClick={() => setConfirmDelete(true)} disabled={busy} className="gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" /> Excluir
                </Button>
              ) : (
                <>
                  <Button variant="destructive" onClick={() => remove.mutate()} disabled={busy} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {remove.isPending ? "Removendo…" : "Confirmar exclusão"}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>
                    Cancelar
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </Card>

      <Card className="p-6 text-sm text-muted-foreground">
        <h3 className="mb-2 font-semibold text-foreground">O que é gerado</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>Tenant <strong>Colégio Modelo ProMetric</strong> (plano Rede)</li>
          <li>3 escolas, 9 turmas e 10 grupos esportivos</li>
          <li>4 contatos de equipe (professores fictícios)</li>
          <li>200 alunos com nomes brasileiros realistas, distribuídos nas turmas</li>
          <li>3 avaliações por aluno com evolução coerente (peso, altura, IMC, flexibilidade, abdominal, salto, medicine ball, corrida 6 min, sprint 20 m, agilidade)</li>
          <li>Diagnóstico de IA variado em cada avaliação</li>
          <li>Todos os registros marcados com <code>demo_data = true</code> — isolados dos dados reais</li>
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-lg font-bold">{value}</div>
    </div>
  );
}
