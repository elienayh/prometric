import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { logAudit, type AdminRole } from "@/hooks/use-admin";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/administrators")({ component: AdministratorsPage });

const roleLabel: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin_financeiro: "Admin Financeiro",
  admin_suporte: "Admin Suporte",
  admin_operacional: "Admin Operacional",
};

function AdministratorsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const admins = useQuery({
    queryKey: ["admin-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_roles")
        .select("id, role, user_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = Array.from(new Set((data ?? []).map((r) => r.user_id)));
      const profs = ids.length
        ? (await supabase.from("profiles").select("id, full_name, email").in("id", ids)).data ?? []
        : [];
      const map = new Map(profs.map((p) => [p.id, p]));
      return (data ?? []).map((r) => ({ ...r, profile: map.get(r.user_id) ?? null }));
    },
  });

  const invites = useQuery({
    queryKey: ["admin-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_invitations")
        .select("id, email, role, status, token, expires_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({ email: "", role: "admin_suporte" as AdminRole });
  const create = useMutation({
    mutationFn: async () => {
      if (!form.email) throw new Error("Informe o e-mail");
      const { error } = await supabase.from("admin_invitations").insert({
        email: form.email.toLowerCase(),
        role: form.role,
      });
      if (error) throw error;
      await logAudit("admin_invitation.created", { metadata: { email: form.email, role: form.role } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invites"] });
      toast.success("Convite criado. Copie o link e envie ao destinatário.");
      setOpen(false);
      setForm({ email: "", role: "admin_suporte" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_invitations").update({ status: "revoked" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-invites"] }),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_roles").delete().eq("id", id);
      if (error) throw error;
      await logAudit("admin_role.removed", { entity_id: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-list"] });
      toast.success("Papel removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyLink = (token: string) => {
    const link = `${origin}/accept-admin/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Administradores</h1>
          <p className="text-sm text-muted-foreground">Quem tem acesso ao painel da plataforma</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Novo administrador</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Convidar administrador</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div>
                <Label>Função</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin_financeiro">Admin Financeiro</SelectItem>
                    <SelectItem value="admin_suporte">Admin Suporte</SelectItem>
                    <SelectItem value="admin_operacional">Admin Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending}>Gerar convite</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Administradores ativos</h2>
        <div className="space-y-2">
          {admins.isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
          {!admins.isLoading && (admins.data ?? []).length === 0 && <div className="text-sm text-muted-foreground">Nenhum administrador.</div>}
          {(admins.data ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
              <div>
                <div className="text-sm font-medium">{a.profile?.full_name ?? a.profile?.email ?? "Usuário"}</div>
                <div className="text-xs text-muted-foreground">{a.profile?.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{roleLabel[a.role]}</Badge>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remover este papel?")) removeRole.mutate(a.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Convites</h2>
        <div className="space-y-2">
          {(invites.data ?? []).length === 0 && <div className="text-sm text-muted-foreground">Nenhum convite emitido.</div>}
          {(invites.data ?? []).map((i: { id: string; email: string; role: AdminRole; status: string; token: string; expires_at: string }) => (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
              <div>
                <div className="text-sm font-medium">{i.email}</div>
                <div className="text-xs text-muted-foreground">{roleLabel[i.role]} • expira {new Date(i.expires_at).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={i.status === "pending" ? "default" : "outline"}>{i.status}</Badge>
                {i.status === "pending" && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => copyLink(i.token)} title="Copiar link"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => revoke.mutate(i.id)}>Revogar</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
