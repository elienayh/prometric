import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { claimPendingInvitesForUser } from "@/lib/team-invitations.functions";

const callbackSearchSchema = z
  .object({
    code: z.string().optional(),
    error: z.string().optional(),
    error_code: z.string().optional(),
    error_description: z.string().optional(),
    state: z.string().optional(),
    next: z.string().optional(),
  })
  .passthrough();

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  head: () => ({ meta: [{ title: "Autenticando — ProMetric" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Verificar se há erro na query string
        if (search.error || search.error_description) {
          const desc = search.error_description || search.error || "Falha na autenticação.";
          let friendly = desc;
          if (desc.includes("access_denied")) {
            friendly = "O acesso foi cancelado ou negado.";
          }
          if (isMounted) {
            setErrorMessage(friendly);
            setStatus("error");
          }
          return;
        }

        // 2. Verificar fragmento de hash no navegador
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashError = hashParams.get("error_description") || hashParams.get("error");
          if (hashError) {
            if (isMounted) {
              setErrorMessage(hashError);
              setStatus("error");
            }
            return;
          }

          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        }

        // 3. Se houver código PKCE (?code=...), trocar por sessão
        const code = search.code || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("code") : null);
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("[AuthCallback] exchangeCodeForSession:", exchangeError.message);
          }
        }

        // 4. Limpar os parâmetros da barra de endereços
        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // 5. Verificar a sessão autenticada
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
          // Tentar obter via getUser()
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) {
            throw new Error("Não foi possível validar a sessão do usuário.");
          }
        }

        const activeUserId = user?.id || (await supabase.auth.getUser()).data.user?.id;

        if (isMounted) {
          setStatus("success");
        }

        // Reivindica automaticamente convites pendentes caso o usuário tenha sido convidado
        try {
          await claimPendingInvitesForUser();
        } catch (claimErr) {
          console.warn("[AuthCallback] Verificação de convites ignorada:", claimErr);
        }

        // 6. Redirecionar o usuário: se tiver cargo de admin vai para /admin, caso contrário para /dashboard
        let destination = search.next || "/dashboard";
        try {
          if (activeUserId) {
            const { data: roles } = await supabase
              .from("admin_roles")
              .select("role")
              .eq("user_id", activeUserId)
              .limit(1);
            if (roles && roles.length > 0) {
              destination = "/admin";
            }
          }
        } catch (roleErr) {
          console.warn("[AuthCallback] Verificação de admin ignorada:", roleErr);
        }

        // Redirecionar com pequeno delay para fluidez visual
        setTimeout(() => {
          if (isMounted) {
            navigate({ to: destination as any, replace: true });
          }
        }, 500);
      } catch (err: any) {
        console.error("[AuthCallback] Erro no processamento:", err);
        if (isMounted) {
          setErrorMessage(err?.message || "Ocorreu um erro ao processar seu login.");
          setStatus("error");
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/85 p-8 text-center shadow-pop backdrop-blur-xl">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <h2 className="font-display text-xl font-bold">Autenticando...</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Estamos validando seu acesso e preparando seu painel.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Login realizado!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecionando para o seu painel...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Falha na autenticação</h2>
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <div className="mt-4 flex w-full flex-col gap-2">
              <Button onClick={() => navigate({ to: "/login" })} className="w-full">
                Tentar novamente no Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/" })}
                className="w-full"
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
