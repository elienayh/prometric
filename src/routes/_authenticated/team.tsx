import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Check,
  Copy,
  Mail,
  MailCheck,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { useIsPlatformAdmin } from "@/hooks/use-admin";
import { useImpersonation } from "@/hooks/use-impersonation";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import {
  createTeamInvite,
  listTeamMembersAndInvites,
  revokeTeamInvite,
  removeTeamMember,
  updateTeamMemberRole,
  type TeamMemberInfo,
  type PendingInviteInfo,
  type InviteResult,
} from "@/lib/team-invitations.functions";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({ meta: [{ title: "Equipe e Convites — ProMetric" }] }),
  component: TeamPage,
});

type Role = "admin" | "evaluator" | "viewer";
const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador(a)",
  evaluator: "Avaliador(a)",
  viewer: "Visualizador(a)",
};

const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: "Acesso total à gestão, convites, configurações e relatórios.",
  evaluator: "Pode realizar avaliações em campo e consultar turmas e alunos.",
  viewer: "Apenas visualização de turmas, relatórios e dashboards.",
};

function TeamPage() {
  const { tenantId, tenant, role: myRole } = useCurrentTenant();
  const { isAdmin: isPlatformAdmin } = useIsPlatformAdmin();
  const impersonation = useImpersonation();
  const qc = useQueryClient();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [successInvite, setSuccessInvite] = useState<InviteResult | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMemberInfo | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Carregar membros ativos e convites pendentes via Server Function segura
  const teamQuery = useQuery({
    queryKey: ["team-members-invites", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      return await listTeamMembersAndInvites({
        data: {
          tenantId: tenantId!,
          origin,
        },
      });
    },
  });

  const isAdmin =
    myRole === "admin" ||
    !!teamQuery.data?.canAdmin ||
    isPlatformAdmin ||
    !!impersonation;

  // Mutação para revogar convite
  const revokeMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      if (!tenantId) return;
      await revokeTeamInvite({ data: { tenantId, inviteId } });
    },
    onSuccess: () => {
      toast.success("Convite revogado.");
      qc.invalidateQueries({ queryKey: ["team-members-invites", tenantId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao revogar convite");
    },
  });

  // Mutação para remover membro
  const removeMemberMutation = useMutation({
    mutationFn: async (memberUserId: string) => {
      if (!tenantId) return;
      await removeTeamMember({ data: { tenantId, memberUserId } });
    },
    onSuccess: () => {
      toast.success("Membro removido da equipe.");
      qc.invalidateQueries({ queryKey: ["team-members-invites", tenantId] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao remover membro");
    },
  });

  // Mutação para alterar função do membro
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberUserId, newRole }: { memberUserId: string; newRole: Role }) => {
      if (!tenantId) return;
      await updateTeamMemberRole({ data: { tenantId, memberUserId, role: newRole } });
    },
    onSuccess: () => {
      toast.success("Função atualizada.");
      setEditingMember(null);
      qc.invalidateQueries({ queryKey: ["team-members-invites", tenantId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar função");
    },
  });

  function copyInviteLink(link: string, id: string) {
    navigator.clipboard.writeText(link);
    setCopiedToken(id);
    toast.success("Link de convite copiado para a área de transferência!");
    setTimeout(() => setCopiedToken(null), 3000);
  }

  const members = teamQuery.data?.members || [];
  const invites = teamQuery.data?.invites || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Equipe — ${tenant?.display_name || tenant?.name || "Organização"}`}
        description="Gerencie os professores, avaliadores e administradores que compartilham este ambiente de trabalho."
        action={
          isAdmin && (
            <Button
              onClick={() => {
                setSuccessInvite(null);
                setInviteModalOpen(true);
              }}
              className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 font-medium"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Convidar Membro
            </Button>
          )
        }
      />

      {teamQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Carregando equipe...
        </div>
      ) : (
        <>
          {/* SEÇÃO 1: MEMBROS ATIVOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Membros Ativos
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({members.length})
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pessoas que já possuem acesso ativo às turmas, alunos e avaliações deste tenant.
                </p>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Nenhum membro encontrado.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="divide-y divide-border">
                  {members.map((m) => {
                    const initials = (m.fullName?.[0] || m.email?.[0] || "U").toUpperCase();
                    return (
                      <div
                        key={m.userId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-muted/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground shadow-sm">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{m.fullName}</span>
                              {m.isSelf && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {m.email || "Sem e-mail"}
                              {m.phone && <span className="ml-2 opacity-80">• {m.phone}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              m.role === "admin"
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : m.role === "evaluator"
                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {ROLE_LABEL[m.role]}
                          </span>

                          {isAdmin && !m.isSelf && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMember(m)}
                                title="Alterar função"
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Tem certeza que deseja remover ${m.fullName} da equipe deste tenant?`
                                    )
                                  ) {
                                    removeMemberMutation.mutate(m.userId);
                                  }
                                }}
                                title="Remover da equipe"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: CONVITES PENDENTES */}
          {isAdmin && (
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display tracking-tight flex items-center gap-2">
                    <Mail className="h-5 w-5 text-amber-500" /> Convites Pendentes
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({invites.length})
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pessoas convidadas que ainda não aceitaram o link ou não finalizaram o primeiro acesso.
                  </p>
                </div>
              </div>

              {invites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Nenhum convite pendente no momento. Quando você convidar um professor ou coordenador, ele aparecerá aqui com o link direto de acesso.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft divide-y divide-border">
                  {invites.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-3 transition-colors hover:bg-muted/15"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{inv.email}</span>
                          <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[11px] font-medium border border-amber-500/20">
                            {ROLE_LABEL[inv.role]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>
                            Enviado em {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          <span>•</span>
                          <span>
                            Expira em {new Date(inv.expiresAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(inv.inviteLink, inv.id)}
                          className="h-8 gap-1.5 text-xs"
                        >
                          {copiedToken === inv.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copiar link
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Revogar convite para ${inv.email}?`)) {
                              revokeMutation.mutate(inv.id);
                            }
                          }}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Revogar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* DIÁLOGO: CONVIDAR NOVO MEMBRO */}
      <InviteMemberDialog
        open={inviteModalOpen}
        tenantId={tenantId}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={(result) => {
          setSuccessInvite(result);
          qc.invalidateQueries({ queryKey: ["team-members-invites", tenantId] });
        }}
      />

      {/* DIÁLOGO: SUCESSO DO CONVITE (COM LINK PARA COPIAR) */}
      {successInvite && (
        <Dialog open onOpenChange={(open) => !open && setSuccessInvite(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center font-display text-xl">
                {successInvite.isExistingUser ? "Membro Vinculado!" : "Convite Criado com Sucesso!"}
              </DialogTitle>
              <DialogDescription className="text-center text-xs">
                {successInvite.message}
              </DialogDescription>
            </DialogHeader>

            {!successInvite.isExistingUser && (
              <div className="space-y-3 pt-2">
                <Label className="text-xs text-muted-foreground">
                  Link direto de convite (compartilhe pelo WhatsApp ou e-mail):
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={successInvite.inviteLink}
                    className="font-mono text-xs bg-muted/50 select-all"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(successInvite.inviteLink);
                      toast.success("Link de convite copiado!");
                    }}
                    className="shrink-0 gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  💡 Ao acessar este link, a pessoa entrará diretamente na equipe de{" "}
                  <strong>{tenant?.display_name || tenant?.name}</strong>, sem precisar criar uma nova organização.
                </p>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                onClick={() => setSuccessInvite(null)}
                className="w-full bg-gradient-brand text-primary-foreground font-medium"
              >
                Concluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DIÁLOGO: EDITAR FUNÇÃO DO MEMBRO */}
      {editingMember && (
        <EditRoleDialog
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={(newRole) => {
            updateRoleMutation.mutate({ memberUserId: editingMember.userId, newRole });
          }}
          isPending={updateRoleMutation.isPending}
        />
      )}
    </div>
  );
}

function InviteMemberDialog({
  open,
  tenantId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  tenantId: string | null;
  onClose: () => void;
  onSuccess: (res: InviteResult) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("evaluator");

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Tenant não identificado");
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      return await createTeamInvite({
        data: {
          tenantId,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          role,
          origin,
        },
      });
    },
    onSuccess: (data) => {
      onSuccess(data);
      onClose();
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("evaluator");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar convite");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Convidar Membro para a Equipe</DialogTitle>
          <DialogDescription className="text-xs">
            Envie um convite para outros professores, coordenadores ou avaliadores participarem do mesmo ambiente de trabalho.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Nome Completo*</Label>
            <Input
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex.: Prof. Carlos Eduardo"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">E-mail de Acesso*</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@escola.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Telefone / WhatsApp (opcional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Função no Sistema*</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evaluator">
                  <div className="text-left py-0.5">
                    <div className="font-medium text-xs">Avaliador(a) / Professor(a)</div>
                    <div className="text-[10px] text-muted-foreground">Realiza testes físicos e consulta turmas</div>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="text-left py-0.5">
                    <div className="font-medium text-xs">Administrador(a) / Coordenação</div>
                    <div className="text-[10px] text-muted-foreground">Gestão total, convites e relatórios executivos</div>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="text-left py-0.5">
                    <div className="font-medium text-xs">Visualizador(a)</div>
                    <div className="text-[10px] text-muted-foreground">Apenas consulta relatórios e dashboards</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              {ROLE_DESCRIPTION[role]}
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={inviteMutation.isPending || !email.trim() || fullName.trim().length < 2}
              className="bg-gradient-brand text-primary-foreground font-medium shadow-glow"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando convite...
                </>
              ) : (
                "Gerar Convite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditRoleDialog({
  member,
  onClose,
  onSave,
  isPending,
}: {
  member: TeamMemberInfo;
  onClose: () => void;
  onSave: (role: Role) => void;
  isPending: boolean;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Alterar Função do Membro</DialogTitle>
          <DialogDescription className="text-xs">
            Altere as permissões de <strong>{member.fullName}</strong> nesta organização.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Função</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evaluator">Avaliador(a) / Professor(a)</SelectItem>
                <SelectItem value="admin">Administrador(a) / Coordenação</SelectItem>
                <SelectItem value="viewer">Visualizador(a)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => onSave(role)}
              disabled={isPending || role === member.role}
              className="bg-gradient-brand text-primary-foreground font-medium"
            >
              {isPending ? "Salvando..." : "Salvar Alteração"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
