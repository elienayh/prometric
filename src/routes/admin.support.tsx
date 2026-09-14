import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({ component: SupportPage });

type Priority = "low" | "normal" | "high" | "urgent";
type Status = "open" | "pending" | "resolved" | "closed";

function SupportPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Status | "all">("all");

  const tickets = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, subject, priority, status, created_at, resolved_at, description, tenant:tenants(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const tenants = useQuery({
    queryKey: ["admin-tenants-list"],
    queryFn: async () => (await supabase.from("tenants").select("id, name").order("name")).data ?? [],
  });

  const [form, setForm] = useState({ tenant_id: "", subject: "", description: "", priority: "normal" as Priority });
  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("support_tickets").insert({
        tenant_id: form.tenant_id || null,
        subject: form.subject,
        description: form.description || null,
        priority: form.priority,
        opened_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket criado");
      setOpen(false);
      setForm({ tenant_id: "", subject: "", description: "", priority: "normal" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const patch: { status: Status; resolved_at?: string | null } = { status };
      if (status === "resolved" || status === "closed") patch.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("support_tickets").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tickets"] }),
  });

  const filtered = (tickets.data ?? []).filter((t) => filter === "all" || t.status === filter);

  const prioColor: Record<Priority, string> = {
    low: "bg-muted text-muted-foreground",
    normal: "bg-primary/15 text-primary",
    high: "bg-warning/20 text-warning",
    urgent: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Suporte</h1>
          <p className="text-sm text-muted-foreground">Chamados dos clientes</p>
        </div>
        <div className="flex flex-wrap gap-2">

          <Select value={filter} onValueChange={(v) => setFilter(v as Status | "all")}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Novo ticket</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo chamado</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Cliente (opcional)</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => setForm({ ...form, tenant_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sem cliente" /></SelectTrigger>
                    <SelectContent>{(tenants.data ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Assunto</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending || !form.subject}>Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid gap-3">
        {tickets.isLoading && <div className="text-muted-foreground">Carregando...</div>}
        {!tickets.isLoading && filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">Nenhum ticket.</Card>}
        {filtered.map((t: { id: string; subject: string; description: string | null; status: Status; priority: Priority; created_at: string; tenant: { name: string } | null }) => (
          <Card key={t.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={prioColor[t.priority]}>{t.priority}</Badge>
                  <h3 className="font-semibold">{t.subject}</h3>
                </div>
                {t.description && <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{t.tenant?.name ?? "Sem cliente"}</span>
                  <span>•</span>
                  <span>{new Date(t.created_at).toLocaleString("pt-BR")}</span>
                </div>
              </div>
              <Select value={t.status} onValueChange={(v) => updateStatus.mutate({ id: t.id, status: v as Status })}>
                <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
