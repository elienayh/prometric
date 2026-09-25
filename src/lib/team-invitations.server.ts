import { supabaseAdmin } from "@/integrations/supabase/client.server";

export { supabaseAdmin };

/**
 * Garante que todo tenant possua ao menos um administrador registrado em tenant_members.
 * Se o tenant tiver owner_id, o owner é cadastrado como admin.
 * Se ainda não houver admin, busca o perfil que utiliza o tenant e o promove a admin.
 */
export async function ensureTenantAdminEnrolled(tenantId: string): Promise<string | null> {
  try {
    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .select("id, name, display_name, owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenantErr || !tenant) return null;

    // 1. Se o tenant possui owner_id, garante que ele está em tenant_members como 'admin'
    if (tenant.owner_id) {
      await supabaseAdmin.from("tenant_members").upsert(
        {
          tenant_id: tenantId,
          user_id: tenant.owner_id,
          role: "admin",
        },
        { onConflict: "tenant_id,user_id" }
      );
    }

    // 2. Verificar se já existe algum admin em tenant_members
    const { count: adminCount } = await supabaseAdmin
      .from("tenant_members")
      .select("user_id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("role", "admin");

    if (!adminCount || adminCount === 0) {
      // Procura primeiro usuário cujo current_tenant_id é este tenant
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("current_tenant_id", tenantId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (profiles && profiles.length > 0) {
        const firstUser = profiles[0];
        await supabaseAdmin.from("tenant_members").upsert(
          {
            tenant_id: tenantId,
            user_id: firstUser.id,
            role: "admin",
          },
          { onConflict: "tenant_id,user_id" }
        );

        // Se o tenant não tinha owner_id, define este primeiro usuário como owner
        if (!tenant.owner_id) {
          await supabaseAdmin
            .from("tenants")
            .update({ owner_id: firstUser.id })
            .eq("id", tenantId);
        }
        return firstUser.id;
      }
    }

    return tenant.owner_id;
  } catch (err) {
    console.warn("[ensureTenantAdminEnrolled] Aviso ao verificar admin:", err);
    return null;
  }
}

/**
 * Validação rigorosa e flexível de permissão administrativa sobre um tenant:
 * Permite se for:
 * 1) Membro com cargo 'admin' em tenant_members
 * 2) Owner_id do tenant
 * 3) Super admin da plataforma (admin_roles)
 * 4) Administrador em modo impersonação deste tenant
 */
export async function checkTenantAdminPermission(userId: string, tenantId: string): Promise<boolean> {
  // Auto-heal preventivo antes de testar permissão
  await ensureTenantAdminEnrolled(tenantId);

  // 1. Checa se é admin na tabela tenant_members
  const { data: member } = await supabaseAdmin
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (member?.role === "admin") return true;

  // 2. Checa se é o owner_id do tenant
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("owner_id")
    .eq("id", tenantId)
    .maybeSingle();

  if (tenant?.owner_id === userId) return true;

  // 3. Checa se é super admin da plataforma
  const { data: adminRole } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();

  if (adminRole) return true;

  // 4. Checa se está impersonando este tenant
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("impersonating_tenant_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.impersonating_tenant_id === tenantId) return true;

  return false;
}
