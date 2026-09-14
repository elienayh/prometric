import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, Pencil, Plus, Trash2, GraduationCap } from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";

export const Route = createFileRoute("/_authenticated/classes/")({
  head: () => ({ meta: [{ title: "Turmas — ProMetric" }] }),
  component: ClassesPage,
});

type Shift = "morning" | "afternoon" | "evening" | "full";
type ClassRow = {
  id: string; name: string; grade: string | null; school_year: number | null;
  shift: Shift | null; school_id: string | null;
  school?: { name: string } | null;
};

const shiftLabels: Record<Shift, string> = { morning: "Manhã", afternoon: "Tarde", evening: "Noite", full: "Integral" };

function ClassesPage() {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [toDelete, setToDelete] = useState<ClassRow | null>(null);

  const schools = useQuery({
    queryKey: ["schools-lite", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id,name").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const list = useQuery({
    queryKey: ["classes", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id,name,grade,school_year,shift,school_id,school:schools(name)")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ClassRow[];
    },
  });

  // Quantos alunos ativos serão impactados pela exclusão da turma selecionada.
  const studentsInClass = useQuery({
    queryKey: ["class-students-count", toDelete?.id],
    enabled: !!toDelete,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("class_id", toDelete!.id)
        .eq("is_active", true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      // Reatribuição segura: desvincula alunos antes de excluir a turma para
      // evitar referências órfãs (class_id apontando para turma inexistente).
      const { error: unlinkErr } = await supabase
        .from("students")
        .update({ class_id: null })
        .eq("class_id", id);
      if (unlinkErr) throw unlinkErr;
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Turma removida. Alunos foram desvinculados.");
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover turma"),
  });

  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Organize alunos por turma, série e turno."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> Nova turma
          </Button>
        }
      />

      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhuma turma cadastrada"
          description="Crie turmas para organizar seus alunos por série e turno."
          actionLabel="Criar turma"
          onAction={() => { setEditing(null); setOpen(true); }}
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-2 md:hidden">
            {list.data!.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <Link to="/classes/$id" params={{ id: c.id }} className="flex min-w-0 items-center gap-2 font-semibold hover:text-primary">
                    <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate hover:underline">{c.name}</span>
                  </Link>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" asChild className="min-h-11 min-w-11">
                      <Link to="/classes/$id/dashboard" params={{ id: c.id }} aria-label={`Abrir resumo da turma ${c.name}`}><BarChart3 className="h-4 w-4 text-primary" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }} aria-label={`Editar turma ${c.name}`} className="min-h-11 min-w-11"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setToDelete(c)} className="min-h-11 min-w-11 text-destructive" aria-label={`Excluir turma ${c.name}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">Escola</dt><dd className="mt-0.5 truncate font-medium">{c.school?.name ?? "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Série</dt><dd className="mt-0.5 font-medium">{c.grade ?? "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Ano</dt><dd className="mt-0.5 font-medium">{c.school_year ?? "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Turno</dt><dd className="mt-0.5 font-medium">{c.shift ? shiftLabels[c.shift] : "—"}</dd></div>
                </dl>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Turma</th>
                  <th className="px-4 py-3 text-left font-medium">Escola</th>
                  <th className="px-4 py-3 text-left font-medium">Série</th>
                  <th className="px-4 py-3 text-left font-medium">Ano</th>
                  <th className="px-4 py-3 text-left font-medium">Turno</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {list.data!.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">
                      <Link to="/classes/$id" params={{ id: c.id }} className="flex items-center gap-2 hover:text-primary hover:underline">
                        <GraduationCap className="h-4 w-4 text-primary" /> {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.school?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.grade ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.school_year ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.shift ? shiftLabels[c.shift] : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" asChild className="min-h-11 min-w-11">
                        <Link to="/classes/$id/dashboard" params={{ id: c.id }} aria-label={`Abrir resumo da turma ${c.name}`}><BarChart3 className="h-4 w-4 text-primary" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }} className="min-h-11 min-w-11" aria-label={`Editar turma ${c.name}`}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(c)} className="min-h-11 min-w-11 text-destructive" aria-label={`Excluir turma ${c.name}`}><Trash2 className="h-4 w-4" /></Button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ClassDialog open={open} onOpenChange={setOpen} editing={editing} tenantId={tenantId} schools={schools.data ?? []} />

      <AlertDialog open={!!toDelete} onOpenChange={(b) => !b && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turma?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && (
                <>
                  A turma <strong>{toDelete.name}</strong> será removida permanentemente.
                  {(studentsInClass.data ?? 0) > 0 && (
                    <> Os <strong>{studentsInClass.data}</strong> aluno(s) vinculados a esta turma serão automaticamente <strong>desvinculados</strong> (não excluídos) e poderão ser reatribuídos a outra turma depois.</>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (toDelete) { del.mutate(toDelete.id); setToDelete(null); } }}
            >
              Excluir turma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ClassDialog({
  open, onOpenChange, editing, tenantId, schools,
}: {
  open: boolean; onOpenChange: (b: boolean) => void; editing: ClassRow | null;
  tenantId: string | null; schools: { id: string; name: string }[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<ClassRow>>(editing ?? {});

  const save = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant ativo");
      if (!form.name) throw new Error("Nome é obrigatório");
      const payload = {
        tenant_id: tenantId, name: form.name, grade: form.grade ?? null,
        school_year: form.school_year ?? null, shift: form.shift ?? null,
        school_id: form.school_id ?? null,
      };
      if (editing) {
        const { error } = await supabase.from("classes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("classes").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Turma atualizada" : "Turma criada");
      qc.invalidateQueries({ queryKey: ["classes"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <Dialog open={open} onOpenChange={(b) => { if (b) setForm(editing ?? {}); onOpenChange(b); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Editar turma" : "Nova turma"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome*</Label>
            <Input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: 8º A" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Escola</Label>
            <Select value={form.school_id ?? undefined} onValueChange={(v) => setForm({ ...form, school_id: v })}>
              <SelectTrigger><SelectValue placeholder="Sem escola" /></SelectTrigger>
              <SelectContent>
                {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Série</Label>
              <Input value={form.grade ?? ""} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Ex.: 8º ano" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ano letivo</Label>
              <Input type="number" value={form.school_year ?? ""} onChange={(e) => setForm({ ...form, school_year: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Turno</Label>
            <Select value={form.shift ?? undefined} onValueChange={(v) => setForm({ ...form, shift: v as Shift })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(shiftLabels) as Shift[]).map((s) => <SelectItem key={s} value={s}>{shiftLabels[s]}</SelectItem>)}
              </SelectContent>
            </Select>
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
