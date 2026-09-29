import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface TenantMembership {
  tenant_id: string;
  role: "admin" | "evaluator" | "viewer";
  tenant: {
    id: string;
    name: string;
    type: string;
    logo_url: string | null;
    plan_id: string;
    display_name: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    description: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
  };
}

export function useMyMemberships() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["my-memberships", user?.id],
    enabled: !!user && !loading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select("tenant_id, role, tenant:tenants(id,name,type,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TenantMembership[];
    },
  });
}

export function useProfile() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user && !loading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCurrentTenant() {
  const profile = useProfile();
  const memberships = useMyMemberships();
  const currentTenantId = profile.data?.current_tenant_id ?? null;
  const impersonatingId = profile.data?.impersonating_tenant_id ?? null;
  const qc = useQueryClient();

  // Auto-heal: se o profile não tem current_tenant_id definido mas o usuário já tem memberships,
  // salva automaticamente a primeira membership como ativa no perfil
  useEffect(() => {
    if (
      profile.data &&
      !profile.data.current_tenant_id &&
      memberships.data &&
      memberships.data.length > 0
    ) {
      const firstTenantId = memberships.data[0].tenant_id;
      supabase
        .from("profiles")
        .update({ current_tenant_id: firstTenantId })
        .eq("id", profile.data.id)
        .then(() => {
          qc.invalidateQueries({ queryKey: ["profile"] });
        });
    }
  }, [profile.data?.current_tenant_id, profile.data?.id, memberships.data, qc]);

  // When a platform admin impersonates a tenant they don't belong to,
  // memberships won't contain it. Fetch that tenant directly (RLS allows
  // platform admins to read any tenant).
  const fromMembership =
    memberships.data?.find((m) => m.tenant_id === currentTenantId) ?? null;
  const needsDirectFetch = !!currentTenantId && !fromMembership;

  const impersonatedTenantQ = useQuery({
    queryKey: ["impersonated-tenant", currentTenantId],
    enabled: needsDirectFetch,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id,name,type,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone")
        .eq("id", currentTenantId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const current =
    fromMembership ??
    (impersonatedTenantQ.data
      ? {
          tenant_id: impersonatedTenantQ.data.id,
          role: "admin" as const,
          tenant: impersonatedTenantQ.data as TenantMembership["tenant"],
        }
      : memberships.data?.[0] ?? null);

  const isLoading =
    profile.isLoading ||
    memberships.isLoading ||
    memberships.isFetching ||
    (needsDirectFetch && impersonatedTenantQ.isLoading);

  return {
    tenant: current?.tenant ?? null,
    role: current?.role ?? null,
    tenantId: current?.tenant_id ?? null,
    isLoading,
    hasNoTenant:
      memberships.isSuccess &&
      !memberships.isFetching &&
      (memberships.data?.length ?? 0) === 0 &&
      !impersonatingId,
    memberships: memberships.data ?? [],
  };
}

export function useSwitchTenant() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetTenantId: string) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("profiles")
        .update({ current_tenant_id: targetTenantId })
        .eq("id", user.id);
      if (error) throw error;
      return targetTenantId;
    },
    onSuccess: async () => {
      toast.success("Organização alterada com sucesso.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["profile"] }),
        qc.invalidateQueries({ queryKey: ["my-memberships"] }),
        qc.invalidateQueries({ queryKey: ["current-tenant"] }),
      ]);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao alternar organização");
    },
  });
}
