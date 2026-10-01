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
      const results: TenantMembership[] = [];
      const seenTenantIds = new Set<string>();

      // 1. Membros registrados em tenant_members
      try {
        const { data, error } = await supabase
          .from("tenant_members")
          .select("tenant_id, role, tenant:tenants(id,name,type,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: true });

        if (!error && data) {
          for (const m of data as unknown as TenantMembership[]) {
            if (m.tenant && !seenTenantIds.has(m.tenant_id)) {
              seenTenantIds.add(m.tenant_id);
              results.push(m);
            }
          }
        }
      } catch (err) {
        console.warn("[useMyMemberships] Erro ao buscar tenant_members:", err);
      }

      // 2. Tenants onde o usuário logado é o proprietário/criador (owner_id ou email)
      try {
        const { data: ownedTenants, error: ownErr } = await supabase
          .from("tenants")
          .select("id,name,type,owner_id,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone")
          .eq("owner_id", user!.id);

        if (!ownErr && ownedTenants) {
          for (const t of ownedTenants) {
            if (!seenTenantIds.has(t.id)) {
              seenTenantIds.add(t.id);
              results.push({
                tenant_id: t.id,
                role: "admin",
                tenant: t,
              });

              // Auto-heal: matricula em tenant_members para integridade permanente
              supabase
                .from("tenant_members")
                .upsert({ tenant_id: t.id, user_id: user!.id, role: "admin" })
                .then(() => {});
            }
          }
        }

        // Também busca se o tenant estiver cadastrado com o e-mail do usuário
        if (user!.email) {
          const { data: emailTenants } = await supabase
            .from("tenants")
            .select("id,name,type,owner_id,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone")
            .eq("email", user!.email);

          if (emailTenants) {
            for (const t of emailTenants) {
              if (!seenTenantIds.has(t.id)) {
                seenTenantIds.add(t.id);
                results.push({
                  tenant_id: t.id,
                  role: "admin",
                  tenant: t,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("[useMyMemberships] Erro ao buscar tenants owned:", err);
      }

      return results;
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
        .select("id,name,type,owner_id,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone")
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

  const isOwner =
    !!user &&
    !!current?.tenant &&
    ((current.tenant as any).owner_id === user.id ||
      ((current.tenant as any).email &&
        user.email &&
        (current.tenant as any).email.toLowerCase().trim() === user.email.toLowerCase().trim()));

  const resolvedRole = isOwner ? ("admin" as const) : (current?.role ?? null);

  return {
    tenant: current?.tenant ?? null,
    role: resolvedRole,
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
