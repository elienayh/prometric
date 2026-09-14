import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accept-admin/$token")({ component: AdminInvitePage });

function AdminInvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "needs_auth" | "ready" | "accepting" | "done" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [invite, setInvite] = useState<{ email: string; role: string; status: string; expires_at: string } | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setAuthed(!!u.user);
      const { data, error } = await supabase
        .from("admin_invitations")
        .select("email, role, status, expires_at")
        .eq("token", token)
        .maybeSingle();
      if (error || !data) { setState("error"); setError("Convite não encontrado"); return; }
      setInvite(data);
      if (data.status !== "pending") { setState("error"); setError(`Convite ${data.status}`); return; }
      if (new Date(data.expires_at) < new Date()) { setState("error"); setError("Convite expirado"); return; }
      setState(u.user ? "ready" : "needs_auth");
    })();
  }, [token]);

  const accept = async () => {
    setState("accepting");
    const { data, error } = await supabase.rpc("accept_admin_invitation", { _token: token });
    if (error) { setError(error.message); setState("error"); toast.error(error.message); return; }
    toast.success(`Acesso concedido como ${data}`);
    setState("done");
    setTimeout(() => navigate({ to: "/admin/dashboard" }), 1200);
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero shadow-glow">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Convite de administrador</h1>

        {state === "loading" && <p className="mt-4 text-sm text-muted-foreground"><Loader2 className="inline h-4 w-4 animate-spin" /> Validando...</p>}

        {state === "error" && (
          <>
            <p className="mt-4 text-sm text-destructive">{error}</p>
            <Link to="/"><Button variant="outline" className="mt-4">Voltar</Button></Link>
          </>
        )}

        {invite && (state === "needs_auth" || state === "ready" || state === "accepting") && (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              Você foi convidado(a) como <strong className="text-foreground">{invite.role}</strong> da plataforma ProMetric.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Convite para: {invite.email}</p>

            {state === "needs_auth" && (
              <>
                <p className="mt-4 text-sm">Faça login com {invite.email} para aceitar.</p>
                <Link to="/auth" search={{ redirect: `/accept-admin/${token}` } as never}>
                  <Button className="mt-4 w-full">Entrar</Button>
                </Link>
              </>
            )}
            {state === "ready" && authed && (
              <Button className="mt-6 w-full" onClick={accept}>Aceitar convite</Button>
            )}
            {state === "accepting" && (
              <Button className="mt-6 w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aceitando...</Button>
            )}
          </>
        )}

        {state === "done" && <p className="mt-4 text-sm text-success">Pronto! Redirecionando...</p>}
      </Card>
    </div>
  );
}
