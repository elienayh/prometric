import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit, useIsPlatformAdmin } from "@/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Building2, Users, GraduationCap, ClipboardList, School as SchoolIcon,
  LogIn, Pause, Play, Ban, Trash2, Save, Activity, Shield, FileText, HardDrive,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clients/$id")({ component: ClientDetailPage });

type Status = "active" | "trial" | "suspended" | "blocked" | "canceled";
const STATUS_LABEL: Record<Status, string> = {
  active: "Ativo", trial: "Trial", suspended: "Suspenso", blocked: "Bloqueado", canceled: "Cancelado",
};
const STATUS_VARIANT: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default", trial: "secondary", suspended: "destructive", blocked: "destructive", canceled: "outline",
};

const fmtCurrency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR") : "—");

function ClientDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const perms = useIsPlatformAdmin();

  const tenantQ = useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*, plan:plans(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const countsQ = useQuery({
    queryKey: ["admin-tenant-counts", id],
    queryFn: async () => {
      const [students, evals, classes, groups, schools, members] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", id),
        supabase.from("evaluations").select("id", { count: "exact", head: true }).eq("tenant_id", id),
        supabase.from("classes").select("id", { count: "exact", head: true }).eq("tenant_id", id),
        supabase.from("groups").select("id", { count: "exact", head: true }).eq("tenant_id", id),
        supabase.from("schools").select("id", { count: "exact", head: true }).eq("tenant_id", id),
        supabase.from("tenant_members").select("id", { count: "exact", head: true }).eq("tenant_id", id),
      ]);
      return {
        students: students.count ?? 0,
        evaluations: evals.count ?? 0,
        classes: classes.count ?? 0,
        groups: groups.count ?? 0,
        schools: schools.count ?? 0,
        members: members.count ?? 0,
      };
    },
  });

  const subQ = useQuery({
    queryKey: ["admin-tenant-sub", id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("*, plan:plans(*)").eq("tenant_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const paymentsQ = useQuery({
    queryKey: ["admin-tenant-payments", id],
    queryFn: async () => (await supabase.from("payments").select("*").eq("tenant_id", id).order("paid_at", { ascending: false }).limit(50)).data ?? [],
  });

  const auditQ = useQuery({
    queryKey: ["admin-tenant-audit", id],
    queryFn: async () => (await supabase.from("audit_logs").select("*").eq("tenant_id", id).order("created_at", { ascending: false }).limit(100)).data ?? [],
  });

  const ownerQ = useQuery({
    queryKey: ["admin-tenant-owner", id],
    enabled: !!tenantQ.data?.owner_id,
    queryFn: async () => {
      const ownerId = tenantQ.data!.owner_id as string;
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, created_at, updated_at")
        .eq("id", ownerId)
        .maybeSingle();
      return data;
    },
  });

  const ticketsQ = useQuery({
    queryKey: ["admin-tenant-tickets", id],
    queryFn: async () => (await supabase.from("support_tickets").select("*").eq("tenant_id", id).order("created_at", { ascending: false })).data ?? [],
  });

  const plansQ = useQuery({
    queryKey: ["plans-all"],
    queryFn: async () => (await supabase.from("plans").select("*").order("sort_order")).data ?? [],
  });

  const t = tenantQ.data as any;
  const plan = t?.plan;
  const sub = subQ.data as any;
  const counts = countsQ.data;
  const status: Status = (t?.status as Status) ?? (t?.is_active ? "active" : "suspended");

  // ----- editable form
  const [form, setForm] = useState({
    name: "", type: "professor", contact_name: "", email: "", phone: "",
    cnpj: "", city: "", state: "", internal_notes: "",
  });
  const owner = ownerQ.data as any;
  useEffect(() => {
    if (!t) return;
    setForm({
      name: t.name ?? "",
      type: t.type ?? "professor",
      contact_name: t.contact_name || owner?.full_name || "",
      email: t.email || owner?.email || "",
      phone: t.phone ?? "",
      cnpj: t.cnpj ?? "",
      city: t.city ?? "",
      state: t.state ?? "",
      internal_notes: t.internal_notes ?? "",
    });
  }, [t?.id, owner?.id]);

  const saveGeneral = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tenants").update(form as any).eq("id", id);
      if (error) throw error;
      await logAudit("tenant.updated", { entity_type: "tenant", entity_id: id, tenant_id: id });
    },
    onSuccess: () => { toast.success("Dados salvos"); qc.invalidateQueries({ queryKey: ["admin-tenant", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async (s: Status) => {
      const patch: Record<string, unknown> = { status: s, is_active: s === "active" || s === "trial" };
      const { error } = await supabase.from("tenants").update(patch as any).eq("id", id);
      if (error) throw error;
      await logAudit(`tenant.status.${s}`, { entity_type: "tenant", entity_id: id, tenant_id: id });
    },
    onSuccess: (_d, s) => { toast.success(`Status: ${STATUS_LABEL[s]}`); qc.invalidateQueries({ queryKey: ["admin-tenant", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
      await logAudit("tenant.deleted", { entity_type: "tenant", entity_id: id });
    },
    onSuccess: () => { toast.success("Cliente excluído"); router.navigate({ to: "/admin/clients", replace: true }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const impersonate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("impersonate_tenant", { _tenant: id });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.cancelQueries(); qc.clear();
      toast.success("Acessando como cliente");
      router.navigate({ to: "/dashboard", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateSub = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const planId = (patch.plan_id as string | null) ?? null;
      // Manual plan override by super admin: apply to tenants.plan_id (drives
      // feature gates & limits) AND to the subscription record (billing state).
      // Ready for future Stripe/gateway integration — webhook keeps both in sync.
      if (planId) {
        const { error: tErr } = await supabase.from("tenants").update({ plan_id: planId }).eq("id", id);
        if (tErr) throw tErr;
      }
      if (!sub) {
        const { error } = await supabase.from("subscriptions").insert({ tenant_id: id, ...patch } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").update(patch as any).eq("id", sub.id);
        if (error) throw error;
      }
      await logAudit("tenant.plan_overridden", { entity_type: "tenant", entity_id: id, tenant_id: id, metadata: { plan_id: planId, status: patch.status } });
    },
    onSuccess: () => {
      toast.success("Plano e assinatura atualizados");
      qc.invalidateQueries({ queryKey: ["admin-tenant-sub", id] });
      qc.invalidateQueries({ queryKey: ["admin-tenant", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (tenantQ.isLoading) return <div className="text-muted-foreground">Carregando…</div>;
  if (!t) return <div className="text-muted-foreground">Cliente não encontrado.</div>;

  const pct = (n: number, max?: number | null) => (max && max > 0 ? Math.min(100, Math.round((n / max) * 100)) : 0);

  return (
    <div className="space-y-6">
      <Link to="/admin/clients"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-3.5 w-3.5" /> Voltar</Button></Link>

      {/* HEADER */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{t.name}</h1>
              <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs md:grid-cols-4">
              <div><dt className="text-muted-foreground">Tipo</dt><dd className="font-medium capitalize">{t.type}</dd></div>
              <div><dt className="text-muted-foreground">Plano</dt><dd className="font-medium">{plan?.name ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Cadastrado</dt><dd className="font-medium">{fmtDate(t.created_at)}</dd></div>
              <div><dt className="text-muted-foreground">Último acesso</dt><dd className="font-medium">{fmtDateTime(t.last_login_at)}</dd></div>
              <div className="col-span-2 md:col-span-4"><dt className="text-muted-foreground">Tenant ID</dt><dd className="truncate font-mono text-[11px]">{t.id}</dd></div>
            </dl>
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div className="flex flex-wrap gap-2">
            {perms.isSuperAdmin && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { if (confirm(`Entrar como "${t.name}"? Será registrado nos logs.`)) impersonate.mutate(); }}>
                <LogIn className="h-3.5 w-3.5" /> Acessar
              </Button>
            )}
            {status !== "active" && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setStatus.mutate("active")}><Play className="h-3.5 w-3.5" /> Reativar</Button>}
            {status !== "suspended" && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setStatus.mutate("suspended")}><Pause className="h-3.5 w-3.5" /> Suspender</Button>}
            {status !== "blocked" && <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => setStatus.mutate("blocked")}><Ban className="h-3.5 w-3.5" /> Bloquear</Button>}
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => { if (confirm(`EXCLUIR "${t.name}" e todos os dados? Esta ação é irreversível.`)) remove.mutate(); }}>
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
          </div>
        </div>
      </Card>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Kpi icon={Users} label="Alunos" value={counts?.students ?? 0} />
        <Kpi icon={ClipboardList} label="Avaliações" value={counts?.evaluations ?? 0} />
        <Kpi icon={GraduationCap} label="Turmas" value={counts?.classes ?? 0} />
        <Kpi icon={Shield} label="Usuários" value={counts?.members ?? 0} />
        <Kpi icon={SchoolIcon} label="Escolas" value={counts?.schools ?? 0} />
        <Kpi icon={Activity} label="Último login" value={t.last_login_at ? fmtDate(t.last_login_at) : "—"} />
        <Kpi icon={FileText} label="Plano" value={plan?.name ?? "—"} />
      </div>

      {/* TABS */}
      <Tabs defaultValue="general">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="general">Dados gerais</TabsTrigger>
          <TabsTrigger value="subscription">Plano e Cobrança</TabsTrigger>
          <TabsTrigger value="usage">Utilização</TabsTrigger>
          <TabsTrigger value="access">Acessos</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="finance">Financeiro</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        {/* DADOS GERAIS */}
        <TabsContent value="general" className="space-y-4">
          {owner && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Conta de acesso (login)</h2>
              <div className="flex items-start gap-4">
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt="" className="h-14 w-14 rounded-full border border-border object-cover" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
                    {(owner.full_name || owner.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                  <div><dt className="text-xs text-muted-foreground">Nome (Google)</dt><dd className="font-medium">{owner.full_name ?? "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">E-mail de login</dt><dd className="font-medium break-all">{owner.email ?? "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Cadastrado em</dt><dd className="font-medium">{fmtDateTime(owner.created_at)}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">User ID</dt><dd className="font-mono text-[11px] break-all">{owner.id}</dd></div>
                </dl>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Dados obtidos da conta de autenticação (Google/e-mail). O e-mail e nome abaixo podem ser editados independentemente para fins comerciais.
              </p>
            </Card>
          )}
          <Card className="p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome da conta"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Tipo de cliente">
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="school">Escola</SelectItem>
                    <SelectItem value="academy">Academia</SelectItem>
                    <SelectItem value="club">Clube</SelectItem>
                    <SelectItem value="personal_trainer">Personal Trainer</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Nome do responsável"><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></Field>
              <Field label="E-mail principal"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Telefone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="CPF/CNPJ"><Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} /></Field>
              <Field label="Cidade"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
              <Field label="Estado"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={2} /></Field>
              <div className="md:col-span-2">
                <Field label="Observações internas (somente super admin)">
                  <Textarea rows={4} value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} placeholder="Cliente piloto, isento de cobrança, atendimento prioritário…" />
                </Field>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => saveGeneral.mutate()} disabled={saveGeneral.isPending} className="gap-1.5">
                <Save className="h-4 w-4" /> Salvar alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ASSINATURA */}
        <TabsContent value="subscription">
          <SubscriptionTab tenantId={id} sub={sub} plans={plansQ.data ?? []} onSave={(p) => updateSub.mutate(p)} pending={updateSub.isPending} />
        </TabsContent>

        {/* UTILIZAÇÃO */}
        <TabsContent value="usage">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Limites do plano</h2>
            <div className="space-y-4">
              <Usage label="Alunos" used={counts?.students ?? 0} max={plan?.max_students} />
              <Usage label="Usuários" used={counts?.members ?? 0} max={plan?.max_users} />
              <Usage label="Escolas" used={counts?.schools ?? 0} max={plan?.max_schools} />
              <Usage label="Avaliações" used={counts?.evaluations ?? 0} max={plan?.max_evaluations} />
              <Usage label="Turmas" used={counts?.classes ?? 0} max={null} />
              <Usage label="Grupos" used={counts?.groups ?? 0} max={null} />
              <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4" /> Storage: integração futura
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ACESSOS */}
        <TabsContent value="access">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Últimos acessos</h2>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                <span className="text-sm">Último login registrado</span>
                <span className="font-medium">{fmtDateTime(t.last_login_at)}</span>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                Histórico detalhado de IP, dispositivo e navegador exige captura na camada de autenticação. Disponível em fase futura — a tabela está pronta para receber esses eventos.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* AUDITORIA */}
        <TabsContent value="audit">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Histórico de auditoria</div>
            {auditQ.isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div>}
            {!auditQ.isLoading && (auditQ.data ?? []).length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Sem registros.</div>}
            <ul className="divide-y divide-border/60">
              {(auditQ.data ?? []).map((l: any) => (
                <li key={l.id} className="grid grid-cols-[1fr_auto] gap-2 px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs">{l.action}</div>
                    <div className="truncate text-xs text-muted-foreground">{l.actor_email ?? "—"} • {l.entity_type ?? "—"}{l.entity_id ? ` #${String(l.entity_id).slice(0, 8)}` : ""}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">{fmtDateTime(l.created_at)}</div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="finance">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Histórico de cobranças</div>
            {paymentsQ.isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div>}
            {!paymentsQ.isLoading && (paymentsQ.data ?? []).length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Nenhuma cobrança registrada. Stripe será conectado em fase futura.</div>}
            <ul className="divide-y divide-border/60">
              {(paymentsQ.data ?? []).map((p: any) => (
                <li key={p.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm">
                  <div>
                    <div className="font-medium">{fmtCurrency(p.amount_cents)}</div>
                    <div className="text-xs text-muted-foreground">{p.method ?? "—"} • {fmtDateTime(p.paid_at)}</div>
                  </div>
                  <Badge variant={p.status === "paid" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">{p.external_id ? `#${p.external_id.slice(0, 8)}` : ""}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        {/* SUPORTE */}
        <TabsContent value="support">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Chamados</div>
            {ticketsQ.isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div>}
            {!ticketsQ.isLoading && (ticketsQ.data ?? []).length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Sem chamados.</div>}
            <ul className="divide-y divide-border/60">
              {(ticketsQ.data ?? []).map((tk: any) => (
                <li key={tk.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{tk.subject}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{tk.priority}</Badge>
                      <Badge>{tk.status}</Badge>
                    </div>
                  </div>
                  {tk.description && <p className="mt-1 text-sm text-muted-foreground">{tk.description}</p>}
                  <div className="mt-1 text-xs text-muted-foreground">{fmtDateTime(tk.created_at)}</div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-2 truncate text-xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Usage({ label, used, max }: { label: string; used: number; max?: number | null }) {
  const unlimited = !max || max <= 0;
  const pctVal = unlimited ? 0 : Math.min(100, Math.round((used / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{used}{unlimited ? "" : ` / ${max}`}</span>
      </div>
      <Progress value={unlimited ? 0 : pctVal} />
      {unlimited && <div className="mt-1 text-[11px] text-muted-foreground">Sem limite definido no plano</div>}
    </div>
  );
}

function SubscriptionTab({
  sub, plans, onSave, pending,
}: {
  tenantId: string;
  sub: any;
  plans: any[];
  onSave: (patch: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const [s, setS] = useState({
    plan_id: sub?.plan_id ?? "",
    status: sub?.status ?? "trial",
    billing_cycle: sub?.billing_cycle ?? "monthly",
    amount_cents: sub?.amount_cents ?? 0,
    amount_yearly_cents: sub?.amount_yearly_cents ?? 0,
    discount_cents: sub?.discount_cents ?? 0,
    trial_ends_at: sub?.trial_ends_at ? sub.trial_ends_at.slice(0, 10) : "",
    current_period_start: sub?.current_period_start ? sub.current_period_start.slice(0, 10) : "",
    current_period_end: sub?.current_period_end ? sub.current_period_end.slice(0, 10) : "",
    cancel_at_period_end: sub?.cancel_at_period_end ?? false,
  });
  useEffect(() => {
    if (!sub) return;
    setS({
      plan_id: sub.plan_id ?? "",
      status: sub.status ?? "trial",
      billing_cycle: sub.billing_cycle ?? "monthly",
      amount_cents: sub.amount_cents ?? 0,
      amount_yearly_cents: sub.amount_yearly_cents ?? 0,
      discount_cents: sub.discount_cents ?? 0,
      trial_ends_at: sub.trial_ends_at ? sub.trial_ends_at.slice(0, 10) : "",
      current_period_start: sub.current_period_start ? sub.current_period_start.slice(0, 10) : "",
      current_period_end: sub.current_period_end ? sub.current_period_end.slice(0, 10) : "",
      cancel_at_period_end: !!sub.cancel_at_period_end,
    });
  }, [sub?.id]);

  const valorFinal = Math.max(0, (s.billing_cycle === "yearly" ? s.amount_yearly_cents : s.amount_cents) - s.discount_cents);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Plano e situação</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Plano">
            <Select value={s.plan_id || "none"} onValueChange={(v) => setS({ ...s, plan_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Sem plano" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem plano</SelectItem>
                {plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Situação">
            <Select value={s.status} onValueChange={(v) => setS({ ...s, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="past_due">Inadimplente</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ciclo">
            <Select value={s.billing_cycle} onValueChange={(v) => setS({ ...s, billing_cycle: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Valores</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Valor mensal (R$)"><Input type="number" step="0.01" value={(s.amount_cents / 100).toString()} onChange={(e) => setS({ ...s, amount_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} /></Field>
          <Field label="Valor anual (R$)"><Input type="number" step="0.01" value={(s.amount_yearly_cents / 100).toString()} onChange={(e) => setS({ ...s, amount_yearly_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} /></Field>
          <Field label="Desconto (R$)"><Input type="number" step="0.01" value={(s.discount_cents / 100).toString()} onChange={(e) => setS({ ...s, discount_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} /></Field>
          <Field label="Valor final"><Input value={fmtCurrency(valorFinal)} disabled /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Datas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Trial até"><Input type="date" value={s.trial_ends_at} onChange={(e) => setS({ ...s, trial_ends_at: e.target.value })} /></Field>
          <Field label="Início do ciclo"><Input type="date" value={s.current_period_start} onChange={(e) => setS({ ...s, current_period_start: e.target.value })} /></Field>
          <Field label="Renovação / vencimento"><Input type="date" value={s.current_period_end} onChange={(e) => setS({ ...s, current_period_end: e.target.value })} /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stripe (integração futura)</h2>
        <div className="grid gap-3 text-xs md:grid-cols-2">
          <Info label="Customer ID" value={sub?.stripe_customer_id} />
          <Info label="Subscription ID" value={sub?.stripe_subscription_id} />
          <Info label="Price ID" value={sub?.stripe_price_id} />
          <Info label="Status do Stripe" value={sub?.stripe_status} />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">A integração com Stripe está preparada na base de dados. Os campos serão preenchidos automaticamente após a conexão.</p>
      </Card>

      <div className="flex justify-end">
        <Button
          disabled={pending}
          className="gap-1.5"
          onClick={() => onSave({
            plan_id: s.plan_id || null,
            status: s.status,
            billing_cycle: s.billing_cycle,
            amount_cents: s.amount_cents,
            amount_yearly_cents: s.amount_yearly_cents,
            discount_cents: s.discount_cents,
            trial_ends_at: s.trial_ends_at || null,
            current_period_start: s.current_period_start || null,
            current_period_end: s.current_period_end || null,
            cancel_at_period_end: s.cancel_at_period_end,
          })}
        >
          <Save className="h-4 w-4" /> Salvar assinatura
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-border/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-mono">{value || "—"}</div>
    </div>
  );
}
