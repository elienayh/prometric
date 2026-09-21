import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft, BarChart3, Building2, ChevronDown, DollarSign, FileText, FlaskConical,
  LayoutDashboard, LifeBuoy, LogOut, Menu, Receipt, Shield, ShieldCheck, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsPlatformAdmin } from "@/hooks/use-admin";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrometricIcon } from "@/components/brand/prometric-logo";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; need?: "super" | "finance" | "support" | "ops" };

const navItems: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard SaaS", icon: LayoutDashboard },
  { to: "/admin/clients", label: "Clientes", icon: Building2 },
  
  { to: "/admin/financial", label: "Financeiro", icon: DollarSign, need: "finance" },
  { to: "/admin/support", label: "Suporte", icon: LifeBuoy, need: "support" },
  { to: "/admin/administrators", label: "Administradores", icon: ShieldCheck, need: "super" },
  { to: "/admin/logs", label: "Logs", icon: FileText },
  { to: "/admin/monitoring", label: "Monitoramento", icon: BarChart3, need: "ops" },
  { to: "/admin/demo", label: "Ambiente Demo", icon: FlaskConical, need: "super" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const perms = useIsPlatformAdmin();
  const items = navItems.filter((i) => {
    if (!i.need) return true;
    if (i.need === "super") return perms.isSuperAdmin;
    if (i.need === "finance") return perms.isFinance;
    if (i.need === "support") return perms.isSupport;
    if (i.need === "ops") return perms.isOps;
    return false;
  });

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="relative z-10 hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar/95 backdrop-blur lg:flex lg:flex-col">
        <SidebarContent items={items} />
      </aside>

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
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar menu" className="min-h-11 min-w-11">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent items={items} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl lg:px-8">
          <Button variant="ghost" size="icon" className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold uppercase tracking-wider text-foreground">Área da Plataforma</span>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao app
            </Button>
          </Link>
          <ThemeToggle className="min-h-10 min-w-10" />
          <UserMenu />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <Link to="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 py-5">
        <PrometricIcon className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <div className="font-display text-base font-bold leading-none">
            Pro<span className="text-gradient-brand">Metric</span>
          </div>
          <div className="mt-1 truncate text-[11px] text-sidebar-foreground/60">Super Admin</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to} to={item.to} onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function UserMenu() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const signOut = useMutation({
    mutationFn: async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); },
    onSuccess: () => router.navigate({ to: "/auth", replace: true }),
  });
  const initial = (user?.email?.[0] ?? "A").toUpperCase();
  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} className="min-h-10 gap-2 rounded-full pl-1 pr-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground shadow-soft">{initial}</div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-pop">
            <div className="border-b border-border/60 px-3 py-2.5">
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <button onClick={() => { setOpen(false); signOut.mutate(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-destructive/15 hover:text-destructive">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
