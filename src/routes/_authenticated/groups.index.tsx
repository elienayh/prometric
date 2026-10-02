import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, Pencil, Plus, Trash2, UsersRound } from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";

export const Route = createFileRoute("/_authenticated/groups/")({
  head: () => ({ meta: [{ title: "Grupos — ProMetric" }] }),
  component: GroupsPage,
});

type GroupRow = { id: string; name: string; description: string | null; color: string | null };

function GroupsPage() {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GroupRow | null>(null);

  const list = useQuery({
    queryKey: ["groups", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("id,name,description,color").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as GroupRow[];
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("groups").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Grupo removido"); qc.invalidateQueries({ queryKey: ["groups"] }); },
  });

  return (
    <div>
      <PageHeader
        title="Grupos"
        description="Crie grupos personalizados — modalidade, turma, horário, equipe."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> Novo grupo
          </Button>
        }
      />

      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhum grupo ainda"
          description="Exemplos: Futebol Sub-13, Academia Manhã, Voleibol Feminino."
          actionLabel="Criar grupo"
          onAction={() => { setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.data!.map((g) => (
            <div key={g.id} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
              <Link to="/groups/$id" params={{ id: g.id }} className="flex items-start gap-3 hover:opacity-90">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-semibold hover:text-primary hover:underline">{g.name}</h3>
                  {g.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>}
                </div>
              </Link>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="min-h-11" asChild>
                  <Link to="/groups/$id/dashboard" params={{ id: g.id }} aria-label={`Abrir resumo do grupo ${g.name}`}><BarChart3 className="mr-1 h-3.5 w-3.5" /> Resumo</Link>
                </Button>
                <Button variant="ghost" size="sm" className="min-h-11" onClick={() => { setEditing(g); setOpen(true); }} aria-label={`Editar grupo ${g.name}`}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => del.mutate(g.id)} className="min-h-11 min-w-11 text-destructive" aria-label={`Excluir grupo ${g.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

          ))}
        </div>
      )}

      <GroupDialog open={open} onOpenChange={setOpen} editing={editing} tenantId={tenantId} />
    </div>
  );
}

function GroupDialog({
  open, onOpenChange, editing, tenantId,
}: { open: boolean; onOpenChange: (b: boolean) => void; editing: GroupRow | null; tenantId: string | null }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<GroupRow>>(editing ?? {});
  const save = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant");
      if (!form.name) throw new Error("Nome obrigatório");
      const payload = { tenant_id: tenantId, name: form.name, description: form.description ?? null, color: form.color ?? null };
      if (editing) {
        const { error } = await supabase.from("groups").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("groups").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editing ? "Atualizado" : "Criado"); qc.invalidateQueries({ queryKey: ["groups"] }); onOpenChange(false); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <Dialog open={open} onOpenChange={(b) => { if (b) setForm(editing ?? {}); onOpenChange(b); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Editar grupo" : "Novo grupo"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome*</Label>
            <Input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Futebol Sub-13" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
