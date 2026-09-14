import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { logAudit, useIsPlatformAdmin } from "@/hooks/use-admin";

import { Building2, Search, Eye, LogIn, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clients/")({ component: ClientsPage });

type SubStatus = "trial" | "active" | "canceled" | "suspended" | "past_due";

type TenantRow = {
  id: string;
  name: string;
  type: string;
  owner_id: string | null;
  is_active: boolean;
  status: string | null;
  last_login_at: string | null;
  created_at: string;
  plan: { name: string } | null;
  subscriptions: { status: SubStatus; amount_cents: number | null }[];
};

const accountStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativa", variant: "default" },
  trial: { label: "Ativa", variant: "default" },
  suspended: { label: "Suspensa", variant: "secondary" },
  blocked: { label: "Bloqueada", variant: "destructive" },
  canceled: { label: "Cancelada", variant: "outline" },
};

function financialStatus(sub: TenantRow["subscriptions"][number] | undefined): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (!sub) return { label: "Gratuito", variant: "outline" };
  switch (sub.status) {
    case "active":
      return (sub.amount_cents ?? 0) > 0 ? { label: "Pago", variant: "default" } : { label: "Gratuito", variant: "outline" };
    case "trial":
      return { label: "Trial", variant: "secondary" };
    case "past_due":
    case "suspended":
      return { label: "Atrasado", variant: "destructive" };
    case "canceled":
      return { label: "Cancelado", variant: "outline" };
    default:
      return { label: "—", variant: "outline" };
  }
}

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}

function fmtDateTime(d: string | null) {
  return d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Nunca";
}

function ClientsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const perms = useIsPlatformAdmin();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tenants-list"],
    queryFn: async () => {
      const [tRes, sRes] = await Promise.all([
        supabase
          .from("tenants")
          .select("id, name, type, owner_id, is_active, status, last_login_at, created_at, plan:plans(name), subscriptions(status, amount_cents)")
          .order("created_at", { ascending: false }),
        supabase.from("students").select("tenant_id"),
      ]);
      if (tRes.error) throw tRes.error;
      if (sRes.error) throw sRes.error;
      const counts = new Map<string, number>();
      for (const s of sRes.data ?? []) counts.set(s.tenant_id, (counts.get(s.tenant_id) ?? 0) + 1);
      const tenants = (tRes.data ?? []) as unknown as TenantRow[];
      return tenants.map((t) => ({ ...t, _students: counts.get(t.id) ?? 0 }));
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("tenants").update({ is_active: active, status: active ? "active" : "suspended" }).eq("id", id);
      if (error) throw error;
      await logAudit(active ? "tenant.reactivated" : "tenant.suspended", { entity_type: "tenant", entity_id: id, tenant_id: id });
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["admin-tenants-list"] });
      toast.success(v.active ? "Cliente reativado" : "Cliente suspenso");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
      await logAudit("tenant.deleted", { entity_type: "tenant", entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tenants-list"] });
      toast.success("Cliente excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const impersonate = useMutation({
    mutationFn: async (t: TenantRow) => {
      const { error } = await supabase.rpc("impersonate_tenant", { _tenant: t.id });
      if (error) throw error;
      return t;
    },
    onSuccess: async (t) => {
      await qc.cancelQueries();
      qc.clear();
      toast.success(`Acessando como ${t.name}`);
      router.navigate({ to: "/dashboard", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (data ?? []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const goTo = (id: string) => router.navigate({ to: "/admin/clients/$id", params: { id } });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gestão comercial dos tenants da plataforma</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-9" />
        </div>
      </header>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {isLoading && <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">Carregando...</div>}
        {!isLoading && filtered.length === 0 && <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</div>}
        {filtered.map((t) => {
          const acc = accountStatusMap[(t.status ?? (t.is_active ? "active" : "suspended"))] ?? accountStatusMap.active;
          const fin = financialStatus(t.subscriptions?.[0]);
          return (
            <Card
              key={t.id}
              tabIndex={0}
              role="link"
              onClick={() => goTo(t.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(t.id); } }}
              className="cursor-pointer p-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-semibold text-foreground">{t.name}</span>
                </div>
                <Badge variant={acc.variant} className="shrink-0">{acc.label}</Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Tipo</dt><dd className="mt-0.5 font-medium">{t.type}</dd></div>
                <div><dt className="text-muted-foreground">Plano</dt><dd className="mt-0.5 font-medium">{t.plan?.name ?? "—"}</dd></div>
                <div><dt className="text-muted-foreground">Financeiro</dt><dd className="mt-0.5"><Badge variant={fin.variant}>{fin.label}</Badge></dd></div>
                <div><dt className="text-muted-foreground">Alunos</dt><dd className="mt-0.5 font-medium">{(t as any)._students}</dd></div>
                <div><dt className="text-muted-foreground">Último acesso</dt><dd className="mt-0.5 font-medium">{fmtDateTime(t.last_login_at)}</dd></div>
                <div><dt className="text-muted-foreground">Criado em</dt><dd className="mt-0.5 font-medium">{fmtDate(t.created_at)}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-border/40 pt-3" onClick={(e) => e.stopPropagation()}>
                <Link to="/admin/clients/$id" params={{ id: t.id }}>
                  <Button variant="ghost" size="icon" aria-label="Detalhes" className="min-h-11 min-w-11"><Eye className="h-4 w-4" /></Button>
                </Link>
                {perms.isSuperAdmin && (
                  <Button variant="ghost" size="icon" aria-label="Acessar como" className="min-h-11 min-w-11"
                    onClick={() => { if (confirm(`Entrar como "${t.name}"?`)) impersonate.mutate(t); }}>
                    <LogIn className="h-4 w-4 text-primary" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11"
                  onClick={() => toggleActive.mutate({ id: t.id, active: !t.is_active })}>
                  {t.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11"
                  onClick={() => { if (confirm(`Excluir "${t.name}"?`)) remove.mutate(t.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Plano</th>
                <th className="px-4 py-3 text-left">Conta</th>
                <th className="px-4 py-3 text-left">Financeiro</th>
                <th className="px-4 py-3 text-right">Alunos</th>
                <th className="px-4 py-3 text-left">Último acesso</th>
                <th className="px-4 py-3 text-left">Criado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (<tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>)}
              {!isLoading && filtered.length === 0 && (<tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>)}
              {filtered.map((t) => {
                const acc = accountStatusMap[(t.status ?? (t.is_active ? "active" : "suspended"))] ?? accountStatusMap.active;
                const fin = financialStatus(t.subscriptions?.[0]);
                return (
                  <tr
                    key={t.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => goTo(t.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(t.id); } }}
                    className="cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="underline-offset-4 hover:underline">{t.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.type}</td>
                    <td className="px-4 py-3">{t.plan?.name ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant={acc.variant}>{acc.label}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={fin.variant}>{fin.label}</Badge></td>
                    <td className="px-4 py-3 text-right tabular-nums">{(t as any)._students}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDateTime(t.last_login_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(t.created_at)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Link to="/admin/clients/$id" params={{ id: t.id }}>
                          <Button variant="ghost" size="icon" aria-label="Detalhes"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        {perms.isSuperAdmin && (
                          <Button variant="ghost" size="icon" aria-label="Acessar como"
                            onClick={() => { if (confirm(`Entrar como "${t.name}"?`)) impersonate.mutate(t); }}>
                            <LogIn className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon"
                          onClick={() => toggleActive.mutate({ id: t.id, active: !t.is_active })}>
                          {t.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon"
                          onClick={() => { if (confirm(`Excluir "${t.name}"?`)) remove.mutate(t.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
