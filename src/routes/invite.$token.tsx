import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck, Building2, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrometricIcon } from "@/components/brand/prometric-logo";
import { getInviteDetails, acceptTeamInvite } from "@/lib/team-invitations.functions";

export const Route = createFileRoute("/invite/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Convite para Equipe — ProMetric" }] }),
  component: AcceptInvitePage,
});

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador(a)",
  evaluator: "Avaliador(a) / Professor(a)",
  viewer: "Visualizador(a)",
};

function AcceptInvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Estado de autenticação atual
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Modo de formulário para quem não está logado: "signup" ou "signin"
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Carregar detalhes do convite via Server Function (bypassa RLS com segurança)
  const inviteQuery = useQuery({
    queryKey: ["invite-details", token],
    queryFn: async () => {
      const res = await getInviteDetails({ data: { token } });
      return res;
    },
    staleTime: 60 * 1000,
  });

  // 2. Verificar sessão do usuário no navegador e tratar fragmentos de link de e-mail (#access_token ou ?code)
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        // Se houver hash de autenticação na URL (vindo do link de e-mail do Supabase)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionErr) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }

        const { data } = await supabase.auth.getUser();
        if (mounted) {
          setCurrentUser(data.user || null);
        }
      } catch (err) {
        console.warn("[InvitePage] Erro ao checar usuário:", err);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    }

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setCurrentUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Quando o convite carregar, pré-preencher o e-mail no formulário
  useEffect(() => {
    if (inviteQuery.data?.email && !emailInput) {
      setEmailInput(inviteQuery.data.email);
    }
  }, [inviteQuery.data?.email, emailInput]);

  // 3. Mutação para aceitar convite (usuário já logado)
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await acceptTeamInvite({ data: { token } });
      return res;
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Convite aceito com sucesso!");
      // Invalidar caches de tenant e perfil
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["current-tenant"] }),
        qc.invalidateQueries({ queryKey: ["my-memberships"] }),
        qc.invalidateQueries({ queryKey: ["profile"] }),
        qc.invalidateQueries({ queryKey: ["team-contacts"] }),
        qc.invalidateQueries({ queryKey: ["team-members"] }),
      ]);
      // Redireciona diretamente para o dashboard do tenant convidado
      navigate({ to: "/dashboard" });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao aceitar convite");
    },
  });

  // 4. Fluxo para quem não tem conta e está criando agora
  async function handleSignUpAndAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteQuery.data) return;

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetEmail = (inviteQuery.data.email || emailInput).trim().toLowerCase();

      // Criar usuário no Supabase Auth
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: targetEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (signUpErr) throw signUpErr;

      // Se a sessão foi iniciada imediatamente (sem confirmação de e-mail exigida)
      if (signUpData.session) {
        // Aceitar o convite diretamente
        const acceptRes = await acceptTeamInvite({ data: { token } });
        toast.success(acceptRes.message || "Conta criada e convite aceito!");
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["current-tenant"] }),
          qc.invalidateQueries({ queryKey: ["my-memberships"] }),
          qc.invalidateQueries({ queryKey: ["profile"] }),
        ]);
        navigate({ to: "/dashboard" });
        return;
      }

      // Se exigiu login com a senha recém criada
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (!signInErr) {
        const acceptRes = await acceptTeamInvite({ data: { token } });
        toast.success(acceptRes.message || "Conta criada e convite aceito!");
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["current-tenant"] }),
          qc.invalidateQueries({ queryKey: ["my-memberships"] }),
          qc.invalidateQueries({ queryKey: ["profile"] }),
        ]);
        navigate({ to: "/dashboard" });
        return;
      }

      // Caso tenha confirmação por e-mail obrigatória
      toast.success("Conta criada! Verifique sua caixa de entrada para confirmar o e-mail ou faça login.");
      setAuthMode("signin");
    } catch (err: any) {
      console.error("[SignUpAndAccept] Erro:", err);
      toast.error(err?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 5. Fluxo para quem já tem conta e está fazendo login nesta tela
  async function handleSignInAndAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteQuery.data) return;

    setIsSubmitting(true);
    try {
      const targetEmail = (inviteQuery.data.email || emailInput).trim().toLowerCase();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (signInErr) throw signInErr;

      const acceptRes = await acceptTeamInvite({ data: { token } });
      toast.success(acceptRes.message || "Login realizado e convite aceito!");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["current-tenant"] }),
        qc.invalidateQueries({ queryKey: ["my-memberships"] }),
        qc.invalidateQueries({ queryKey: ["profile"] }),
      ]);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("[SignInAndAccept] Erro:", err);
      const msg = err?.message || "Erro ao entrar";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Login com Google direcionando de volta para este convite
  async function handleGoogleLogin() {
    setIsSubmitting(true);
    try {
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/invite/${token}`
        : `/invite/${token}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast.error("Erro ao autenticar com Google: " + (err?.message || "Tente novamente."));
      setIsSubmitting(false);
    }
  }

  // Estados de carregamento
  if (inviteQuery.isLoading || checkingAuth) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validando convite de equipe...</p>
        </div>
      </div>
    );
  }

  // Se o convite não foi encontrado
  if (!inviteQuery.data || !inviteQuery.data.found) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-pop">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Convite não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {inviteQuery.data?.message || "Este link de convite é inválido ou não existe mais."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className="w-full bg-gradient-brand text-primary-foreground">
              <Link to="/auth">Ir para a tela de login</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { tenant, role, email: inviteEmail, isExpired, isAccepted, status } = inviteQuery.data;
  const tenantName = tenant?.displayName || tenant?.name || "esta organização";
  const roleName = ROLE_LABELS[role || "evaluator"] || "Membro";

  // Se o convite já foi utilizado ou expirou
  if (isExpired || status === "revoked") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-pop">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Convite expirado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este convite para <strong>{tenantName}</strong> expirou. Solicite um novo link ao administrador da escola.
          </p>
          <Button asChild className="mt-6 w-full" variant="outline">
            <Link to="/auth">Fazer login no ProMetric</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-pop">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Convite já utilizado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este convite para a equipe de <strong>{tenantName}</strong> já foi aceito.
          </p>
          <Button asChild className="mt-6 w-full bg-gradient-brand text-primary-foreground shadow-glow">
            <Link to="/dashboard">Acessar meu Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-background p-6 flex flex-col justify-center items-center">
      {/* Mesh background suave */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-mesh opacity-70" aria-hidden />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card/95 p-8 shadow-pop backdrop-blur-xl">
        {/* Cabeçalho do convite */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-soft">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MailCheck className="h-3.5 w-3.5" /> Convite de Equipe
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
            Você foi convidado(a) para <span className="text-gradient-brand">{tenantName}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça parte da equipe com o perfil de <strong>{roleName}</strong>.
          </p>
        </div>

        <div className="my-6 rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>E-mail do convite:</span>
            <strong className="text-foreground">{inviteEmail}</strong>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Função atribuída:</span>
            <span className="rounded-md bg-background px-2 py-0.5 font-medium text-foreground">{roleName}</span>
          </div>
        </div>

        {/* CENÁRIO 1: USUÁRIO JÁ ESTÁ CONECTADO */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
              <UserCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                Conectado como <strong>{currentUser.email}</strong>.
                {currentUser.email?.toLowerCase() !== inviteEmail?.toLowerCase() && (
                  <p className="mt-1 text-[11px] opacity-90">
                    Nota: O e-mail da sua sessão ({currentUser.email}) é diferente do endereço convidado ({inviteEmail}), mas você pode aceitar mesmo assim.
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="w-full h-11 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 font-medium"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando na equipe...
                </>
              ) : (
                <>
                  Aceitar convite e entrar em {tenantName}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                setCurrentUser(null);
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Entrar com outra conta
            </Button>
          </div>
        ) : (
          /* CENÁRIO 2: USUÁRIO NÃO ESTÁ CONECTADO */
          <div className="space-y-5">
            {/* Seletor de abas: Criar Conta vs Fazer Login */}
            <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`rounded-lg py-2 transition-colors ${authMode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Criar minha conta
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`rounded-lg py-2 transition-colors ${authMode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Já tenho conta
              </button>
            </div>

            {authMode === "signup" ? (
              <form onSubmit={handleSignUpAndAccept} className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs">Seu nome completo</Label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prof. Exemplo"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={isSubmitting || !!inviteEmail}
                    className={inviteEmail ? "bg-muted/50 cursor-not-allowed" : ""}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Crie sua senha</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Confirme sua senha</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta e vinculando...
                    </>
                  ) : (
                    <>
                      Criar conta e entrar na equipe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignInAndAccept} className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Senha</Label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando e aceitando convite...
                    </>
                  ) : (
                    <>
                      Entrar e aceitar convite
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="relative my-2 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">ou</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full h-10 gap-2 text-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar com Google
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
