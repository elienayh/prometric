import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type ImpersonationState = {
  tenantId: string;
  tenantName: string;
  originalTenantId: string | null;
  startedAt: string | null;
};

/**
 * Server-backed impersonation state — persists across reloads and tabs.
 * Subscribes to Realtime updates on profiles to invalidate other tabs
 * when impersonation starts or ends.
 */
export function useImpersonation(): ImpersonationState | null {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["impersonation", user?.id],
    enabled: !!user,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "impersonating_tenant_id, impersonation_original_tenant_id, impersonation_started_at, tenant:tenants!profiles_impersonating_tenant_id_fkey(id,name)",
        )
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data?.impersonating_tenant_id) return null;
      const tenant = (data as { tenant?: { id: string; name: string } | null }).tenant;
      return {
        tenantId: data.impersonating_tenant_id,
        tenantName: tenant?.name ?? "Cliente",
        originalTenantId: data.impersonation_original_tenant_id ?? null,
        startedAt: data.impersonation_started_at ?? null,
      } satisfies ImpersonationState;
    },
  });

  // Realtime: when this user's profile changes (in any tab), invalidate
  // the impersonation query + all queries so tenant-scoped data refetches.
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`impersonation:${user.id}:${Math.random().toString(36).slice(2)}`);
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
      (payload) => {
        const next = payload.new as { impersonating_tenant_id: string | null };
        const prev = payload.old as { impersonating_tenant_id: string | null } | null;
        qc.invalidateQueries({ queryKey: ["impersonation", user.id] });
        if ((prev?.impersonating_tenant_id ?? null) !== (next.impersonating_tenant_id ?? null)) {
          qc.clear();
        }
      },
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  return q.data ?? null;
}
