import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type AdminRole = "super_admin" | "admin_financeiro" | "admin_suporte" | "admin_operacional";

export function useMyAdminRoles() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["my-admin-roles", user?.id],
    enabled: !!user && !loading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AdminRole);
    },
  });
}

export function useIsPlatformAdmin() {
  const q = useMyAdminRoles();
  const roles = q.data ?? [];
  return {
    isLoading: q.isLoading,
    isAdmin: roles.length > 0,
    isSuperAdmin: roles.includes("super_admin"),
    isFinance: roles.includes("super_admin") || roles.includes("admin_financeiro"),
    isSupport: roles.includes("super_admin") || roles.includes("admin_suporte"),
    isOps: roles.includes("super_admin") || roles.includes("admin_operacional"),
    roles,
  };
}

export async function logAudit(action: string, opts: { entity_type?: string; entity_id?: string; tenant_id?: string; metadata?: Record<string, unknown> } = {}) {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("audit_logs").insert({
      actor_id: u.user.id,
      actor_email: u.user.email ?? null,
      action,
      entity_type: opts.entity_type ?? null,
      entity_id: opts.entity_id ?? null,
      tenant_id: opts.tenant_id ?? null,
      metadata: opts.metadata as never,
    });
  } catch {
    /* non-blocking */
  }
}
