import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Activity, BarChart3, BookOpen, Building2, Check, ChevronDown, ClipboardList, GraduationCap,
  HeartPulse, LayoutDashboard, LogOut, Menu, Settings, Shield, ShieldAlert, Sparkles, TrendingUp,
  Users, UsersRound, X, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant, useProfile, useSwitchTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { useIsPlatformAdmin } from "@/hooks/use-admin";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { useImpersonation } from "@/hooks/use-impersonation";
import { PrometricIcon } from "@/components/brand/prometric-logo";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; tooltip?: string };
type NavSection = { label: string; items: NavItem[]; adminOnly?: boolean };

const navSections: NavSection[] = [
  {
    label: "Professor",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tooltip: "Visão geral da turma" },
      { to: "/quick-eval", label: "Modo Quadra", icon: Zap, tooltip: "Avaliação rápida em campo" },
      { to: "/students", label: "Alunos", icon: Users, tooltip: "Cadastro e perfil dos alunos" },
      { to: "/evaluations", label: "Avaliações", icon: ClipboardList, tooltip: "Histórico de avaliações" },
      { to: "/classes", label: "Turmas", icon: GraduationCap, tooltip: "Turmas e dashboards por turma" },
      { to: "/groups", label: "Grupos", icon: UsersRound, tooltip: "Grupos esportivos e projetos" },
      { to: "/schools", label: "Escolas", icon: Building2, tooltip: "Escolas e dashboards institucionais" },
      { to: "/reports", label: "Relatórios", icon: BarChart3, tooltip: "Relatórios em PDF e exportações" },
      { to: "/risk", label: "Saúde e Risco", icon: HeartPulse, tooltip: "Mapa de risco e alertas" },
    ],
  },
  {
    label: "Gestão",
    adminOnly: true,
    items: [
      { to: "/team", label: "Equipe", icon: Sparkles, tooltip: "Convites e membros do tenant" },
      { to: "/settings", label: "Configurações", icon: Settings, tooltip: "Branding, plano e preferências" },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { to: "/executive", label: "Dashboard Executivo", icon: TrendingUp, tooltip: "Visão estratégica consolidada" },
      { to: "/knowledge", label: "Central de Conhecimento", icon: BookOpen, tooltip: "Metodologia e referências" },
    ],
  },
];

function useVisibleSections(role?: string | null) {
  const isAdmin = role === "admin";
  return navSections.filter((s) => !s.adminOnly || isAdmin);
}

function useCurrentPageLabel() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const all = navSections.flatMap((s) => s.items);
  const match = [...all].sort((a, b) => b.to.length - a.to.length).find((i) => pathname.startsWith(i.to));
  return match?.label ?? "";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { tenant, role, hasNoTenant, isLoading } = useCurrentTenant();
  const { isAdmin: isPlatformAdmin, isLoading: isAdminLoading } = useIsPlatformAdmin();
  const pageLabel = useCurrentPageLabel();

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Mesh background suave (só fundo, sem interceptar cliques) */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-mesh opacity-60" aria-hidden />

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar/95 backdrop-blur lg:flex lg:flex-col">
        <SidebarContent tenantName={tenant?.name} role={role} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", damping: 24, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar lg:hidden"
            >
              <div className="flex justify-end p-3">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar menu"
                  className="min-h-11 min-w-11"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent tenantName={tenant?.name} role={role} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl lg:px-8">
          <Button
            variant="ghost" size="icon"
            className="min-h-11 min-w-11 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TenantSwitcher />
              {pageLabel && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="truncate text-foreground font-medium">{pageLabel}</span>
                </>
              )}
            </div>
          </div>
          <AdminLink />
          <ThemeToggle className="min-h-10 min-w-10" />
          <UserMenu />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-up">{children}</div>
        </main>
      </div>

      {/* Onboarding obrigatório */}
      {!isLoading && !isAdminLoading && !isPlatformAdmin && hasNoTenant && <OnboardingDialog />}
    </div>
  );
}

