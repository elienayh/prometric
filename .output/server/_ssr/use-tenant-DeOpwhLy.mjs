import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as useAuth } from "./use-auth-CwvrlDNK.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-tenant-DeOpwhLy.js
function useMyMemberships() {
	const { user, loading } = useAuth();
	return useQuery({
		queryKey: ["my-memberships", user?.id],
		enabled: !!user && !loading,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenant_members").select("tenant_id, role, tenant:tenants(id,name,type,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone)").eq("user_id", user.id).order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useProfile() {
	const { user, loading } = useAuth();
	return useQuery({
		queryKey: ["profile", user?.id],
		enabled: !!user && !loading,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
}
function useCurrentTenant() {
	const profile = useProfile();
	const memberships = useMyMemberships();
	const currentTenantId = profile.data?.current_tenant_id ?? null;
	const impersonatingId = profile.data?.impersonating_tenant_id ?? null;
	const fromMembership = memberships.data?.find((m) => m.tenant_id === currentTenantId) ?? null;
	const needsDirectFetch = !!currentTenantId && !fromMembership;
	const impersonatedTenantQ = useQuery({
		queryKey: ["impersonated-tenant", currentTenantId],
		enabled: needsDirectFetch,
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("id,name,type,logo_url,plan_id,display_name,primary_color,secondary_color,description,website,email,phone").eq("id", currentTenantId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const current = fromMembership ?? (impersonatedTenantQ.data ? {
		tenant_id: impersonatedTenantQ.data.id,
		role: "admin",
		tenant: impersonatedTenantQ.data
	} : memberships.data?.[0] ?? null);
	const isLoading = profile.isLoading || memberships.isLoading || memberships.isFetching || needsDirectFetch && impersonatedTenantQ.isLoading;
	return {
		tenant: current?.tenant ?? null,
		role: current?.role ?? null,
		tenantId: current?.tenant_id ?? null,
		isLoading,
		hasNoTenant: memberships.isSuccess && !memberships.isFetching && (memberships.data?.length ?? 0) === 0 && !impersonatingId,
		memberships: memberships.data ?? []
	};
}
//#endregion
export { useProfile as n, useCurrentTenant as t };
