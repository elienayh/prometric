import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });
type AuthMode = "signin" | "signup";
const accountTypes = [
  { value: "teacher", label: "Professor" },
  { value: "school", label: "Escola" },
  { value: "gym", label: "Academia" },
  { value: "club", label: "Clube" },
] as const;

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Entrar — ProMetric" }] }),
  component: AuthLayout,
});

function AuthLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = Route.useSearch();
  if (pathname === "/auth" || pathname === "/auth/") {
    return <AuthScreen initialMode={search.mode === "signup" ? "signup" : "signin"} />;
  }

  return <Outlet />;
}

export function AuthScreen({ initialMode = "signin" }: { initialMode?: AuthMode }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<(typeof accountTypes)[number]["value"]>("teacher");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast.success("Enviamos um link de redefinição para seu e-mail.");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar link");
    } finally {
      setForgotLoading(false);
    }
  }

  async function redirectAfterAuth() {
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
      /* fall through */
    }
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          toast.error("As senhas não conferem");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, account_type: accountType },
            emailRedirectTo: window.location.origin + "/dashboard",
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Vamos começar 👋");
        await redirectAfterAuth();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Que bom te ver de novo!");
        await redirectAfterAuth();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos" : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) {
        toast.error("Não foi possível entrar com Google: " + error.message);
        setGoogleLoading(false);
        return;
      }
    } catch {
      toast.error("Erro inesperado no login com Google");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-80" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-6 lg:flex-row">
        <div className="flex-1 lg:pr-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="hidden h-full flex-col justify-center lg:flex">
            <div className="mb-5 inline-flex items-center gap-2.5">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-hero shadow-glow">
                <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-bold">
                Pro<span className="text-gradient-brand">Metric</span>
              </span>
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
              A avaliação física <br /> que <span className="text-gradient-brand">cabe na sua aula</span>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Método ProMetric® completo no celular, relatórios em PDF e diagnósticos por IA. Sua próxima turma pode ser avaliada hoje.
            </p>
            <ul className="mt-8 space-y-2.5 text-sm text-muted-foreground">
              {[
                "Avalie a turma em quadra, sem prancheta",
                "Classificação Método ProMetric® automática por idade e sexo",
                "Relatórios prontos para família, escola e gestão",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary">
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                    </svg>
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 w-full max-w-md lg:mt-0 lg:flex lg:items-center"
        >
          <div className="w-full rounded-3xl border border-border/80 bg-card/85 p-8 shadow-pop backdrop-blur-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {mode === "signin" ? "Entrar no ProMetric" : "Criar sua conta grátis"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? "Acesse seu painel e suas turmas" : "Até 50 alunos grátis, sem cartão. Cancele quando quiser."}
            </p>

            <Button
              onClick={handleGoogle}
              disabled={googleLoading}
              variant="outline"
              className="mt-6 h-11 w-full"
              type="button"
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Continuar com Google
            </Button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> ou e-mail <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Seu nome" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="account-type">Tipo</Label>
                    <Select value={accountType} onValueChange={(value) => setAccountType(value as typeof accountType)}>
                      <SelectTrigger id="account-type" className="h-11">
                        <SelectValue placeholder="Selecione o tipo de conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@exemplo.com" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="h-11" />
              </div>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="Repita sua senha" className="h-11" />
                </div>
              )}
              <Button type="submit" disabled={loading} className="h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow transition-opacity hover:opacity-90">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Entrar" : "Criar Conta"}
              </Button>
            </form>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                className="mt-4 w-full text-center text-sm font-medium text-primary transition-colors hover:underline"
              >
                Esqueci minha senha
              </button>
            )}

            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Redefinir senha</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <p className="text-sm text-muted-foreground">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email">E-mail</Label>
                    <Input id="forgot-email" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="voce@exemplo.com" />
                  </div>
                  <Button type="submit" disabled={forgotLoading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                    {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar link
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-primary transition-colors hover:underline"
              >
                {mode === "signin" ? "Criar grátis" : "Entrar"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2.1 1.6-4.7 2.6-7.4 2.6-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.4 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3c-.4.4 6.7-4.9 6.7-15 0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
