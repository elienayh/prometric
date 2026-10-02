import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, FileText, Pencil, Plus, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { generateInstitutionalPDF } from "@/lib/pdf-report";
import { ZONES, type Zone, type Classifications } from "@/lib/proesp";

export const Route = createFileRoute("/_authenticated/schools")({
  head: () => ({ meta: [{ title: "Escolas — ProMetric" }] }),
  component: SchoolsPage,
});

type SchoolRow = {
  id: string; name: string; network: string | null; city: string | null;
  state: string | null; phone: string | null; email: string | null;
};

function SchoolsPage() {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolRow | null>(null);

  const list = useQuery({
    queryKey: ["schools", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id,name,network,city,state,phone,email")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SchoolRow[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Escola removida"); qc.invalidateQueries({ queryKey: ["schools"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div>
      <PageHeader
        title="Escolas"
        description="Gerencie as unidades escolares do seu espaço."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> Nova escola
          </Button>
        }
      />

      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhuma escola ainda"
          description="Cadastre sua primeira escola para começar a organizar turmas e alunos."
          actionLabel="Cadastrar escola"
          onAction={() => { setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {list.data!.map((s) => (
            <div key={s.id} className="group rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link to="/schools/$id" params={{ id: s.id }} className="block truncate font-display font-semibold hover:text-primary">{s.name}</Link>
                  <p className="truncate text-xs text-muted-foreground">{[s.city, s.state].filter(Boolean).join(" / ") || "—"}</p>
                </div>
                <Button variant="ghost" size="icon" asChild title="Abrir dashboard" className="min-h-11 min-w-11">
                  <Link to="/schools/$id" params={{ id: s.id }} aria-label={`Abrir dashboard da escola ${s.name}`}><BarChart3 className="h-4 w-4 text-primary" /></Link>
                </Button>
              </div>
              {s.network && <p className="mt-3 text-xs text-muted-foreground">Rede: {s.network}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditing(s); setOpen(true); }}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                </Button>
                <InstitutionalReportButton schoolId={s.id} />
                <Button variant="ghost" size="sm" onClick={() => del.mutate(s.id)} className="min-h-11 min-w-11 text-destructive hover:text-destructive" aria-label={`Excluir escola ${s.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SchoolDialog open={open} onOpenChange={setOpen} editing={editing} tenantId={tenantId} />
    </div>
  );
}

function SchoolDialog({
  open, onOpenChange, editing, tenantId,
}: { open: boolean; onOpenChange: (b: boolean) => void; editing: SchoolRow | null; tenantId: string | null }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<SchoolRow>>({});

  function reset() { setForm(editing ?? {}); }
  // sync on open
  if (open && form === undefined) reset();

  const save = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant ativo");
      if (!form.name) throw new Error("Nome é obrigatório");
      const payload = {
        tenant_id: tenantId,
        name: form.name,
        network: form.network ?? null,
        city: form.city ?? null,
        state: form.state ?? null,
        phone: form.phone ?? null,
        email: form.email ?? null,
      };
      if (editing) {
        const { error } = await supabase.from("schools").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("schools").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Escola atualizada" : "Escola criada");
      qc.invalidateQueries({ queryKey: ["schools"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <Dialog open={open} onOpenChange={(b) => { if (b) setForm(editing ?? {}); onOpenChange(b); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Editar escola" : "Nova escola"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <Field label="Nome*"><Input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Rede"><Input value={form.network ?? ""} onChange={(e) => setForm({ ...form, network: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cidade"><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Estado"><Input maxLength={2} value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="E-mail"><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function InstitutionalReportButton({ schoolId }: { schoolId: string }) {
  const { tenantId, tenant } = useCurrentTenant();

  const gen = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant ativo");
      const { data: school, error: sErr } = await supabase
        .from("schools").select("name,city,state,network").eq("id", schoolId).single();
      if (sErr || !school) throw new Error("Escola não encontrada");

      const { data: classesRows } = await supabase
        .from("classes").select("id,name").eq("school_id", schoolId).eq("tenant_id", tenantId);
      const classIds = (classesRows ?? []).map((c) => c.id);

      const { data: students } = await supabase
        .from("students").select("id,full_name,sex,class_id").in("class_id", classIds.length ? classIds : ["00000000-0000-0000-0000-000000000000"]).eq("is_active", true);
      const studentIds = (students ?? []).map((s) => s.id);

      const { data: evals } = await supabase
        .from("evaluations").select("id,student_id,classifications")
        .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
        .order("evaluated_at", { ascending: false });

      // Última avaliação por aluno
      const latest = new Map<string, { student_id: string; classifications: Classifications }>();
      for (const e of (evals ?? []) as { student_id: string; classifications: Classifications }[]) {
        if (!latest.has(e.student_id)) latest.set(e.student_id, e);
      }

      const zoneCounts = ZONES.reduce((acc, z) => ({ ...acc, [z]: 0 }), {} as Record<Zone, number>);
      for (const e of latest.values()) for (const z of Object.values(e.classifications ?? {})) if (z) zoneCounts[z as Zone]++;

      // Por turma
      const classMap = new Map((classesRows ?? []).map((c) => [c.id, c.name]));
      const studClass = new Map((students ?? []).map((s) => [s.id, s.class_id as string | null]));
      const byClass: Record<string, { total: number; healthy: number; risk: number }> = {};
      for (const [sid, ev] of latest) {
        const cn = classMap.get(studClass.get(sid) ?? "") ?? "Sem turma";
        byClass[cn] ??= { total: 0, healthy: 0, risk: 0 };
        const vals = Object.values(ev.classifications ?? {}).filter(Boolean) as Zone[];
        if (!vals.length) continue;
        byClass[cn].total++;
        const h = vals.filter((z) => z === "Bom" || z === "Muito Bom" || z === "Excelente").length / vals.length;
        const r = vals.filter((z) => z === "Fraco" || z === "Muito Fraco").length / vals.length;
        if (h >= 0.6) byClass[cn].healthy++;
        if (r >= 0.3) byClass[cn].risk++;
      }
      const classBreakdown = Object.entries(byClass).map(([name, v]) => ({
        name, total: v.total,
        healthyPct: v.total ? Math.round((v.healthy / v.total) * 100) : 0,
        riskPct: v.total ? Math.round((v.risk / v.total) * 100) : 0,
      })).sort((a, b) => b.healthyPct - a.healthyPct);

      // Alunos em atenção
      const atRisk: { name: string; class: string; issues: string }[] = [];
      const studName = new Map((students ?? []).map((s) => [s.id, s.full_name]));
      for (const [sid, ev] of latest) {
        const issues = Object.entries(ev.classifications ?? {})
          .filter(([, z]) => z === "Fraco" || z === "Muito Fraco")
          .map(([k, z]) => `${k}:${z}`).join(", ");
        if (issues) {
          atRisk.push({
            name: studName.get(sid) ?? "—",
            class: classMap.get(studClass.get(sid) ?? "") ?? "—",
            issues,
          });
        }
      }

      generateInstitutionalPDF({
        tenantName: tenant?.name ?? "ProMetric",
        school,
        totalStudents: (students ?? []).length,
        totalEvaluations: (evals ?? []).length,
        totalClasses: (classesRows ?? []).length,
        sex: {
          male: (students ?? []).filter((s) => s.sex === "male").length,
          female: (students ?? []).filter((s) => s.sex === "female").length,
        },
        zoneCounts,
        classBreakdown,
        atRisk: atRisk.slice(0, 40),
      });
    },
    onSuccess: () => toast.success("Relatório gerado"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao gerar"),
  });

  return (
    <Button variant="outline" size="sm" onClick={() => gen.mutate()} disabled={gen.isPending}>
      <FileText className="mr-1 h-3.5 w-3.5" /> {gen.isPending ? "Gerando…" : "Relatório PDF"}
    </Button>
  );
}
