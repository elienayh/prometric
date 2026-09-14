import { useQuery } from "@tanstack/react-query";
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

