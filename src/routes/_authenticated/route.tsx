import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;

    // 1. Tenta obter a sessão ativa imediatamente (do storage local)
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user;

    // 2. Se não houver sessão ativa em cache, tenta validar no servidor Supabase
    if (!user) {
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (!error && userData?.user) {
          user = userData.user;
        }
      } catch {
        /* ignora falha de rede temporária se sessão ainda puder existir */
      }
    }

    if (!user) {
      const redirectPath = location.pathname + location.search;
      throw redirect({
        to: "/auth",
        search: redirectPath && redirectPath !== "/" ? { redirect: redirectPath } : undefined,
      });
    }

    return { user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
