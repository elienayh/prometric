import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { LineChart, Pencil, Plus, Search, Trash2, Upload, User } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/students/")({
  head: () => ({ meta: [{ title: "Alunos — ProMetric" }] }),
  component: StudentsPage,
});

type Sex = "male" | "female";
type StudentRow = {
  id: string; full_name: string; sex: Sex; birth_date: string;
  class_id: string | null; group_id: string | null;
  phone: string | null; email: string | null;
  class?: { name: string } | null;
  group?: { name: string } | null;
};

function calcAge(birth: string) {
  const b = new Date(birth);
  const diff = Date.now() - b.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function StudentsPage() {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [toDelete, setToDelete] = useState<StudentRow | null>(null);
  const [q, setQ] = useState("");


  const classes = useQuery({
    queryKey: ["classes-lite", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id,name").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const groups = useQuery({
    queryKey: ["groups-lite", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("id,name").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const list = useQuery({
    queryKey: ["students", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,class_id,group_id,phone,email,class:classes(name),group:groups(name)")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data as unknown as StudentRow[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Aluno arquivado"); qc.invalidateQueries({ queryKey: ["students"] }); qc.invalidateQueries({ queryKey: ["class-stats"] }); qc.invalidateQueries({ queryKey: ["group-stats"] }); },
  });

  const filtered = useMemo(() => {
    const all = list.data ?? [];
    if (!q.trim()) return all;
    const term = q.toLowerCase();
    return all.filter((s) => s.full_name.toLowerCase().includes(term));
  }, [list.data, q]);

  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Cadastro central de alunos, atletas e clientes."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/students/import"><Upload className="mr-1.5 h-4 w-4" /> Importar</Link>
            </Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              <Plus className="mr-1.5 h-4 w-4" /> Novo aluno
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar aluno…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} resultado(s)</span>
      </div>

      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={q ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          description={q ? "Tente outro termo de busca." : "Comece cadastrando seu primeiro aluno ou atleta."}
          actionLabel={q ? undefined : "Cadastrar aluno"}
          onAction={q ? undefined : () => { setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group relative rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:border-primary/50"
              title="Abrir ficha do aluno"
            >
              <Link
                to="/students/$id"
                params={{ id: s.id }}
                aria-label={`Abrir ficha completa de ${s.full_name}`}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                  e.preventDefault();
                  navigate({ to: "/students/$id", params: { id: s.id } });
                }
              }}
                className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="flex w-full items-start gap-3 text-left">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-semibold group-hover:text-primary transition-colors">{s.full_name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.sex === "male" ? "Masc." : "Fem."} • {calcAge(s.birth_date)} anos
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {s.class?.name && <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{s.class.name}</span>}
                {s.group?.name && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-accent-foreground">{s.group.name}</span>}
              </div>
              <div className="relative z-20 mt-3 flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 flex-1"
                  asChild
                >
                  <Link to="/students/$id" params={{ id: s.id }}>
                    <LineChart className="mr-1 h-3.5 w-3.5" /> Ficha completa
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="min-h-11 min-w-11" aria-label={`Editar ${s.full_name}`} onClick={() => { setEditing(s); setOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" aria-label={`Arquivar ${s.full_name}`} onClick={() => { setToDelete(s); }} className="min-h-11 min-w-11 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

        </div>
      )}

      <StudentDialog
        open={open} onOpenChange={setOpen} editing={editing} tenantId={tenantId}
        classes={classes.data ?? []} groups={groups.data ?? []}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(b) => !b && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar aluno?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && (
                <>
                  <strong>{toDelete.full_name}</strong> será arquivado e deixará de aparecer nas listas, dashboards e rankings.
                  As avaliações existentes serão preservadas no histórico, mas o aluno não poderá receber novas avaliações
                  enquanto estiver arquivado.
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
              Arquivar aluno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StudentDialog({
  open, onOpenChange, editing, tenantId, classes, groups,
}: {
  open: boolean; onOpenChange: (b: boolean) => void; editing: StudentRow | null;
  tenantId: string | null; classes: { id: string; name: string }[]; groups: { id: string; name: string }[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<StudentRow>>(editing ?? { sex: "male" });

  // Sincroniza o formulário sempre que o diálogo é aberto ou o aluno editado muda.
  // Necessário porque `Dialog.onOpenChange` (Radix) não dispara quando o pai controla `open`.
  useEffect(() => {
    if (open) setForm(editing ?? { sex: "male" });
  }, [open, editing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant");
      if (!form.full_name || !form.birth_date || !form.sex) throw new Error("Preencha os campos obrigatórios");
      const payload = {
        tenant_id: tenantId,
        full_name: form.full_name, sex: form.sex, birth_date: form.birth_date,
        class_id: form.class_id ?? null, group_id: form.group_id ?? null,
        phone: form.phone ?? null, email: form.email ?? null,
      };
      if (editing) {
        const { error } = await supabase.from("students").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Aluno atualizado" : "Aluno cadastrado");
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["class-stats"] });
      qc.invalidateQueries({ queryKey: ["group-stats"] });

      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <Dialog open={open} onOpenChange={(b) => { if (b) setForm(editing ?? { sex: "male" }); onOpenChange(b); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Editar aluno" : "Novo aluno"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome completo*</Label>
            <Input required value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Sexo*</Label>
              <Select value={form.sex ?? "male"} onValueChange={(v) => setForm({ ...form, sex: v as Sex })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nascimento*</Label>
              <Input type="date" required value={form.birth_date ?? ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Turma</Label>
              <Select value={form.class_id ?? undefined} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Grupo</Label>
              <Select value={form.group_id ?? undefined} onValueChange={(v) => setForm({ ...form, group_id: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone</Label>
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">E-mail</Label>
              <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
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
