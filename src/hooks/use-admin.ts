import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type AdminRole = "super_admin" | "admin_financeiro" | "admin_suporte" | "admin_operacional";

export const SUPER_ADMIN_EMAILS = [
  "elienayhemerson@gmail.com",
  "elienay9080@gmail.com",
  "elienay.domingues@educacao.mg.gov.br",
];

export function useMyAdminRoles() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["my-admin-roles", user?.id],
    enabled: !!user && !loading,
    queryFn: async () => {
      const userEmail = user?.email?.toLowerCase();
      const isOwner = !!userEmail && SUPER_ADMIN_EMAILS.includes(userEmail);

      const { data, error } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", user!.id);

      if (error) {
        if (isOwner) return ["super_admin" as AdminRole];
        throw error;
      }

      const roles = (data ?? []).map((r) => r.role as AdminRole);
      if (isOwner && !roles.includes("super_admin")) {
        roles.push("super_admin");
      }
      return roles;
    },
  });
}

export function useIsPlatformAdmin() {
  const { user, loading } = useAuth();
  const q = useMyAdminRoles();
  const dbRoles = q.data ?? [];
  const userEmail = user?.email?.toLowerCase();
  const isOwner = !!userEmail && SUPER_ADMIN_EMAILS.includes(userEmail);
  const roles = isOwner && !dbRoles.includes("super_admin") ? [...dbRoles, "super_admin" as AdminRole] : dbRoles;

  return {
    isLoading: q.isLoading && !isOwner,
    isAdmin: roles.length > 0 || isOwner,
    isSuperAdmin: roles.includes("super_admin") || isOwner,
    isFinance: roles.includes("super_admin") || roles.includes("admin_financeiro") || isOwner,
    isSupport: roles.includes("super_admin") || roles.includes("admin_suporte") || isOwner,
    isOps: roles.includes("super_admin") || roles.includes("admin_operacional") || isOwner,
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
