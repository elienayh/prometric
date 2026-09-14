import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as useAuth } from "./use-auth-CwvrlDNK.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-admin-4ZxV4WX8.js
function useMyAdminRoles() {
	const { user, loading } = useAuth();
	return useQuery({
		queryKey: ["my-admin-roles", user?.id],
		enabled: !!user && !loading,
		queryFn: async () => {
			const { data, error } = await supabase.from("admin_roles").select("role").eq("user_id", user.id);
			if (error) throw error;
			return (data ?? []).map((r) => r.role);
		}
	});
}
function useIsPlatformAdmin() {
	const q = useMyAdminRoles();
	const roles = q.data ?? [];
	return {
		isLoading: q.isLoading,
		isAdmin: roles.length > 0,
		isSuperAdmin: roles.includes("super_admin"),
		isFinance: roles.includes("super_admin") || roles.includes("admin_financeiro"),
		isSupport: roles.includes("super_admin") || roles.includes("admin_suporte"),
		isOps: roles.includes("super_admin") || roles.includes("admin_operacional"),
		roles
	};
}
async function logAudit(action, opts = {}) {
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
			metadata: opts.metadata
		});
	} catch {}
}
//#endregion
export { useIsPlatformAdmin as n, logAudit as t };
