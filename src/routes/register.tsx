import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar Conta — ProMetric" }] }),
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (userId) {
        const { data: roles } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", userId)
          .limit(1);
        throw redirect({ to: roles && roles.length > 0 ? "/admin" : "/dashboard" });
      }
    }
    throw redirect({ to: "/auth", search: { mode: "signup" } });
  },
});