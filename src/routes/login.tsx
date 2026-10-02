import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthScreen } from "./auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — ProMetric" }] }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;
    const { data: roles } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .limit(1);
    throw redirect({ to: roles && roles.length > 0 ? "/admin" : "/dashboard" });
  },
  component: () => <AuthScreen initialMode="signin" />,
});