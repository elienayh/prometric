import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Plus, UserMinus, Users, UsersRound, Zap } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/layout/page-header";
import { useCurrentTenant } from "@/hooks/use-tenant";

export const Route = createFileRoute("/_authenticated/groups/$id/")({
  head: () => ({ meta: [{ title: "Participantes do Grupo — ProMetric" }] }),
  component: GroupMembersPage,
});

type GroupInfo = { id: string; name: string; display_name: string | null; description: string | null };
type StudentRow = { id: string; full_name: string; sex: "male" | "female"; birth_date: string; group_id: string | null };

function ageFrom(birth: string) {
  const b = new Date(birth);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

function GroupMembersPage() {
  const { id } = Route.useParams();
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const info = useQuery({
    queryKey: ["group-info", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups").select("id,name,display_name,description").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as GroupInfo | null;
    },
  });

  const members = useQuery({
    queryKey: ["group-members", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,group_id")
        .eq("group_id", id)
        .order("full_name");
      if (error) throw error;
      return data as StudentRow[];
    },
  });

  const remove = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase.from("students").update({ group_id: null }).eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Participante removido do grupo");
      qc.invalidateQueries({ queryKey: ["group-members", id] });
      qc.invalidateQueries({ queryKey: ["group-stats", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });

  const g = info.data;
  const title = g?.display_name || g?.name || "Grupo";

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Grupos", to: "/groups" }, { label: title }]} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/groups"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 shrink-0 text-primary" />
              <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{title}</h1>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {[g?.description, `${members.data?.length ?? 0} participante(s)`].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/groups/$id/dashboard" params={{ id }}>
              <BarChart3 className="mr-1.5 h-4 w-4" /> Resumo do grupo
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/quick-eval"><Zap className="mr-1.5 h-4 w-4" /> Nova avaliação</Link>
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> Adicionar participantes
          </Button>
        </div>
      </div>

      {members.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando participantes…</div>
      ) : (members.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhum participante neste grupo"
          description="Adicione alunos já cadastrados para compor o grupo."
          actionLabel="Adicionar participantes"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Participantes</h2>
            <span className="text-xs text-muted-foreground">({members.data!.length})</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {members.data!.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                <Link to="/students/$id" params={{ id: s.id }} className="min-w-0 flex-1 hover:text-primary">
                  <div className="truncate text-sm font-medium">{s.full_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.sex === "male" ? "Masculino" : "Feminino"} • {ageFrom(s.birth_date)} anos
                  </div>
                </Link>
                <Button
                  variant="ghost" size="icon"
                  className="min-h-9 min-w-9 text-destructive"
                  aria-label={`Remover ${s.full_name} do grupo`}
                  onClick={() => remove.mutate(s.id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddMembersDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        groupId={id}
        tenantId={tenantId}
      />
    </div>
  );
}

function AddMembersDialog({
  open, onOpenChange, groupId, tenantId,
}: { open: boolean; onOpenChange: (b: boolean) => void; groupId: string; tenantId: string | null }) {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const pool = useQuery({
    queryKey: ["group-candidates", tenantId, groupId],
    enabled: open && !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,group_id")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return (data as StudentRow[]).filter((s) => s.group_id !== groupId);
    },
  });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    const rows = pool.data ?? [];
    return t ? rows.filter((s) => s.full_name.toLowerCase().includes(t)) : rows;
  }, [pool.data, term]);

  const save = useMutation({
    mutationFn: async () => {
      if (selected.length === 0) throw new Error("Selecione ao menos um aluno");
      const { error } = await supabase.from("students").update({ group_id: groupId }).in("id", selected);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Participantes adicionados");
      qc.invalidateQueries({ queryKey: ["group-members", groupId] });
      qc.invalidateQueries({ queryKey: ["group-stats", groupId] });
      qc.invalidateQueries({ queryKey: ["group-candidates"] });
      setSelected([]);
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao adicionar"),
  });

  const toggle = (sid: string) =>
    setSelected((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));

  return (
    <Dialog open={open} onOpenChange={(b) => { if (!b) { setTerm(""); setSelected([]); } onOpenChange(b); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Adicionar participantes</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">
          Selecione alunos já cadastrados. Nenhum cadastro novo é criado.
        </p>
        <Input placeholder="Buscar aluno…" value={term} onChange={(e) => setTerm(e.target.value)} />
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {pool.isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Carregando alunos…</div>
          ) : filtered.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">Nenhum aluno disponível.</div>
          ) : (
            filtered.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50">
                <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{s.full_name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {ageFrom(s.birth_date)} anos{s.group_id ? " • já em outro grupo" : ""}
                  </span>
                </span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || selected.length === 0}
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {save.isPending ? "Adicionando…" : `Adicionar (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
