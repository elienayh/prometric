import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({ meta: [{ title: "Equipe — ProMetric" }] }),
  component: TeamPage,
});

type Role = "admin" | "evaluator" | "viewer";
const ROLE_LABEL: Record<Role, string> = { admin: "Administrador", evaluator: "Avaliador", viewer: "Visualizador" };

type Contact = { id: string; full_name: string; email: string | null; phone: string | null; role: Role; notes: string | null };

function TeamPage() {
  const { tenantId, role: myRole } = useCurrentTenant();
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Contact | "new" | null>(null);
  const isAdmin = myRole === "admin";

  const list = useQuery({
    queryKey: ["team-contacts", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (k: string, v: string) => { order: (c: string) => Promise<{ data: Contact[] | null; error: Error | null }> } } } })
        .from("team_contacts").select("id,full_name,email,phone,role,notes").eq("tenant_id", tenantId!).order("full_name");
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as unknown as { from: (t: string) => { delete: () => { eq: (k: string, v: string) => Promise<{ error: Error | null }> } } }).from("team_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Membro removido"); qc.invalidateQueries({ queryKey: ["team-contacts"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        description="Cadastro manual de membros da equipe (nome, e-mail, telefone, função)."
        action={
          isAdmin && (
            <Button onClick={() => setEdit("new")} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              <UserPlus className="mr-1.5 h-4 w-4" /> Novo membro
            </Button>
          )
        }
      />

      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : !list.data?.length ? (
        <EmptyState
          title="Sem membros cadastrados"
          description={isAdmin ? "Cadastre manualmente os membros da sua equipe." : "Aguardando administrador cadastrar membros."}
          actionLabel={isAdmin ? "Adicionar membro" : undefined}
          onAction={isAdmin ? () => setEdit("new") : undefined}
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-2 md:hidden">
            {list.data.map((m) => (
              <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{m.full_name}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.email ?? "—"}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{ROLE_LABEL[m.role]}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{m.phone ?? "—"}</div>
                {isAdmin && (
                  <div className="mt-3 flex justify-end gap-1 border-t border-border/40 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setEdit(m)} aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover este membro?")) del.mutate(m.id); }} className="text-destructive" aria-label="Remover"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Função</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {list.data.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium">{m.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                        {ROLE_LABEL[m.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover este membro?")) del.mutate(m.id); }} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-[11px] text-muted-foreground">
        💡 O envio automático de convites por e-mail e o vínculo com contas de login serão liberados em fase futura.
      </p>

      {edit && (
        <ContactDialog tenantId={tenantId} contact={edit === "new" ? null : edit} onClose={() => setEdit(null)} />
      )}
    </div>
  );
}

function ContactDialog({ tenantId, contact, onClose }: { tenantId: string | null; contact: Contact | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(contact?.full_name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [role, setRole] = useState<Role>(contact?.role ?? "evaluator");

  const save = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant");
      const payload = { full_name: fullName, email: email || null, phone: phone || null, role };
      const db = supabase as unknown as {
        from: (t: string) => {
          insert: (r: unknown[]) => Promise<{ error: Error | null }>;
          update: (r: unknown) => { eq: (k: string, v: string) => Promise<{ error: Error | null }> };
        };
      };
      if (contact) {
        const { error } = await db.from("team_contacts").update(payload).eq("id", contact.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("team_contacts").insert([{ ...payload, tenant_id: tenantId }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(contact ? "Membro atualizado" : "Membro cadastrado");
      qc.invalidateQueries({ queryKey: ["team-contacts"] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <Dialog open onOpenChange={(b) => !b && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{contact ? "Editar membro" : "Novo membro"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Nome*</Label><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colega@escola.com" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Função*</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="evaluator">Avaliador</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
