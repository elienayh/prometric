import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { SUPER_ADMIN_EMAILS } from "@/hooks/use-admin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const email = data.user.email?.toLowerCase();
    const isOwner = !!email && SUPER_ADMIN_EMAILS.includes(email);

    const { data: roles } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (!isOwner && (!roles || roles.length === 0)) throw redirect({ to: "/dashboard" });
    const adminRoles = (roles ?? []).map((r) => r.role);
    if (isOwner && !adminRoles.includes("super_admin")) {
      adminRoles.push("super_admin");
    }
    return { user: data.user, adminRoles };
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
