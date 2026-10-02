import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  ssr: false,
  head: () => ({ meta: [{ title: "Redefinir senha — ProMetric" }] }),
  component: ResetPasswordPage,
});

type PageState = "validating" | "ready" | "error" | "success";

function cleanUrl() {
  if (typeof window === "undefined") return;
  try {
    const pathname = window.location.pathname;
    window.history.replaceState({}, document.title, pathname);
  } catch {
    /* ignore */
  }
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>("validating");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    async function initRecovery() {
      try {
        if (typeof window === "undefined") return;

        // 1. Extrair parâmetros tanto da query string quanto do hash fragment
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : "";
        const hashParams = new URLSearchParams(hash);

        const code = urlParams.get("code");
        const rawError = urlParams.get("error") || hashParams.get("error");
        const rawErrorCode = urlParams.get("error_code") || hashParams.get("error_code");
        const rawErrorDesc = urlParams.get("error_description") || hashParams.get("error_description");

        const hashAccessToken = hashParams.get("access_token");
        const hashRefreshToken = hashParams.get("refresh_token");

        // 2. Se o Supabase retornou erro explícito (ex: link expirado ou acesso negado)
        if (rawError || rawErrorDesc) {
          let friendly = "O link de recuperação é inválido ou expirou.";
          if (rawErrorCode === "otp_expired" || (rawErrorDesc && rawErrorDesc.toLowerCase().includes("expired"))) {
            friendly = "Este link de recuperação expirou. Por segurança, os links têm validade limitada.";
          } else if (rawErrorDesc) {
            friendly = decodeURIComponent(rawErrorDesc.replace(/\+/g, " "));
          }
          if (isMounted) {
            setErrorMessage(friendly);
            setState("error");
          }
          return;
        }

        // 3. Se houver código de autenticação PKCE (?code=...)
        if (code) {
          console.info("[ProMetric Auth] Processando código de recuperação (PKCE)...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.warn("[ProMetric Auth] Erro ao trocar código por sessão:", error.message);
            // Verifica se a sessão já foi estabelecida internamente pelo cliente Supabase
            const { data: sessionCheck } = await supabase.auth.getSession();
            if (sessionCheck.session) {
              if (isMounted) {
                cleanUrl();
                setState("ready");
              }
              return;
            }

            let msg = "Código de recuperação inválido ou expirado.";
            if (error.message.toLowerCase().includes("expired")) {
              msg = "Este link de recuperação já expirou. Por favor, solicite um novo.";
            } else if (error.message.toLowerCase().includes("code verifier")) {
              msg = "A verificação de segurança não foi encontrada neste navegador. Tente abrir o link no mesmo navegador onde solicitou a redefinição ou peça um novo link.";
            }
            if (isMounted) {
              setErrorMessage(msg);
              setState("error");
            }
            return;
          }

          if (data.session && isMounted) {
            cleanUrl();
            setState("ready");
            return;
          }
        }

        // 4. Se houver tokens no hash (#access_token=...&refresh_token=...)
        if (hashAccessToken && hashRefreshToken) {
          console.info("[ProMetric Auth] Processando tokens no hash fragment...");
          const { data, error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken,
          });

          if (!error && data.session && isMounted) {
            cleanUrl();
            setState("ready");
            return;
          }
        }

        // 5. Verificar sessão já existente
        const { data: existingSession } = await supabase.auth.getSession();
        if (existingSession.session && isMounted) {
          setState("ready");
          return;
        }

        // 6. Listener para eventos de autenticação
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
            if (isMounted) {
              cleanUrl();
              setState("ready");
              setErrorMessage(null);
            }
          }
        });
        authListener = sub;

        // 7. Timeout de segurança: 4 segundos para validar
        timeoutTimer = setTimeout(async () => {
          if (!isMounted) return;
          const { data: check } = await supabase.auth.getSession();
          if (check.session) {
            setState("ready");
          } else {
            setState("error");
            setErrorMessage("Não foi possível validar o link de recuperação. Ele pode ter expirado ou já ter sido utilizado.");
          }
        }, 4000);

      } catch (err) {
        console.error("[ProMetric Auth] Erro inesperado na validação de recuperação:", err);
        if (isMounted) {
          setState("error");
          setErrorMessage(err instanceof Error ? err.message : "Erro ao validar o link de recuperação.");
        }
      }
    }

    initRecovery();

    return () => {
      isMounted = false;
      if (authListener) authListener.subscription.unsubscribe();
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, []);

  // Efeito para contagem regressiva após sucesso
  useEffect(() => {
    if (state !== "success") return;
    if (countdown <= 0) {
      redirectUser();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  async function redirectUser() {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data: roles } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", u.user.id)
          .limit(1);

        if (roles && roles.length > 0) {
          navigate({ to: "/admin" });
          return;
        }
      }
    } catch {
      /* ignore */
    }
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas digitadas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Senha redefinida com sucesso!");
      setState("success");
    } catch (err) {
      console.error("[ProMetric Auth] Erro ao atualizar senha:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-pop">
        <div className="flex items-center gap-2.5 text-primary">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">ProMetric</span>
        </div>

        {state === "validating" && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h2 className="mt-4 font-display text-xl font-bold">Validando link de recuperação...</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Aguarde enquanto verificamos a autenticidade do seu link de acesso.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Link inválido ou expirado</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage || "Não foi possível validar este link. Solicite uma nova recuperação de senha."}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                onClick={() => navigate({ to: "/login" })}
                className="h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
              >
                Solicitar novo link no Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/login" })}
                className="h-11 w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
              </Button>
            </div>
          </div>
        )}

        {state === "ready" && (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold">Criar nova senha</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina sua nova senha para acessar sua conta no ProMetric.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    minLength={6}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita sua nova senha"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
                Dica: Escolha uma senha segura com pelo menos 6 caracteres combinando letras e números.
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          </div>
        )}

        {state === "success" && (
          <div className="mt-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Senha alterada com sucesso!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua senha foi redefinida com segurança. Redirecionando para o seu painel em {countdown} segundo{countdown !== 1 ? "s" : ""}...
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                onClick={redirectUser}
                className="h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
              >
                Acessar Painel Agora
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/login" });
                }}
                className="h-11 w-full"
              >
                Fazer Login Novamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