function SidebarContent({
  tenantName, role, onNavigate,
}: { tenantName?: string; role?: string | null; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sections = useVisibleSections(role);
  return (
    <>
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 py-5">
        <PrometricIcon className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <div className="font-display text-base font-bold leading-none">
            Pro<span className="text-gradient-brand">Metric</span>
          </div>
          {tenantName && <div className="mt-1 truncate text-[11px] text-sidebar-foreground/60">{tenantName}</div>}
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    title={item.tooltip ?? item.label}
                    aria-label={item.label}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ease-out-soft",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-gradient-brand"
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                      />
                    )}
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-medium text-sidebar-foreground/80">
            {role === "admin" ? "Administrador" : role === "evaluator" ? "Avaliador" : role === "viewer" ? "Visualizador" : "Conectado"}
          </span>
        </div>
      </div>
    </>
  );
}

function TenantSwitcher() {
  const { tenant, tenantId, role, memberships, isLoading } = useCurrentTenant();
  const switchTenant = useSwitchTenant();
  const [open, setOpen] = useState(false);

  const displayName =
    tenant?.display_name || tenant?.name || (isLoading ? "Carregando…" : "ProMetric");

  if (memberships.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate max-w-[180px] sm:max-w-[280px]">{displayName}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="h-7 gap-1.5 px-2 text-xs font-semibold text-foreground hover:bg-muted/60 rounded-lg"
        title="Alternar organização / escola"
      >
        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[240px]">{displayName}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 z-50 mt-1.5 w-72 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-pop"
          >
            <div className="border-b border-border/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suas Escolas / Organizações ({memberships.length})
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {memberships.map((m) => {
                const isActive = m.tenant_id === tenantId;
                const mName = m.tenant?.display_name || m.tenant?.name || "Organização";
                return (
                  <button
                    key={m.tenant_id}
                    onClick={() => {
                      setOpen(false);
                      if (!isActive) switchTenant.mutate(m.tenant_id);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-popover-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate">{mName}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        {m.role === "admin"
                          ? "Administrador(a)"
                          : m.role === "evaluator"
                          ? "Avaliador(a)"
                          : "Visualizador(a)"}
                      </div>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
            {role === "admin" && (
              <div className="border-t border-border/60 p-1">
                <Link
                  to="/team"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Users className="h-3.5 w-3.5" /> Gerenciar equipe e convites
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

function AdminLink() {
  const { isAdmin } = useIsPlatformAdmin();
  if (!isAdmin) return null;
  return (
    <Link to="/admin/dashboard">
      <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex">
        <Shield className="h-3.5 w-3.5" /> Admin
      </Button>
    </Link>
  );
}

function UserMenu() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const profile = useProfile();
  const [open, setOpen] = useState(false);

  const signOut = useMutation({
    mutationFn: async () => {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
    },
    onSuccess: () => router.navigate({ to: "/auth", replace: true }),
  });

  const impersonation = useImpersonation();
  const name = profile.data?.full_name ?? user?.email ?? "Usuário";
  const initial = (name?.[0] ?? "U").toUpperCase();
  const email = user?.email ?? "";

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "min-h-10 gap-2 rounded-full pl-1 pr-2.5",
          impersonation && "ring-2 ring-amber-500/70 ring-offset-2 ring-offset-background",
        )}
        aria-label="Abrir menu do usuário"
      >
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-primary-foreground shadow-soft",
            impersonation ? "bg-amber-500 text-amber-950" : "bg-gradient-brand",
          )}
          title={impersonation ? `Impersonando ${impersonation.tenantName}` : undefined}
        >
          {impersonation ? <ShieldAlert className="h-4 w-4" /> : initial}
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-pop"
          >
            <div className="border-b border-border/60 px-3 py-2.5">
              <div className="truncate text-sm font-semibold text-popover-foreground">{name}</div>
              {email && <div className="truncate text-xs text-muted-foreground">{email}</div>}
            </div>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-accent/40"
            >
              <Settings className="h-4 w-4" /> Configurações
            </Link>
            <button
              onClick={() => { setOpen(false); signOut.mutate(); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-destructive/15 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
