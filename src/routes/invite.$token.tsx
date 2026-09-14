import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invite/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Convite — ProMetric" }] }),
  component: AcceptInvite,
});

type InviteRow = {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  tenant: { name: string; display_name: string | null } | null;
};

function AcceptInvite() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);

  const invite = useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_invitations")
        .select("id,tenant_id,email,role,status,expires_at,tenant:tenants(name,display_name)")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as InviteRow | null;
    },
  });

  async function handleAccept() {
    if (!invite.data) return;
    setAccepting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        toast.info("Entre na sua conta para aceitar o convite.");
        navigate({ to: "/auth", search: { mode: "signup" } });
        return;
      }
      if (invite.data.email && user.email && invite.data.email.toLowerCase() !== user.email.toLowerCase()) {
        toast.error(`Este convite foi enviado para ${invite.data.email}. Faça login com esse e-mail.`);
        return;
      }
      // Vincula o usuário ao tenant e marca o convite como aceito.
      const { error: memberErr } = await supabase
        .from("tenant_members")
        .insert([{ tenant_id: invite.data.tenant_id, user_id: user.id, role: invite.data.role as "admin" | "evaluator" | "viewer" }]);
      if (memberErr && !memberErr.message.includes("duplicate")) throw memberErr;

      const { error: updateErr } = await supabase
        .from("tenant_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString(), accepted_by: user.id })
        .eq("id", invite.data.id);
      if (updateErr) throw updateErr;

      toast.success("Convite aceito! Bem-vindo à equipe.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aceitar convite");
    } finally {
      setAccepting(false);
    }
  }

  if (invite.isLoading) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Validando convite…</div>;
  }

  if (!invite.data) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-bold">Convite inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">Este link de convite não existe ou já foi utilizado.</p>
          <Button asChild className="mt-6"><Link to="/">Voltar ao início</Link></Button>
        </div>
      </div>
    );
  }

  const expired = new Date(invite.data.expires_at).getTime() < Date.now();
  const used = invite.data.status !== "pending";
  const tenantName = invite.data.tenant?.display_name ?? invite.data.tenant?.name ?? "esta organização";

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-pop">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Convite para {tenantName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você foi convidado(a) para entrar como <strong>{invite.data.role}</strong>.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">E-mail do convite: {invite.data.email}</p>

        {expired ? (
          <p className="mt-6 text-sm text-destructive">Este convite expirou. Solicite um novo ao administrador.</p>
        ) : used ? (
          <p className="mt-6 text-sm text-muted-foreground">Este convite já foi utilizado.</p>
        ) : (
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="mt-6 w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
          >
            {accepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aceitar convite
          </Button>
        )}
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/">Cancelar</Link>
        </Button>
      </div>
    </div>
  );
}
